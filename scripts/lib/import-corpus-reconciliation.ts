import ts from 'typescript'

export type ImportCorpusOccurrence = {
  script: string
  orgNr: string
  propertyName: string
  line: number
}

export type ImportCorpusOwnershipLink = {
  script: string
  parentOrgNr: string
  childOrgNr: string
  line: number
}

export type ImportCorpusScript = {
  script: string
  orgNrs: string[]
  occurrences: ImportCorpusOccurrence[]
  ownershipLinks: ImportCorpusOwnershipLink[]
}

export type ImportCorpusException = {
  orgNr: string
  reason: string
  script?: string
}

export type ImportReconciliationScript = {
  script: string
  defined: number
  found: number
  missing: string[]
  excepted: ImportCorpusException[]
  unexplainedMissing: string[]
}

export type ImportReconciliationReport = {
  generatedAt: string
  totals: {
    scripts: number
    uniqueDefined: number
    uniqueFound: number
    uniqueMissing: number
    uniqueExcepted: number
    uniqueUnexplainedMissing: number
    dbCompanies: number
  }
  scripts: ImportReconciliationScript[]
}

export type KonsernTreeRoot = {
  slug: string
  rootOrgNr: string
}

export type KonsernTreeSizeExpectation = KonsernTreeRoot & {
  expectedTreeSize: number
  expectedOrgNrs: string[]
  sourceScripts: string[]
}

export type KonsernTreeSizeExpectationReport = {
  basis: string
  roots: KonsernTreeSizeExpectation[]
}

function normalizeOrgNr(value: string): string {
  return value.trim().replace(/\s+/g, '').toUpperCase()
}

function staticPropertyName(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text
  return null
}

function isOrgNrProperty(name: string): boolean {
  return name === 'orgNr' || /OrgNr$/.test(name)
}

function collectStringConstants(sourceFile: ts.SourceFile): Map<string, string> {
  const constants = new Map<string, string>()

  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || declaration.initializer == null) continue
        const value = literalStringValue(declaration.initializer, constants)
        if (value != null) constants.set(declaration.name.text, value)
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return constants
}

function literalStringValue(node: ts.Expression, constants: Map<string, string>): string | null {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return normalizeOrgNr(node.text)
  if (ts.isIdentifier(node)) return constants.get(node.text) ?? null
  if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isSatisfiesExpression(node)) {
    return literalStringValue(node.expression, constants)
  }
  return null
}

function collectOrgNrArrays(sourceFile: ts.SourceFile, constants: Map<string, string>): Map<string, string[]> {
  const arrays = new Map<string, string[]>()

  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer || !ts.isArrayLiteralExpression(declaration.initializer)) continue
        const orgNrs = declaration.initializer.elements
          .map(element => {
            if (!ts.isObjectLiteralExpression(element)) return null
            const orgNrProperty = element.properties.find(property => {
              if (!ts.isPropertyAssignment(property)) return false
              const propertyName = staticPropertyName(property.name)
              return propertyName === 'orgNr'
            })
            if (!orgNrProperty || !ts.isPropertyAssignment(orgNrProperty)) return null
            return literalStringValue(orgNrProperty.initializer, constants)
          })
          .filter((orgNr): orgNr is string => orgNr != null)

        if (orgNrs.length > 0) arrays.set(declaration.name.text, [...new Set(orgNrs)].sort())
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return arrays
}

function resolveCompanyIdArgument(node: ts.Expression, constants: Map<string, string>): string | null {
  let expression = node
  if (ts.isAwaitExpression(expression)) expression = expression.expression
  if (!ts.isCallExpression(expression)) return null

  const callee = expression.expression
  if (!ts.isIdentifier(callee) || callee.text !== 'resolveCompanyId') return null
  const [argument] = expression.arguments
  if (!argument || !ts.isExpression(argument)) return null
  return literalStringValue(argument, constants)
}

function collectStaticResolveCompanyIds(sourceFile: ts.SourceFile, constants: Map<string, string>): Map<string, string> {
  const resolved = new Map<string, string>()

  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue
        const orgNr = resolveCompanyIdArgument(declaration.initializer, constants)
        if (orgNr != null) resolved.set(declaration.name.text, orgNr)
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return resolved
}

