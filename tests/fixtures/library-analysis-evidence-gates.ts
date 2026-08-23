import { createHash } from "node:crypto";

export const pilotPartialQuote = {
  claim: "3.1 million litres were used and represented 28 percent of subsidised milk.",
  evidence: "3.1 million litres",
  sourceText:
    "The programme used 3.1 million litres and represented 28 percent of subsidised milk.",
  locator: "document:pilot:section:school-milk",
};

export const numericMismatchCases = [
  {
    name: "percentage point versus percent",
    claim: "The share increased by 5 percentage points.",
    evidence: "The share increased by 5 percent.",
  },
  {
    name: "currency",
    claim: "The programme cost NOK 10 million.",
    evidence: "The programme cost USD 10 million.",
  },
  {
    name: "unit",
    claim: "The programme distributed 10 tonnes.",
    evidence: "The programme distributed 10 kilograms.",
  },
  {
    name: "sign",
    claim: "The balance changed by -5 percent.",
    evidence: "The balance changed by 5 percent.",
  },
  {
    name: "year",
    claim: "The result was measured in 2024.",
    evidence: "The result was measured in 2023.",
  },
  {
    name: "period",
    claim: "The programme supplied 10 tonnes per year.",
    evidence: "The programme supplied 10 tonnes per month.",
  },
  {
    name: "geography",
    claim: "The programme supplied 10 tonnes in Norway.",
    evidence: "The programme supplied 10 tonnes in Sweden.",
  },
] as const;

export function sha256(value: string): string {
  return createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex");
}
