import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildInvestmentEnquiryMessage,
  calculateInvestmentPlans,
  calculatePlan,
  formatAmount,
  formatLkr,
  investmentConfig,
  parseInvestmentAmount,
} from "./investment.ts";

const threeMonth = investmentConfig.plans[0];
const sixMonth = investmentConfig.plans[1];

function centsOf(raw: string): number {
  const result = parseInvestmentAmount(raw);
  assert.equal(result.ok, true, `expected "${raw}" to be accepted`);
  return (result as { ok: true; cents: number }).cents;
}

test("configuration holds the published rates and minimum", () => {
  assert.equal(investmentConfig.minimumInvestment, 500_000);
  assert.equal(threeMonth.statedReturnPercent, 25);
  assert.equal(threeMonth.durationMonths, 3);
  assert.equal(sixMonth.statedReturnPercent, 50);
  assert.equal(sixMonth.durationMonths, 6);
});

test("default minimum investment matches the example figures", () => {
  const cents = centsOf("500000");
  const [three, six] = calculateInvestmentPlans(cents);

  assert.equal(three.profitCents, 12_500_000);
  assert.equal(formatLkr(three.profitCents), "LKR 125,000.00");
  assert.equal(formatLkr(three.totalCents), "LKR 625,000.00");

  assert.equal(six.profitCents, 25_000_000);
  assert.equal(formatLkr(six.profitCents), "LKR 250,000.00");
  assert.equal(formatLkr(six.totalCents), "LKR 750,000.00");
});

test("LKR 1,000,000.00 gives the expected 3- and 6-month results", () => {
  const cents = centsOf("1,000,000");
  const [three, six] = calculateInvestmentPlans(cents);

  assert.equal(formatLkr(three.profitCents), "LKR 250,000.00");
  assert.equal(formatLkr(three.totalCents), "LKR 1,250,000.00");
  assert.equal(formatLkr(six.profitCents), "LKR 500,000.00");
  assert.equal(formatLkr(six.totalCents), "LKR 1,500,000.00");
});

test("returns are simple percentages of the original principal", () => {
  const plan = calculatePlan(centsOf("2000000"), sixMonth);
  // Simple, not compounded: 50% of 2,000,000 once, never applied again.
  assert.equal(plan.profitCents, 100_000_000);
  assert.equal(plan.totalCents, 300_000_000);
});

test("fractional amounts keep cent precision", () => {
  // 500,000.01 at 25% = 125,000.0025, rounded to the nearest cent.
  const [three] = calculateInvestmentPlans(centsOf("500000.01"));
  assert.equal(formatLkr(three.principalCents), "LKR 500,000.01");
  assert.equal(formatLkr(three.profitCents), "LKR 125,000.00");
  assert.equal(formatLkr(three.totalCents), "LKR 625,000.01");
});

test("accepts commas, decimals and whitespace", () => {
  assert.equal(centsOf("  500,000  "), 50_000_000);
  assert.equal(centsOf("500000.5"), 50_000_050);
  assert.equal(centsOf("1,000,000.00"), 100_000_000);
  assert.equal(centsOf("100000000"), 10_000_000_000);
});

test("accepts exactly the minimum and maximum", () => {
  assert.equal(centsOf("500000"), investmentConfig.minimumInvestment * 100);
  assert.equal(
    centsOf(String(investmentConfig.maximumInvestment)),
    investmentConfig.maximumInvestment * 100,
  );
});

test("rejects empty and whitespace-only input", () => {
  for (const raw of ["", "   "]) {
    const result = parseInvestmentAmount(raw);
    assert.equal(result.ok, false);
    assert.match(result.ok ? "" : result.message, /Please enter/);
  }
});

test("rejects amounts below the minimum", () => {
  const result = parseInvestmentAmount("499999.99");
  assert.equal(result.ok, false);
  assert.match(
    result.ok ? "" : result.message,
    /minimum investment is LKR 500,000\.00/,
  );
  assert.equal(parseInvestmentAmount("0").ok, false);
});

test("rejects negative amounts", () => {
  const result = parseInvestmentAmount("-500000");
  assert.equal(result.ok, false);
  assert.match(result.ok ? "" : result.message, /cannot be negative/);
});

test("rejects invalid and non-finite text", () => {
  for (const raw of ["abc", "1e6", "NaN", "Infinity", "5 00000", "1.2.3", "+500000"]) {
    const result = parseInvestmentAmount(raw);
    assert.equal(result.ok, false, `expected "${raw}" to be rejected`);
  }
});

test("a trailing decimal point reads as whole rupees", () => {
  assert.equal(centsOf("500000."), 50_000_000);
});

test("rejects more than two decimal places", () => {
  const result = parseInvestmentAmount("500000.001");
  assert.equal(result.ok, false);
  assert.match(result.ok ? "" : result.message, /two decimal places/);
});

test("rejects amounts above the configured maximum without overflow", () => {
  const result = parseInvestmentAmount("100000000.01");
  assert.equal(result.ok, false);
  assert.match(result.ok ? "" : result.message, /maximum investment/);

  const huge = parseInvestmentAmount("9".repeat(400));
  assert.equal(huge.ok, false);
});

test("formats amounts with separators and two decimals", () => {
  assert.equal(formatAmount(50_000_000), "500,000.00");
  assert.equal(formatAmount(10_000_000_000), "100,000,000.00");
  assert.equal(formatAmount(5), "0.05");
  assert.equal(formatLkr(0), "LKR 0.00");
});

test("enquiry message matches the agreed format", () => {
  const [three] = calculateInvestmentPlans(centsOf("500000"));
  assert.equal(
    buildInvestmentEnquiryMessage(three),
    [
      "Investment Calculator Enquiry",
      "Selected plan: 3 months",
      "Investment amount: LKR 500,000.00",
      "Stated return rate: 25%",
      "Illustrative projected profit: LKR 125,000.00",
      "Illustrative projected total: LKR 625,000.00",
    ].join("\n"),
  );
});
