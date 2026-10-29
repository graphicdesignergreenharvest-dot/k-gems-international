/**
 * Investment calculator configuration and pure helpers.
 *
 * All money is handled as integer cents internally so that percentage
 * calculations stay exact. Update rates and limits only in
 * `investmentConfig`; the calculator UI reads everything from here.
 *
 * The stated returns are simple percentages of the original principal.
 * They are illustrative only and are not guarantees.
 */

export type InvestmentPlanConfig = {
  id: string;
  label: string;
  durationMonths: number;
  statedReturnPercent: number;
};

export const investmentConfig = {
  currency: "LKR",
  /** Minimum investment in LKR. */
  minimumInvestment: 500_000,
  /** Upper limit accepted by the calculator, in LKR. */
  maximumInvestment: 100_000_000,
  /** Range slider bounds, in LKR. Amounts above the slider maximum can still be typed. */
  sliderMaximum: 10_000_000,
  /** Step of the range slider, in LKR. */
  sliderStep: 10_000,
  plans: [
    {
      id: "3-month",
      label: "3-Month Plan",
      durationMonths: 3,
      statedReturnPercent: 25,
    },
    {
      id: "6-month",
      label: "6-Month Plan",
      durationMonths: 6,
      statedReturnPercent: 50,
    },
  ] satisfies InvestmentPlanConfig[],
};

export type InvestmentPlanResult = InvestmentPlanConfig & {
  principalCents: number;
  profitCents: number;
  totalCents: number;
};

export type ParseResult =
  | { ok: true; cents: number }
  | { ok: false; message: string };

const minimumCents = investmentConfig.minimumInvestment * 100;
const maximumCents = investmentConfig.maximumInvestment * 100;

/** Formats integer cents as "500,000.00". */
export function formatAmount(cents: number): string {
  const whole = Math.floor(cents / 100);
  const fraction = cents % 100;
  const grouped = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${grouped}.${String(fraction).padStart(2, "0")}`;
}

/** Formats integer cents as "LKR 500,000.00". */
export function formatLkr(cents: number): string {
  return `${investmentConfig.currency} ${formatAmount(cents)}`;
}

/**
 * Parses a user-typed amount into integer cents.
 * Accepts digits with optional thousands commas and up to two decimal places.
 * Invalid input is reported, never replaced with a different value.
 */
export function parseInvestmentAmount(raw: string): ParseResult {
  const cleaned = raw.trim().replace(/,/g, "");

  if (cleaned === "") {
    return { ok: false, message: "Please enter an investment amount." };
  }
  if (cleaned.startsWith("-")) {
    return { ok: false, message: "Investment amounts cannot be negative." };
  }
  if (!/^\d+(\.\d*)?$/.test(cleaned)) {
    return {
      ok: false,
      message: "Please enter the amount as a number, for example 500,000.00.",
    };
  }

  const [wholePart, fractionPart = ""] = cleaned.split(".");
  if (fractionPart.length > 2) {
    return {
      ok: false,
      message: "Please enter no more than two decimal places.",
    };
  }

  const cents =
    Number(wholePart) * 100 + Number(fractionPart.padEnd(2, "0"));
  if (!Number.isFinite(cents)) {
    return {
      ok: false,
      message: "Please enter the amount as a number, for example 500,000.00.",
    };
  }
  if (cents < minimumCents) {
    return {
      ok: false,
      message: `The minimum investment is ${formatLkr(minimumCents)}.`,
    };
  }
  if (cents > maximumCents) {
    return {
      ok: false,
      message: `The maximum investment through this calculator is ${formatLkr(
        maximumCents,
      )}.`,
    };
  }

  return { ok: true, cents };
}

/** Simple (non-compounded) projection on the original principal. */
export function calculatePlan(
  principalCents: number,
  plan: InvestmentPlanConfig,
): InvestmentPlanResult {
  const profitCents = Math.round(
    (principalCents * plan.statedReturnPercent) / 100,
  );
  return {
    ...plan,
    principalCents,
    profitCents,
    totalCents: principalCents + profitCents,
  };
}

export function calculateInvestmentPlans(
  principalCents: number,
): InvestmentPlanResult[] {
  return investmentConfig.plans.map((plan) =>
    calculatePlan(principalCents, plan),
  );
}

/** Enquiry text prefilled into the private enquiry form. */
export function buildInvestmentEnquiryMessage(
  plan: InvestmentPlanResult,
): string {
  return [
    "Investment Calculator Enquiry",
    `Selected plan: ${plan.durationMonths} months`,
    `Investment amount: ${formatLkr(plan.principalCents)}`,
    `Stated return rate: ${plan.statedReturnPercent}%`,
    `Illustrative projected profit: ${formatLkr(plan.profitCents)}`,
    `Illustrative projected total: ${formatLkr(plan.totalCents)}`,
  ].join("\n");
}
