import { NextResponse } from "next/server";
import {
  decoyReference,
  isRateLimited,
  isValidOrigin,
  notifyEnquiry,
  storeEnquiry,
  validateEnquiry,
} from "@/lib/enquiry";

const MAX_BODY_BYTES = 20_000;

/**
 * Resolve the client IP for rate limiting.
 *
 * Client-sent headers are spoofable, so a fresh X-Forwarded-For value per
 * request would defeat the limit. Set ENQUIRY_TRUSTED_IP_HEADER to the header
 * your platform sets from the real connection (for example `cf-connecting-ip`
 * or `x-real-ip`). Without it, the rightmost X-Forwarded-For entry is used:
 * that is the hop appended by the nearest proxy, not something the client wrote.
 */
function clientIp(request: Request) {
  const trusted = process.env.ENQUIRY_TRUSTED_IP_HEADER?.trim().toLowerCase();
  if (trusted) {
    return request.headers.get(trusted)?.trim() || "unknown";
  }
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded.split(",");
    return hops[hops.length - 1]?.trim() || "unknown";
  }
  return "unknown";
}

/** Read the body as text, stopping as soon as it exceeds `max` bytes. */
async function readLimitedText(request: Request, max: number) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > max) {
      await reader.cancel();
      return null;
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!isValidOrigin(origin, host)) {
    return NextResponse.json(
      { ok: false, message: "This request could not be verified." },
      { status: 403, headers: { "cache-control": "no-store" } },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { ok: false, message: "Unsupported request format." },
      { status: 415, headers: { "cache-control": "no-store" } },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, message: "Your enquiry is too long to process." },
      { status: 413, headers: { "cache-control": "no-store" } },
    );
  }

  if (isRateLimited(clientIp(request))) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Too many enquiries have been sent from this connection. Please wait a few minutes or contact us by WhatsApp.",
      },
      { status: 429, headers: { "cache-control": "no-store" } },
    );
  }

  // Content-Length can be missing or wrong (chunked bodies), so enforce the cap
  // while reading the stream as well.
  let rawBody: string | null;
  try {
    rawBody = await readLimitedText(request, MAX_BODY_BYTES);
  } catch {
    rawBody = "";
  }
  if (rawBody === null) {
    return NextResponse.json(
      { ok: false, message: "Your enquiry is too long to process." },
      { status: 413, headers: { "cache-control": "no-store" } },
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { ok: false, message: "We could not read that request. Please try again." },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { ok: false, message: "Please complete the enquiry form." },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }

  const input = payload as Record<string, unknown>;

  // Honeypot: real visitors never see or fill this field. Answer exactly like a
  // real success so bots cannot tell the difference, and store nothing.
  if (typeof input.website === "string" && input.website.trim().length > 0) {
    return NextResponse.json(
      {
        ok: true,
        reference: decoyReference(),
        message:
          "Your enquiry has been received. Our team will contact you directly.",
      },
      { status: 201, headers: { "cache-control": "no-store" } },
    );
  }

  const result = validateEnquiry(input);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please check the highlighted fields and try again.",
        fieldErrors: result.fieldErrors,
      },
      { status: 422, headers: { "cache-control": "no-store" } },
    );
  }

  let record;
  try {
    record = await storeEnquiry(result.data);
  } catch (error) {
    console.error("[enquiry] failed to persist enquiry", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "We could not record your enquiry just now. Please try again, or contact us directly by WhatsApp or email.",
      },
      { status: 500, headers: { "cache-control": "no-store" } },
    );
  }

  void notifyEnquiry(record);

  return NextResponse.json(
    {
      ok: true,
      reference: record.reference,
      message:
        "Your enquiry has been received. Our team will contact you directly.",
    },
    { status: 201, headers: { "cache-control": "no-store" } },
  );
}

export function GET() {
  return NextResponse.json(
    { ok: false, message: "Method not allowed." },
    { status: 405, headers: { allow: "POST", "cache-control": "no-store" } },
  );
}
