"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Loader2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { gemstones } from "@/data/gemstones";
import { site, waLink } from "@/lib/site";

type Fields = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  gemstone: string;
  budget: string;
  message: string;
  consent: boolean;
  website: string;
};

type Errors = Partial<Record<keyof Fields, string>> & { form?: string };

const initialFields: Fields = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  gemstone: "",
  budget: "",
  message: "",
  consent: false,
  website: "",
};

/** Window event used by other sections to prefill the enquiry message. */
export const ENQUIRY_PREFILL_EVENT = "kgi:enquiry-prefill";

export type EnquiryPrefill = { message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const phonePattern = /^[+()\d][\d\s().-]{5,31}$/;

function validate(fields: Fields): Errors {
  const errors: Errors = {};
  if (fields.fullName.trim().length < 2) {
    errors.fullName = "Please enter your full name.";
  }
  if (!emailPattern.test(fields.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!phonePattern.test(fields.phone.trim())) {
    errors.phone = "Please enter a valid phone or WhatsApp number.";
  }
  if (fields.country.trim().length < 2) {
    errors.country = "Please enter your country.";
  }
  if (fields.message.trim().length < 10) {
    errors.message =
      "Please share a little more detail (at least 10 characters).";
  }
  if (!fields.consent) {
    errors.consent =
      "Please confirm that we may contact you about this enquiry.";
  }
  return errors;
}

const fieldOrder: Array<keyof Fields> = [
  "fullName",
  "email",
  "phone",
  "country",
  "gemstone",
  "budget",
  "message",
  "consent",
];

export default function EnquiryForm({
  defaultStone = "",
  compact = false,
}: {
  defaultStone?: string;
  compact?: boolean;
}) {
  const initialGemstone =
    gemstones.find((gem) => gem.reference === defaultStone)?.reference ?? "";
  const [fields, setFields] = useState<Fields>({
    ...initialFields,
    gemstone: initialGemstone,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [reference, setReference] = useState("");
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    const onPrefill = (event: Event) => {
      const detail = (event as CustomEvent<EnquiryPrefill>).detail;
      if (!detail?.message) return;
      setFields((current) => ({ ...current, message: detail.message }));
      setErrors((current) => ({ ...current, message: undefined }));
      setStatus((current) => (current === "success" ? "idle" : current));
      document.getElementById("message")?.focus({ preventScroll: true });
    };
    window.addEventListener(ENQUIRY_PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(ENQUIRY_PREFILL_EVENT, onPrefill);
  }, []);

  const setField = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const focusFirstError = (nextErrors: Errors) => {
    const first = fieldOrder.find((field) => nextErrors[field]);
    if (!first) return;
    const element = formRef.current?.querySelector<HTMLElement>(
      `[name="${first}"]`,
    );
    element?.focus();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerMessage("");
    const nextErrors = validate(fields);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      return;
    }

    setStatus("submitting");
    const selected = gemstones.find((gem) => gem.reference === fields.gemstone);
    const gemstoneLabel = selected
      ? `${selected.name} (${selected.reference})`
      : "General enquiry / not sure yet";

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: fields.fullName,
          email: fields.email,
          phone: fields.phone,
          country: fields.country,
          gemstone: gemstoneLabel,
          budget: fields.budget,
          message: fields.message,
          consent: fields.consent,
          website: fields.website,
          startedAt: startedAt.current,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            message?: string;
            reference?: string;
            fieldErrors?: Record<string, string>;
          }
        | null;

      if (!response.ok || !data?.ok) {
        setStatus("error");
        setServerMessage(
          data?.message ??
            "We could not send your enquiry. Please try again, or contact us by WhatsApp.",
        );
        if (data?.fieldErrors) {
          setErrors(data.fieldErrors as Errors);
          focusFirstError(data.fieldErrors as Errors);
        }
        return;
      }

      setReference(data.reference ?? "");
      setStatus("success");
      requestAnimationFrame(() => successRef.current?.focus());
    } catch {
      setStatus("error");
      setServerMessage(
        "A network error interrupted your enquiry. Please check your connection and try again.",
      );
    }
  };

  if (status === "success") {
    return (
      <div
        className="border border-gold/30 bg-[#08131f] p-7 sm:p-10"
        role="status"
        aria-live="polite"
      >
        <div className="flex h-12 w-12 items-center justify-center border border-gold/40 text-gold">
          <Check className="h-5 w-5" aria-hidden />
        </div>
        <h3
          ref={successRef}
          tabIndex={-1}
          className="display mt-6 text-[clamp(1.9rem,3vw,2.6rem)] text-ivory outline-none"
        >
          Your enquiry has been received.
        </h3>
        <p className="mt-4 max-w-md text-[0.88rem] leading-[1.8] text-ivory/58">
          Thank you, {fields.fullName.split(" ")[0] || "and welcome"}. Our team
          will contact you directly at{" "}
          <span className="text-ivory/80">{fields.email}</span>. If your enquiry
          concerns a listed stone, please keep the reference below.
        </p>
        {reference && (
          <div className="mt-6 inline-flex flex-wrap items-center gap-x-4 gap-y-1 border border-gold/20 bg-gold/[0.04] px-4 py-3">
            <span className="text-[0.72rem] uppercase tracking-[0.2em] text-ivory/62">
              Enquiry reference
            </span>
            <span className="text-[0.82rem] tracking-[0.12em] text-gold-soft">
              {reference}
            </span>
          </div>
        )}
        <p className="mt-5 text-[0.72rem] leading-relaxed text-ivory/62">
          We aim to respond personally. For an immediate conversation, message
          our team on WhatsApp.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={waLink(
              `Hello ${site.name}, I have just submitted enquiry ${reference || ""}. I would like to follow up.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--solid btn--sm"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
            Follow up on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              setFields({ ...initialFields, gemstone: initialGemstone });
              setErrors({});
              setReference("");
              setStatus("idle");
              startedAt.current = Date.now();
            }}
            className="btn btn--ghost btn--sm"
          >
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className={`relative border border-gold/20 bg-[#08131f] p-6 sm:p-8 ${
        compact ? "" : "lg:p-10"
      }`}
    >
      <div className="mb-7 flex items-center gap-3 border-b border-gold/15 pb-5">
        <ShieldCheck className="h-4 w-4 text-gold/80" aria-hidden />
        <p className="text-[0.72rem] uppercase tracking-[0.2em] text-ivory/72">
          Private and confidential · No obligation
        </p>
      </div>

      {(status === "error" || serverMessage) && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 border border-[#e08a7c]/40 bg-[#e08a7c]/[0.06] p-4 text-[0.8rem] leading-relaxed text-[#f0b3a8]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{serverMessage}</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="fullName">
            Full name <span className="req">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={fields.fullName}
            onChange={(event) => setField("fullName", event.target.value)}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            required
          />
          {errors.fullName && (
            <p id="fullName-error" className="field-error">
              {errors.fullName}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="email">
            Email address <span className="req">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={fields.email}
            onChange={(event) => setField("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            required
          />
          {errors.email && (
            <p id="email-error" className="field-error">
              {errors.email}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="phone">
            Phone or WhatsApp <span className="req">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+94 77 000 0000"
            value={fields.phone}
            onChange={(event) => setField("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            required
          />
          {errors.phone && (
            <p id="phone-error" className="field-error">
              {errors.phone}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="country">
            Country <span className="req">*</span>
          </label>
          <input
            id="country"
            name="country"
            type="text"
            autoComplete="country-name"
            value={fields.country}
            onChange={(event) => setField("country", event.target.value)}
            aria-invalid={Boolean(errors.country)}
            aria-describedby={errors.country ? "country-error" : undefined}
            required
          />
          {errors.country && (
            <p id="country-error" className="field-error">
              {errors.country}
            </p>
          )}
        </div>

        <div className="field sm:col-span-2">
          <label htmlFor="gemstone">Gemstone of interest</label>
          <select
            id="gemstone"
            name="gemstone"
            value={fields.gemstone}
            onChange={(event) => setField("gemstone", event.target.value)}
          >
            <option value="">General enquiry / not sure yet</option>
            {gemstones.map((gem) => (
              <option
                key={gem.reference}
                value={gem.reference}
                disabled={gem.status === "Reserved"}
              >
                {gem.name} — {gem.reference}
                {gem.status === "Reserved" ? " (reserved)" : ""}
              </option>
            ))}
          </select>
          <p className="field-hint">
            Selecting a stone includes its reference with your enquiry.
          </p>
        </div>

        <div className="field sm:col-span-2">
          <label htmlFor="budget">Budget range (optional)</label>
          <input
            id="budget"
            name="budget"
            type="text"
            placeholder="e.g. USD 2,000–5,000"
            value={fields.budget}
            onChange={(event) => setField("budget", event.target.value)}
          />
        </div>

        <div className="field sm:col-span-2">
          <label htmlFor="message">
            Message <span className="req">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            placeholder="Tell us the colour, size, gemstone family or occasion you have in mind."
            value={fields.message}
            onChange={(event) => setField("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            required
          />
          {errors.message && (
            <p id="message-error" className="field-error">
              {errors.message}
            </p>
          )}
        </div>
      </div>

      {/* Honeypot — hidden from visitors and assistive technology. */}
      <div className="pointer-events-none absolute -left-[10000px] top-0 h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={fields.website}
          onChange={(event) => setField("website", event.target.value)}
        />
      </div>

      <div className="mt-6">
        <label className="checkbox-row" htmlFor="consent">
          <input
            type="checkbox"
            id="consent"
            name="consent"
            checked={fields.consent}
            onChange={(event) => setField("consent", event.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "consent-error" : undefined}
          />
          <span>
            I agree to be contacted about this enquiry and have read the{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </span>
        </label>
        {errors.consent && (
          <p id="consent-error" className="field-error mt-2">
            {errors.consent}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className={`btn btn--solid mt-7 w-full ${
          status === "submitting" ? "btn--loading" : ""
        }`}
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Sending your enquiry…
          </>
        ) : (
          <>
            Send Private Enquiry
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </>
        )}
      </button>

      <p className="mt-4 text-center text-[0.8rem] leading-relaxed text-ivory/62">
        Your details are used only to respond to this enquiry. We never sell
        personal information.
      </p>
    </form>
  );
}
