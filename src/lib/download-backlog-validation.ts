import { parseCsvRows } from './csv'

export const DOWNLOAD_BACKLOG_COLUMNS = [
  'priority',
  'status',
  'country',
  'theme',
  'doc_type',
  'institution',
  'title',
  'year',
  'url',
  'url_type',
  'current_local_status',
  'target_path',
  'next_action',
  'source_basis',
] as const

const ALLOWED_PRIORITIES = new Set(['P0', 'P1', 'P2', 'P3'])
const ALLOWED_STATUSES = new Set([
  'downloaded',
  'url_only',
  'missing_metadata_only',
  'requires_manual',
  'exa_fetched',
])

export type DownloadBacklogValidationIssue = {
  filePath: string
  line: number
  severity: 'error' | 'warning'
  message: string
}

export type DownloadBacklogValidationResult = {
  valid: boolean
  issues: DownloadBacklogValidationIssue[]
  rowsChecked: number
}

function issue(
  filePath: string,
  line: number,
  severity: DownloadBacklogValidationIssue['severity'],
  message: string,
): DownloadBacklogValidationIssue {
  return { filePath, line, severity, message }
}

function isActiveRow(row: string[]) {
  return row.some(value => value.trim().length > 0)
}

export function validateDownloadBacklogCsv(
  text: string,
  filePath: string,
): DownloadBacklogValidationResult {
  const rows = parseCsvRows(text)
  const issues: DownloadBacklogValidationIssue[] = []
  const [header, ...records] = rows

  if (!header) {
    return {
      valid: false,
      issues: [issue(filePath, 1, 'error', 'empty CSV file')],
      rowsChecked: 0,
    }
  }

  const expectedHeader = [...DOWNLOAD_BACKLOG_COLUMNS]
  if (header.length !== expectedHeader.length || header.some((value, index) => value !== expectedHeader[index])) {
    issues.push(
      issue(
        filePath,
        1,
        'error',
        `invalid header; expected ${expectedHeader.join(',')}`,
      ),
    )
  }

  const firstUrlLine = new Map<string, number>()
  const firstTargetPathLine = new Map<string, number>()

  records.forEach((record, index) => {
    const line = index + 2
    if (!isActiveRow(record)) return

    const priority = record[0]?.trim() ?? ''
    const status = record[1]?.trim() ?? ''
    const url = record[8]?.trim() ?? ''
    const targetPath = record[11]?.trim() ?? ''

    if (priority.startsWith('#')) {
      issues.push(issue(filePath, line, 'error', 'section heading parsed as CSV row'))
      return
    }

    if (record.length !== expectedHeader.length) {
      issues.push(
        issue(
          filePath,
          line,
          'error',
          `invalid column count ${record.length}; expected ${expectedHeader.length}`,
        ),
      )
    }

    if (!priority) {
      issues.push(issue(filePath, line, 'error', 'active row missing priority'))
    } else if (!ALLOWED_PRIORITIES.has(priority)) {
      issues.push(issue(filePath, line, 'error', `invalid priority "${priority}"`))
    }

    if (!status) {
      issues.push(issue(filePath, line, 'error', 'active row missing status'))
    } else if (!ALLOWED_STATUSES.has(status)) {
      issues.push(issue(filePath, line, 'error', `invalid status "${status}"`))
    }

    if (url) {
      const firstLine = firstUrlLine.get(url)
      if (firstLine) {
        issues.push(
          issue(filePath, line, 'warning', `duplicate url also appears on line ${firstLine}: ${url}`),
        )
      } else {
        firstUrlLine.set(url, line)
      }
    }

    if (targetPath) {
      const firstLine = firstTargetPathLine.get(targetPath)
      if (firstLine) {
        issues.push(
          issue(
            filePath,
            line,
            'warning',
            `duplicate target_path also appears on line ${firstLine}: ${targetPath}`,
          ),
        )
      } else {
        firstTargetPathLine.set(targetPath, line)
      }
    }
  })

  return {
    valid: issues.every(validationIssue => validationIssue.severity !== 'error'),
    issues,
    rowsChecked: records.length,
  }
}
