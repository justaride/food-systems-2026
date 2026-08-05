import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Scoped opprydding: sletter KUN innhentingssesjonens egne rader (src-innh-/cit-innh-2026-08-05*)
// så importen kan bygge en ren, deterministisk tilstand. Rører ALDRI pre-eksisterende data.
// Citations først (FK til SourceDoc), deretter SourceDoc.

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const cit = await prisma.sourceCitation.deleteMany({ where: { id: { startsWith: 'cit-innh-2026-08-05' } } })
  const doc = await prisma.sourceDoc.deleteMany({ where: { id: { startsWith: 'src-innh-2026-08-05' } } })
  console.log(`CLEAN: slettet ${cit.count} SourceCitation + ${doc.count} SourceDoc (innhenting-namespace).`)
}

main().catch(e => { console.error('Clean failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
