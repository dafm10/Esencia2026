#!/usr/bin/env node
/**
 * Valida workflows de GitHub Actions (análisis por líneas, sin dependencias):
 *  - acciones fijadas a SHA completo de 40 caracteres
 *  - bloque `permissions` explícito (mínimo privilegio)
 *  - `pull_request_target` (riesgo) y inyección de scripts vía `${{ github.event... }}`
 * Ver references/github-security.md.
 *
 * Uso: node validate-workflows.mts [directorio-de-workflows]   (por defecto .github/workflows)
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export interface WorkflowFinding {
  level: 'error' | 'warning'
  file: string
  line?: number
  message: string
}

const USES_RE = /^\s*-?\s*uses:\s*([^\s#]+)/
const FULL_SHA_RE = /@[0-9a-f]{40}$/
const UNTRUSTED_RE =
  /\$\{\{\s*github\.(?:head_ref|event\.(?:issue|pull_request|comment|review|review_comment|discussion|head_commit|commits|pages)[^}]*\.(?:title|body|name|message|label|ref|email|login))[^}]*\}\}/
/** Asignación en `env:` (forma segura): `NOMBRE: ${{ ... }}`. */
const ENV_ASSIGNMENT_RE = /^\s*[A-Za-z_][A-Za-z0-9_]*:\s*["']?\$\{\{/

export function validateWorkflow(file: string, text: string): WorkflowFinding[] {
  const findings: WorkflowFinding[] = []
  const lines = text.split('\n')

  lines.forEach((line, index) => {
    const lineNo = index + 1
    const uses = USES_RE.exec(line)
    if (uses) {
      const ref = uses[1]
      const isLocal = ref.startsWith('./')
      const isDocker = ref.startsWith('docker://')
      if (!isLocal && !isDocker && !FULL_SHA_RE.test(ref)) {
        findings.push({
          level: 'error',
          file,
          line: lineNo,
          message: `"${ref}" no está fijada a un SHA completo de 40 caracteres (deja la versión como comentario: # v4.2.2).`,
        })
      }
    }
    if (UNTRUSTED_RE.test(line) && !ENV_ASSIGNMENT_RE.test(line)) {
      findings.push({
        level: 'error',
        file,
        line: lineNo,
        message: 'Entrada no confiable interpolada directamente (riesgo de inyección). Pásala por `env:` y úsala como variable de shell.',
      })
    }
  })

  if (!/^\s*permissions:/m.test(text)) {
    findings.push({
      level: 'warning',
      file,
      message: 'Sin bloque `permissions:`. Declara permisos mínimos (p. ej. `contents: read`).',
    })
  }
  if (/^\s*pull_request_target\s*:/m.test(text) || /\bon:\s*\[?[^\n]*pull_request_target/.test(text)) {
    findings.push({
      level: 'warning',
      file,
      message: '`pull_request_target` corre con secretos y permisos de escritura: no hagas checkout ni ejecutes código del PR.',
    })
  }
  return findings
}

export function validateWorkflowDir(dir: string): WorkflowFinding[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => /\.ya?ml$/.test(name))
    .flatMap((name) => validateWorkflow(join(dir, name), readFileSync(join(dir, name), 'utf8')))
}

function main(argv: string[]): number {
  const findings = validateWorkflowDir(argv[0] ?? '.github/workflows')
  for (const f of findings) {
    const where = f.line ? `${f.file}:${f.line}` : f.file
    console.error(`${f.level === 'error' ? '❌' : '⚠️ '} ${where} — ${f.message}`)
  }
  return findings.some((f) => f.level === 'error') ? 1 : 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)))
}