export function extractOrgNrsFromImportSource(script: string, source: string): ImportCorpusScript {
  const sourceFile = ts.createSourceFile(script, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const constants = collectStringConstants(sourceFile)
  const orgNrArrays = collectOrgNrArrays(sourceFile, constants)
  const staticResolveCompanyIds = collectStaticResolveCompanyIds(sourceFile, constants)
  const seen = new Set<string>()
  const occurrences: ImportCorpusOccurrence[] = []
  const ownershipLinks: ImportCorpusOwnershipLink[] = []
  const seenOwnershipLinks = new Set<string>()

  function objectProperties(node: ts.ObjectLiteralExpression): Map<string, ts.Expression> {
    const properties = new Map<string, ts.Expression>()
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue
      const propertyName = staticPropertyName(property.name)
      if (propertyName == null) continue
      properties.set(propertyName, property.initializer)
    }
    return properties
  }

  function visit(node: ts.Node) {
    if (ts.isPropertyAssignment(node)) {
      const propertyName = staticPropertyName(node.name)
      if (propertyName != null && isOrgNrProperty(propertyName)) {
        const orgNr = literalStringValue(node.initializer, constants)
        if (orgNr != null) {
          const line = sourceFile.getLineAndCharacterOfPosition(node.name.getStart(sourceFile)).line + 1
          occurrences.push({ script, orgNr, propertyName, line })
          seen.add(orgNr)
        }
      }
    }
    if (ts.isObjectLiteralExpression(node)) {
      const properties = objectProperties(node)
      const parentOrgNr = properties.get('parentOrgNr')
      const childOrgNr = properties.get('childOrgNr')
      if (parentOrgNr != null && childOrgNr != null && properties.has('ownershipType')) {
        const parent = literalStringValue(parentOrgNr, constants)
        const child = literalStringValue(childOrgNr, constants)
        if (parent != null && child != null) {
          const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
          const key = `${parent}\0${child}\0${line}`
          if (!seenOwnershipLinks.has(key)) {
            ownershipLinks.push({ script, parentOrgNr: parent, childOrgNr: child, line })
            seenOwnershipLinks.add(key)
          }
        }
      }
    }
    if (ts.isForOfStatement(node) && ts.isVariableDeclarationList(node.initializer) && ts.isIdentifier(node.expression)) {
      const [declaration] = node.initializer.declarations
      const loopVariable = declaration && ts.isIdentifier(declaration.name) ? declaration.name.text : null
      const sourceArrayName = node.expression.text
      const sourceOrgNrs = orgNrArrays.get(sourceArrayName)
      if (loopVariable != null && sourceOrgNrs != null) {
        const bodyText = node.statement.getText(sourceFile)
        const resolvesLoopOrgNr = new RegExp(`resolveCompanyId\\(\\s*${loopVariable}\\.orgNr\\s*\\)`).test(bodyText)
        if (bodyText.includes('companyOwnership.upsert') && bodyText.includes('ownershipType') && resolvesLoopOrgNr) {
          const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
          for (const [parentIdVariable, parentOrgNr] of staticResolveCompanyIds) {
            if (!bodyText.includes(`parentCompanyId: ${parentIdVariable}`)) continue
            for (const childOrgNr of sourceOrgNrs) {
              const key = `${parentOrgNr}\0${childOrgNr}\0${line}`
              if (!seenOwnershipLinks.has(key)) {
                ownershipLinks.push({ script, parentOrgNr, childOrgNr, line })
                seenOwnershipLinks.add(key)
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return { script, orgNrs: [...seen].sort(), occurrences, ownershipLinks }
}

function exceptionKey(exception: ImportCorpusException): string {
  return exception.script == null ? exception.orgNr : `${exception.script}\0${exception.orgNr}`
}

function exceptionApplies(exceptionIndex: Map<string, ImportCorpusException>, script: string, orgNr: string): ImportCorpusException | null {
  return exceptionIndex.get(`${script}\0${orgNr}`) ?? exceptionIndex.get(orgNr) ?? null
}

export function reconcileImportCorpus(
  corpus: ImportCorpusScript[],
  dbOrgNrs: string[],
  exceptions: ImportCorpusException[] = [],
  generatedAt = new Date().toISOString(),
): ImportReconciliationReport {
  const dbOrgNrSet = new Set(dbOrgNrs.map(normalizeOrgNr))
  const exceptionIndex = new Map(exceptions.map(exception => [exceptionKey({
    ...exception,
    orgNr: normalizeOrgNr(exception.orgNr),
  }), { ...exception, orgNr: normalizeOrgNr(exception.orgNr) }]))

  const scripts = corpus
    .map((script): ImportReconciliationScript => {
      const orgNrs = [...new Set(script.orgNrs.map(normalizeOrgNr))].sort()
      const foundOrgNrs = orgNrs.filter(orgNr => dbOrgNrSet.has(orgNr))
      const missing = orgNrs.filter(orgNr => !dbOrgNrSet.has(orgNr))
      const excepted = missing
        .map(orgNr => exceptionApplies(exceptionIndex, script.script, orgNr))
        .filter((exception): exception is ImportCorpusException => exception != null)
      const exceptedOrgNrs = new Set(excepted.map(exception => exception.orgNr))
      const unexplainedMissing = missing.filter(orgNr => !exceptedOrgNrs.has(orgNr))

      return {
        script: script.script,
        defined: orgNrs.length,
        found: foundOrgNrs.length,
        missing,
        excepted,
        unexplainedMissing,
      }
    })
    .sort((a, b) => a.script.localeCompare(b.script))

  const uniqueDefined = new Set(corpus.flatMap(script => script.orgNrs.map(normalizeOrgNr)))
  const uniqueFound = new Set([...uniqueDefined].filter(orgNr => dbOrgNrSet.has(orgNr)))
  const uniqueMissing = new Set([...uniqueDefined].filter(orgNr => !dbOrgNrSet.has(orgNr)))
  const uniqueExcepted = new Set(
    [...uniqueMissing].filter(orgNr => exceptionApplies(exceptionIndex, '', orgNr) != null
      || scripts.some(script => script.excepted.some(exception => exception.orgNr === orgNr))),
  )
  const uniqueUnexplainedMissing = new Set([...uniqueMissing].filter(orgNr => !uniqueExcepted.has(orgNr)))

  return {
    generatedAt,
    totals: {
      scripts: scripts.length,
      uniqueDefined: uniqueDefined.size,
      uniqueFound: uniqueFound.size,
      uniqueMissing: uniqueMissing.size,
      uniqueExcepted: uniqueExcepted.size,
      uniqueUnexplainedMissing: uniqueUnexplainedMissing.size,
      dbCompanies: dbOrgNrSet.size,
    },
    scripts,
  }
}

export function buildKonsernTreeSizeExpectations(
  corpus: ImportCorpusScript[],
  roots: KonsernTreeRoot[],
): KonsernTreeSizeExpectationReport {
  const childrenByParentOrgNr = new Map<string, Set<string>>()
  const sourceScriptsByOrgNr = new Map<string, Set<string>>()

  function addSourceScript(orgNr: string, script: string) {
    const normalizedOrgNr = normalizeOrgNr(orgNr)
    const scripts = sourceScriptsByOrgNr.get(normalizedOrgNr) ?? new Set<string>()
    scripts.add(script)
    sourceScriptsByOrgNr.set(normalizedOrgNr, scripts)
  }

  for (const script of corpus) {
    for (const orgNr of script.orgNrs) addSourceScript(orgNr, script.script)
    for (const link of script.ownershipLinks) {
      const parentOrgNr = normalizeOrgNr(link.parentOrgNr)
      const childOrgNr = normalizeOrgNr(link.childOrgNr)
      const children = childrenByParentOrgNr.get(parentOrgNr) ?? new Set<string>()
      children.add(childOrgNr)
      childrenByParentOrgNr.set(parentOrgNr, children)
      addSourceScript(parentOrgNr, link.script)
      addSourceScript(childOrgNr, link.script)
    }
  }

  const expectationRows = roots
    .map((root): KonsernTreeSizeExpectation => {
      const rootOrgNr = normalizeOrgNr(root.rootOrgNr)
      const expectedOrgNrs = new Set<string>([rootOrgNr])
      let frontier = [rootOrgNr]

      while (frontier.length > 0) {
        const nextFrontier: string[] = []
        for (const parentOrgNr of frontier) {
          for (const childOrgNr of childrenByParentOrgNr.get(parentOrgNr) ?? []) {
            if (!expectedOrgNrs.has(childOrgNr)) {
              expectedOrgNrs.add(childOrgNr)
              nextFrontier.push(childOrgNr)
            }
          }
        }
        frontier = nextFrontier
      }

      const sourceScripts = new Set<string>()
      for (const orgNr of expectedOrgNrs) {
        for (const script of sourceScriptsByOrgNr.get(orgNr) ?? []) sourceScripts.add(script)
      }

      return {
        slug: root.slug,
        rootOrgNr,
        expectedTreeSize: expectedOrgNrs.size,
        expectedOrgNrs: [...expectedOrgNrs].sort(),
        sourceScripts: [...sourceScripts].sort(),
      }
    })
    .sort((a, b) => a.slug.localeCompare(b.slug))

  return {
    basis: 'Static parentOrgNr -> childOrgNr ownership links in scripts/import-*.ts, traversed from KONSERN_REGISTRY roots.',
    roots: expectationRows,
  }
}
