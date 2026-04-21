-- Additive schema fix applied to production 2026-04-21.
-- Prisma-modellen Subsidy inneholder scheme/kommuneNr/source, men produksjon
-- manglet disse kolonnene. db:import:companies feilet med P2022 til fiksen var
-- kjørt. Denne migrasjonen kodifiserer det som ble gjort manuelt, slik at nye
-- miljøer kan bringes i samsvar med Prisma-skjemaet uten ad hoc-SQL.

ALTER TABLE "Subsidy" ADD COLUMN IF NOT EXISTS "scheme" TEXT;
ALTER TABLE "Subsidy" ADD COLUMN IF NOT EXISTS "kommuneNr" TEXT;
ALTER TABLE "Subsidy" ADD COLUMN IF NOT EXISTS "source" TEXT;

CREATE INDEX IF NOT EXISTS "Subsidy_scheme_idx" ON "Subsidy"("scheme");
CREATE INDEX IF NOT EXISTS "Subsidy_year_idx" ON "Subsidy"("year");
