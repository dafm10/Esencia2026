#!/usr/bin/env node
/**
 * Convivencia entre personas y agentes: nombres de rama, ramas protegidas y
 * sincronía con el remoto. Ver references/multi-agent-branching.md.
 *
 * Uso:
 *   node validate-convivencia.mts --hook pre-commit
 *   node validate-convivencia.mts --hook pre-push <remote> <url>   (refs por stdin)
 *   node validate-convivencia.mts                                  (chequeo manual)
 *
 * Escape consciente: ESENCIA_ALLOW_PROTECTED=1 (solo para emergencias).
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export const PROTECTED_BRANCHES = ['main', 'master', 'develop'] as const

const BRANCH_TYPES = [
  'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'hotfix', 'release', 'agent',
] as const

const TYPED_BRANCH_RE = new RegExp(`^(${BRANCH_TYPES.join('|')})/[a-z0-9][a-z0-9._-]*$`)
/** Ramas autogeneradas por worktrees de Antigravity (snake_case). */
const AGENT_WORKTREE_RE = /^[a-z0-9]+(_[a-z0-9]+)+$/

export interface Finding {
  level: 'error' | 'warning'
  message: string
}

export function isProtected(branch: string, protectedList: readonly string[] = PROTECTED_BRANCHES): boolean {
  return protectedList.includes(branch)
}

export function validateBranchName(branch: string): Finding[] {
  if (isProtected(branch) || TYPED_BRANCH_RE.test(branch)) return []
  if (AGENT_WORKTREE_RE.test(branch)) {
    return [
      {
        level: 'warning',
        message: `La rama "${branch}" es snake_case (worktree de agente). Renómbrala a <tipo>/<kebab-case> antes de abrir el PR.`,
      },
    ]
  }
  return [
    {
      level: 'error',
      message: `Nombre de rama inválido: "${branch}". Usa <${BRANCH_TYPES.join('|')}>/<kebab-case>.`,
    },
  ]
}

export interface RepoState {
  branch: string | null // null = HEAD desacoplado
  behind: number
  ahead: number
  allowProtected?: boolean
}

export function checkConvivencia(state: RepoState): Finding[] {
  const findings: Finding[] = []
  if (state.branch === null) {
    findings.push({ level: 'error', message: 'HEAD desacoplado: crea una rama (git switch -c <tipo>/<nombre>).' })
    return findings
  }
  if (isProtected(state.branch) && !state.allowProtected) {
    findings.push({
      level: 'error',
      message: `No se permiten commits directos en "${state.branch}". Trabaja en una rama y abre un PR.`,
    })
  }
  findings.push(...validateBranchName(state.branch))
  if (state.behind > 0) {
    findings.push({
      level: 'warning',
      message: `Tu rama está ${state.behind} commit(s) detrás de su base. Haz rebase/merge antes de publicar.`,
    })
  }
  return findings
}

export interface PushRef {
  localRef: string
  localSha: string
  remoteRef: string
  remoteSha: string
}

const ZERO_SHA = /^0+$/

export function parsePushRefs(stdin: string): PushRef[] {
  return stdin
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [localRef = '', localSha = '', remoteRef = '', remoteSha = ''] = line.split(/\s+/)
      return { localRef, localSha, remoteRef, remoteSha }
    })
}

export function validatePushRefs(refs: PushRef[], allowProtected = false): Finding[] {
  const findings: Finding[] = []
  for (const ref of refs) {
    const target = ref.remoteRef.replace(/^refs\/heads\//, '')
    if (!ref.remoteRef.startsWith('refs/heads/')) continue
    if (isProtected(target) && !allowProtected) {
      const deleting = ZERO_SHA.test(ref.localSha)
      findings.push({
        level: 'error',
        message: deleting
          ? `Eliminar la rama protegida "${target}" está bloqueado.`
          : `Push directo a "${target}" bloqueado. Publica tu rama y abre un PR.`,
      })
    }
    if (!ZERO_SHA.test(ref.localSha) && ref.localRef.startsWith('refs/heads/')) {
      findings.push(...validateBranchName(ref.localRef.replace(/^refs\/heads\//, '')))
    }
  }
  return findings
}

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
}

function readRepoState(): RepoState {
  let branch: string | null = null
  try {
    branch = git(['symbolic-ref', '--short', 'HEAD']) || null
  } catch {
    branch = null
  }
  let behind = 0
  let ahead = 0
  try {
    const [b = '0', a = '0'] = git(['rev-list', '--left-right', '--count', '@{upstream}...HEAD']).split(/\s+/)
    behind = Number(b)
    ahead = Number(a)
  } catch {
    // sin upstream configurado
  }
  return { branch, behind, ahead, allowProtected: process.env.ESENCIA_ALLOW_PROTECTED === '1' }
}

function report(findings: Finding[]): number {
  for (const f of findings) {
    console.error(`${f.level === 'error' ? '❌' : '⚠️ '} ${f.message}`)
  }
  const failed = findings.some((f) => f.level === 'error')
  if (failed) console.error('\nReferencia: skills/git-specialist/references/multi-agent-branching.md')
  return failed ? 1 : 0
}

function main(argv: string[]): number {
  const hookIndex = argv.indexOf('--hook')
  const hook = hookIndex === -1 ? 'manual' : argv[hookIndex + 1]
  const allowProtected = process.env.ESENCIA_ALLOW_PROTECTED === '1'

  if (hook === 'pre-push') {
    const stdin = readFileSync(0, 'utf8')
    return report(validatePushRefs(parsePushRefs(stdin), allowProtected))
  }
  return report(checkConvivencia(readRepoState()))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)))
}
