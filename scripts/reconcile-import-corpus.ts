import 'dotenv/config'
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const root = process.cwd()
  const scriptsDir = join(root, 'scripts')
  
  // Find all import scripts
  const files = readdirSync(scriptsDir)
    .filter(f => f.startsWith('import-') && f.endsWith('.ts'))
    
  console.log(`Found ${files.length} import scripts in scripts/`)
  
  // Registry to collect org numbers defined per script
  const scriptOrgs = new Map<string, Set<string>>()
  const allDefinedOrgs = new Set<string>()
  
  // Regular expressions to extract org numbers from code
  const orgNrPattern = /orgNr\s*:\s*['"]([^'"]+)['"]/g
  const constantOrgPattern = /['"]([89]\d{8}|(?:SE|FI|DK|IS)-[0-9-]+)['"]/g

  for (const file of files) {
    const filePath = join(scriptsDir, file)
    const content = readFileSync(filePath, 'utf8')
    const orgs = new Set<string>()
    
    // Scan for orgNr: '...'
    let match
    while ((match = orgNrPattern.exec(content)) !== null) {
      if (match[1]) {
        orgs.add(match[1].trim())
      }
    }
    
    // Scan for generic constants that look like org numbers
    let constMatch
    while ((constMatch = constantOrgPattern.exec(content)) !== null) {
      if (constMatch[1]) {
        orgs.add(constMatch[1].trim())
      }
    }
    
    if (orgs.size > 0) {
      scriptOrgs.set(file, orgs)
      for (const org of orgs) {
        allDefinedOrgs.add(org)
      }
    }
  }
  
  // Query actual companies in DB
  const dbCompanies = await prisma.company.findMany({
    select: { id: true, name: true, orgNr: true }
  })
  const dbOrgs = new Set(dbCompanies.map(c => c.orgNr))
  const dbOrgsToCompany = new Map(dbCompanies.map(c => [c.orgNr, c]))
  
  console.log(`\nDB has ${dbCompanies.size ?? dbCompanies.length} companies`)
  console.log(`Import files define ${allDefinedOrgs.size} unique org numbers`)
  
  const report: Record<string, {
    defined: number
    foundInDb: number
    missingInDb: number
    missingList: Array<{ name: string; orgNr: string }>
  }> = {}
  
  console.log('\nReconciliation per script:')
  console.log('='.repeat(80))
  
  for (const [file, orgs] of scriptOrgs.entries()) {
    const list = [...orgs]
    let found = 0
    let missing = 0
    const missingOrgs: string[] = []
    
    for (const org of list) {
      if (dbOrgs.has(org)) {
        found++
      } else {
        missing++
        missingOrgs.push(org)
      }
    }
    
    // Find names for missing orgs in the file content if possible
    const missingDetails = missingOrgs.map(org => {
      // Simple regex search for the company name associated with this orgNr in the file
      const escapedOrg = org.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      const namePattern = new RegExp(`name\\s*:\\s*['"]([^'"]+)['"]\\s*,\\s*(?:[a-zA-Z0-9_]+\\s*:\\s*[^,]+,\\s*)*orgNr\\s*:\\s*['"]${escapedOrg}['"]`, 'i')
      const nameMatch = namePattern.exec(readFileSync(join(scriptsDir, file), 'utf8'))
      const name = nameMatch ? nameMatch[1] : 'Unknown Name'
      return { name, orgNr: org }
    })
    
    report[file] = {
      defined: orgs.size,
      foundInDb: found,
      missingInDb: missing,
      missingList: missingDetails
    }
    
    console.log(`${file.padEnd(40)} | Defined: ${String(orgs.size).padEnd(4)} | In DB: ${String(found).padEnd(4)} | Missing: ${String(missing).padEnd(4)}`)
  }
  
  // Find global missing details
  const globalMissing: Array<{ file: string; orgNr: string; name: string }> = []
  for (const [file, info] of Object.entries(report)) {
    for (const item of info.missingList) {
      globalMissing.push({ file, orgNr: item.orgNr, name: item.name })
    }
  }
  
  const finalJson = {
    generatedAt: new Date().toISOString(),
    totalDefined: allDefinedOrgs.size,
    totalInDb: dbOrgs.size,
    globalMissingCount: globalMissing.length,
    globalMissing,
    reconciliation: report
  }
  
  const outPath = join(root, 'data', 'import-reconciliation.json')
  writeFileSync(outPath, JSON.stringify(finalJson, null, 2), 'utf8')
  console.log('='.repeat(80))
  console.log(`Wrote reconciliation report to ${outPath}`)
  
  await prisma.$disconnect()
}

main().catch(console.error)
