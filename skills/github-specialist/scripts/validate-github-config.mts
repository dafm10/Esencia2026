#!/usr/bin/env node
/**
 * Audita la configuración de GitHub versionada en el repo: CODEOWNERS, plantilla
 * de PR, Dependabot, SECURITY.md, .gitignore de secretos y workflows.
 * Ver references/branch-protection-and-prs.md y references/github-security.md.
 *
 * Uso: node validate-github-config.mts [--strict]   (--strict: advertencias = fallo)
 * Nota: las reglas de protección de rama viven en GitHub (Settings), no en el repo.
 */
import { existsSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { validateWorkflowDir } from './validate-workflows.mts'

export interface ConfigFinding {
  level: 'error' | 'warning'
  message: string
}

export interface RepoFiles {
  exists: (path: string) => boolean
  read: (path: string) => string | undefined
}

const firstExisting = (files: RepoFiles, candidates: string[]) => candidates.find((p) => files.exists(p))

const REQUIRED: Array<{ label: string; candidates: string[]; hint: string }> = [
  {
    label: 'CODEOWNERS',
    candidates: ['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS'],
    hint: 'Define responsables por ruta (assets/CODEOWNERS) y activa "Require review from Code Owners".',
  },
  {
    label: 'plantilla de Pull Request',
    candidates: ['.github/pull_request_template.md', 'pull_request_template.md', 'docs/pull_request_template.md'],
    hint: 'Copia assets/pull_request_template.md a .github/.',
  },
  {
    label: 'dependabot.yml',
    candidates: ['.github/dependabot.yml', '.github/dependabot.yaml'],
    hint: 'Copia assets/dependabot.yml: mantiene dependencias y acciones al día.',
  },
  {
    label: 'SECURITY.md',
    candidates: ['SECURITY.md', '.github/SECURITY.md', 'docs/SECURITY.md'],
    hint: 'Indica cómo reportar vulnerabilidades (assets/SECURITY.md).',
  },
]

export function checkRepoFiles(files: RepoFiles): ConfigFinding[] {
  const findings: ConfigFinding[] = []

  for (const item of REQUIRED) {
    if (!firstExisting(files, item.candidates)) {
      findings.push({ level: 'warning', message: `Falta ${item.label}. ${item.hint}` })
    }
  }

  const gitignore = files.read('.gitignore')
  if (gitignore === undefined) {
    findings.push({ level: 'error', message: 'No existe .gitignore.' })
  } else if (!/^\s*\.env\b/m.test(gitignore)) {
    findings.push({ level: 'error', message: '.gitignore no excluye `.env`: riesgo de filtrar secretos.' })
  }
  return findings
}

export const fsRepoFiles: RepoFiles = {
  exists: (path) => existsSync(path),
  read: (path) => (existsSync(path) ? readFileSync(path, 'utf8') : undefined),
}

function main(argv: string[]): number {
  const strict = argv.includes('--strict')
  const findings: ConfigFinding[] = checkRepoFiles(fsRepoFiles)
  for (const w of validateWorkflowDir('.github/workflows')) {
    findings.push({ level: w.level, message: `${w.file}${w.line ? `:${w.line}` : ''} — ${w.message}` })
  }
  for (const f of findings) console.error(`${f.level === 'error' ? '❌' : '⚠️ '} ${f.message}`)
  if (findings.length === 0) console.log('✅ Configuración de GitHub en orden.')
  const failed = findings.some((f) => f.level === 'error' || (strict && f.level === 'warning'))
  return failed ? 1 : 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)))
}
