import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type EnquiryInput = {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  country?: unknown;
  gemstone?: unknown;
  budget?: unknown;
  message?: unknown;
  consent?: unknown;
  website?: unknown;
  startedAt?: unknown;
};

export type EnquiryField =
  | "fullName"
  | "email"
  | "phone"
  | "country"
  | "gemstone"
  | "budget"
  | "message"
  | "consent"
  | "form";

export type ValidationResult =
  | { ok: true; data: EnquiryData }
  | { ok: false; fieldErrors: Partial<Record<EnquiryField, string>> };

export type EnquiryData = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  gemstone: string;
  budget: string;
  message: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const phonePattern = /^[+()\d][\d\s().-]{5,31}$/;

function text(value: unknown, max: number) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max)
    : "";
}

export function validateEnquiry(input: EnquiryInput): ValidationResult {
  const data: EnquiryData = {
    fullName: text(input.fullName, 120),
    email: text(input.email, 254).toLowerCase(),
    phone: text(input.phone, 32),
    country: text(input.country, 80),
    gemstone: text(input.gemstone, 160),
    budget: text(input.budget, 80),
    message: text(input.message, 4000),
  };

  const fieldErrors: Partial<Record<EnquiryField, string>> = {};

  if (data.fullName.length < 2) {
    fieldErrors.fullName = "Please enter your full name.";
  }
  if (!emailPattern.test(data.email)) {
    fieldErrors.email = "Please enter a valid email address.";
  }
  if (!phonePattern.test(data.phone)) {
    fieldErrors.phone = "Please enter a valid phone or WhatsApp number.";
  }
  if (data.country.length < 2) {
    fieldErrors.country = "Please enter your country.";
  }
  if (data.message.length < 10) {
    fieldErrors.message =
      "Please tell us a little about what you are looking for (at least 10 characters).";
  }
  if (input.consent !== true) {
    fieldErrors.consent = "Please confirm that we may contact you about this enquiry.";
  }
  if (typeof input.startedAt === "number") {
    const elapsed = Date.now() - input.startedAt;
    if (elapsed < 1200) {
      fieldErrors.form =
        "Please take a moment to review your enquiry before submitting.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  return { ok: true, data };
}

/* ------------------------------ rate limit ------------------------------ */

const attempts = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(key, recent);
    return true;
  }
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 2000) {
    for (const [mapKey, times] of attempts) {
      if (times.every((time) => now - time > WINDOW_MS)) attempts.delete(mapKey);
    }
  }
  return false;
}

/* ----------------------------- persistence ------------------------------ */

const dataDir = path.join(process.cwd(), ".data");
const enquiriesFile = path.join(dataDir, "enquiries.jsonl");

export type StoredEnquiry = EnquiryData & {
  id: string;
  reference: string;
  receivedAt: string;
  source: string;
};

function makeReference(now: Date) {
  return `KGI-ENQ-${now
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, "")}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
}

/** A reference shaped like a real one, for replies to honeypot submissions. */
export function decoyReference() {
  return makeReference(new Date());
}

export async function storeEnquiry(
  data: EnquiryData,
  source = "website",
): Promise<StoredEnquiry> {
  const now = new Date();
  const reference = makeReference(now);

  const record: StoredEnquiry = {
    ...data,
    id: crypto.randomUUID(),
    reference,
    receivedAt: now.toISOString(),
    source,
  };

  await fs.mkdir(dataDir, { recursive: true });
  await fs.appendFile(enquiriesFile, `${JSON.stringify(record)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });

  return record;
}

/* --------------------------- optional webhook --------------------------- */

export async function notifyEnquiry(record: StoredEnquiry) {
  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (!webhook) return { delivered: false, reason: "not_configured" as const };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.ENQUIRY_WEBHOOK_SECRET
          ? { authorization: `Bearer ${process.env.ENQUIRY_WEBHOOK_SECRET}` }
          : {}),
      },
      body: JSON.stringify(record),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return { delivered: response.ok, reason: response.status };
  } catch (error) {
    console.error("[enquiry] webhook delivery failed", error);
    return { delivered: false, reason: "request_failed" as const };
  }
}

export function isValidOrigin(origin: string | null, host: string | null) {
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    if (host && originUrl.host === host) return true;
    const configured = process.env.NEXT_PUBLIC_SITE_URL;
    if (configured && originUrl.origin === new URL(configured).origin) return true;
    return false;
  } catch {
    return false;
  }
}
