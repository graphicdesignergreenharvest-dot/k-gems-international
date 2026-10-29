"use client";

import { useState, type ChangeEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { ENQUIRY_PREFILL_EVENT, type EnquiryPrefill } from "@/components/enquiry/EnquiryForm";
import {
  buildInvestmentEnquiryMessage,
  calculateInvestmentPlans,
  formatAmount,
  formatLkr,
  investmentConfig,
  parseInvestmentAmount,
  type InvestmentPlanConfig,
  type InvestmentPlanResult,
} from "@/lib/investment";

const minimumLkr = investmentConfig.minimumInvestment;
const sliderMaximumLkr = investmentConfig.sliderMaximum;
const errorId = "investment-amount-error";
const hintId = "investment-amount-hint";

function openEnquiry(plan: InvestmentPlanResult) {
  window.dispatchEvent(
    new CustomEvent<EnquiryPrefill>(ENQUIRY_PREFILL_EVENT, {
      detail: { message: buildInvestmentEnquiryMessage(plan) },
    }),
  );
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  document
    .getElementById("enquiry")
    ?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
}

function PlanCard({
  plan,
  projected,
}: {
  plan: InvestmentPlanConfig;
  projected: InvestmentPlanResult | null;
}) {
  return (
    <article className="flex h-full flex-col border border-gold/20 bg-[#08131f] p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4 border-b border-gold/15 pb-5">
        <h3 className="font-serif text-[1.9rem] leading-none text-ivory">
          {plan.label}
        </h3>
        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-ivory/62">
          {plan.durationMonths} months
        </p>
      </div>

      <dl className="mt-6 space-y-5">
        <div>
          <dt className="text-[0.72rem] uppercase tracking-[0.18em] text-ivory/62">
            Investment amount
          </dt>
          <dd className="mt-1 break-words font-sans text-[1rem] tabular-nums text-ivory/88">
            {projected ? formatLkr(projected.principalCents) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[0.72rem] uppercase tracking-[0.18em] text-ivory/62">
            Stated projected return
          </dt>
          <dd className="mt-1 font-sans text-[1rem] tabular-nums text-ivory/88">
            {plan.statedReturnPercent}%
          </dd>
        </div>
        <div>
          <dt className="text-[0.72rem] uppercase tracking-[0.18em] text-gold/80">
            Projected profit
          </dt>
          <dd className="mt-1 break-words font-sans text-[1.3rem] font-medium tabular-nums text-gold-soft sm:text-[1.6rem]">
            {projected ? formatLkr(projected.profitCents) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[0.72rem] uppercase tracking-[0.18em] text-ivory/62">
            Projected total value
          </dt>
          <dd className="mt-1 break-words font-sans text-[1.3rem] font-medium tabular-nums text-ivory sm:text-[1.6rem]">
            {projected ? formatLkr(projected.totalCents) : "—"}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => projected && openEnquiry(projected)}
        disabled={!projected}
        className="btn btn--solid mt-8 w-full"
      >
        Enquire About This Plan
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      </button>
    </article>
  );
}

export default function InvestmentCalculator() {
  const [amountText, setAmountText] = useState(formatAmount(minimumLkr * 100));
  const parsed = parseInvestmentAmount(amountText);
  const plans = parsed.ok ? calculateInvestmentPlans(parsed.cents) : null;
  const sliderValue = parsed.ok
    ? Math.min(Math.round(parsed.cents / 100), sliderMaximumLkr)
    : minimumLkr;

  const onSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAmountText(formatAmount(Number(event.target.value) * 100));
  };

  const onBlur = () => {
    if (parsed.ok) setAmountText(formatAmount(parsed.cents));
  };

  return (
    <section
      id="calculator"
      className="relative overflow-hidden bg-navy"
      aria-labelledby="calculator-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-52 top-0 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(33,78,154,0.18),transparent_66%)]"
      />
      <div className="container-luxe relative section">
        <Reveal>
          <p className="eyebrow">Illustrative Projections</p>
          <h2
            id="calculator-heading"
            className="display mt-6 text-[clamp(2.7rem,5vw,4.6rem)] text-ivory"
          >
            Investment Profit
            <br />
            <span className="italic text-gold-soft/92">Calculator</span>
          </h2>
          <p className="prose-luxe mt-6 max-w-xl">
            Explore projected investment outcomes across different investment
            periods.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-12 border border-gold/20 bg-[#08131f] p-6 sm:p-8 lg:p-10">
            <div className="field">
              <label htmlFor="investment-amount">Investment Amount (LKR)</label>
              <input
                id="investment-amount"
                name="investmentAmount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={amountText}
                onChange={(event) => setAmountText(event.target.value)}
                onBlur={onBlur}
                aria-invalid={!parsed.ok}
                aria-describedby={
                  parsed.ok ? hintId : `${hintId} ${errorId}`
                }
              />
              {parsed.ok ? (
                <p id={hintId} className="field-hint">
                  Minimum investment: {formatLkr(minimumLkr * 100)}
                </p>
              ) : (
                <p id={errorId} className="field-error" role="alert">
                  {parsed.message}
                </p>
              )}
            </div>

            <div className="mt-7">
              <label
                htmlFor="investment-slider"
                className="block text-[0.72rem] uppercase tracking-[0.18em] text-ivory/62"
              >
                Adjust amount
              </label>
              <input
                id="investment-slider"
                type="range"
                min={minimumLkr}
                max={sliderMaximumLkr}
                step={investmentConfig.sliderStep}
                value={sliderValue}
                onChange={onSliderChange}
                className="mt-4 w-full cursor-pointer accent-gold"
              />
              <div className="mt-2 flex justify-between gap-4 text-[0.72rem] tabular-nums text-ivory/62">
                <span>{formatLkr(minimumLkr * 100)}</span>
                <span>{formatLkr(sliderMaximumLkr * 100)}</span>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {investmentConfig.plans.map((plan, index) => (
            <Reveal key={plan.id} delay={0.12 + index * 0.08} className="h-full">
              <PlanCard
                plan={plan}
                projected={plans?.find((result) => result.id === plan.id) ?? null}
              />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-8 border-l border-gold/40 pl-5 text-[0.8rem] leading-[1.8] text-ivory/72">
            <span className="font-medium text-ivory/88">Important:</span> This
            calculator provides illustrative estimates based on the stated
            percentage assumptions. Actual outcomes may differ. Returns are not
            guaranteed unless explicitly established under valid, approved
            contractual terms. Fees, taxes, losses, liquidity restrictions, and
            other applicable conditions are not included. Review the official
            investment agreement and associated risks before making any
            decision.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
