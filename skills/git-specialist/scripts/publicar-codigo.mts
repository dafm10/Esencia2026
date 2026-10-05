#!/usr/bin/env node
/**
 * Publica la rama actual de forma segura: árbol limpio, convivencia, sincronía
 * con la base, checks locales y push SIN force. Imprime el comando para abrir el PR.
 * Ver references/multi-agent-branching.md (sección "Publicar").
 *
 * Uso: node publicar-codigo.mts [--base main] [--skip-checks] [--dry-run]
 */
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { checkConvivencia, type Finding } from './validate-convivencia.mts'

export interface PublishInput {
  branch: string | null
  base: string
  dirty: boolean
  /** Commits de la base que la rama no tiene (rev-list base...HEAD, lado izquierdo). */
  behindBase: number
  /** Commits propios de la rama respecto a la base. */
  aheadOfBase: number
  skipChecks: boolean
  allowProtected?: boolean
}

export interface PublishPlan {
  ok: boolean
  errors: string[]
  warnings: string[]
  steps: string[][]
}

export const CHECK_COMMANDS: string[][] = [
  ['pnpm', 'lint'],
  ['pnpm', 'build'],
  ['pnpm', 'test:git'],
]

export function planPublish(input: PublishInput): PublishPlan {
  const errors: string[] = []
  const warnings: string[] = []
  const steps: string[][] = []

  if (input.dirty) {
    errors.push('Hay cambios sin commitear. Haz commit (o stash) antes de publicar.')
  }

  const findings: Finding[] = checkConvivencia({
    branch: input.branch,
    behind: 0, // la sincronía se evalúa contra la base, no contra el upstream
    ahead: input.aheadOfBase,
    allowProtected: input.allowProtected,
  })
  for (const finding of findings) {
    ;(finding.level === 'error' ? errors : warnings).push(finding.message)
  }

  if (input.behindBase > 0) {
    errors.push(
      `Tu rama está ${input.behindBase} commit(s) detrás de ${input.base}. ` +
        `Ejecuta: git fetch origin && git rebase origin/${input.base}`,
    )
  }
  if (input.aheadOfBase === 0) {
    errors.push(`No hay commits nuevos respecto a ${input.base}; nada que publicar.`)
  }

  if (errors.length === 0) {
    if (!input.skipChecks) steps.push(...CHECK_COMMANDS)
    steps.push(['git', 'push', '-u', 'origin', input.branch ?? 'HEAD'])
  }

  return { ok: errors.length === 0, errors, warnings, steps }
}

export function prCommand(branch: string, base: string): string {
  return `gh pr create --base ${base} --head ${branch} --fill`
}

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
}

function readInput(base: string, skipChecks: boolean): PublishInput {
  git(['fetch', 'origin', '--prune'])
  let branch: string | null = null
  try {
    branch = git(['symbolic-ref', '--short', 'HEAD']) || null
  } catch {
    branch = null
  }
  const [behind = '0', ahead = '0'] = git(['rev-list', '--left-right', '--count', `origin/${base}...HEAD`]).split(/\s+/)
  return {
    branch,
    base,
    dirty: git(['status', '--porcelain']).length > 0,
    behindBase: Number(behind),
    aheadOfBase: Number(ahead),
    skipChecks,
    allowProtected: process.env.ESENCIA_ALLOW_PROTECTED === '1',
  }
}

function main(argv: string[]): number {
  const baseIndex = argv.indexOf('--base')
  const base = baseIndex === -1 ? 'main' : (argv[baseIndex + 1] ?? 'main')
  const dryRun = argv.includes('--dry-run')
  const plan = planPublish(readInput(base, argv.includes('--skip-checks')))

  for (const warning of plan.warnings) console.warn(`⚠️  ${warning}`)
  for (const error of plan.errors) console.error(`❌ ${error}`)
  if (!plan.ok) return 1

  for (const [command, ...args] of plan.steps) {
    const printable = [command, ...args].join(' ')
    if (dryRun) {
      console.log(`[dry-run] ${printable}`)
      continue
    }
    console.log(`▶ ${printable}`)
    execFileSync(command, args, { stdio: 'inherit' })
  }

  const branch = plan.steps.at(-1)?.at(-1) ?? 'HEAD'
  console.log(`\n✅ Publicado. Abre el PR con:\n   ${prCommand(branch, base)}`)
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)))
}
