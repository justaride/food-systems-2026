-- Report locators need the same evidence-based access timestamp already
-- available on Thesis and SourceDoc before they can be used externally.
ALTER TABLE "Report"
ADD COLUMN IF NOT EXISTS "accessedAt" TIMESTAMP(3);
