#!/usr/bin/env node
/**
 * Guardia para agentes (Antigravity): evalúa un comando de terminal y bloquea
 * operaciones git destructivas o que saltan los hooks.
 * Ver references/multi-agent-branching.md (sección "Guardia de agentes").
 *
 * Uso: node guardia-antigravity.mts "<comando>"     (o comando por stdin)
 * Salida: código 0 = permitido, 1 = bloqueado.
 */
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export interface GuardVerdict {
  allowed: boolean
  rule?: string
  reason?: string
}

interface Rule {
  id: string
  reason: string
  test: (args: string[]) => boolean
}

const PROTECTED = ['main', 'master', 'develop']

const has = (args: string[], ...flags: string[]) => flags.some((flag) => args.includes(flag))
const combinedShortFlag = (args: string[], letter: string) =>
  args.some((a) => /^-[a-zA-Z]+$/.test(a) && a.includes(letter))

const RULES: Rule[] = [
  {
    id: 'push-force',
    reason: 'Push forzado reescribe historia remota. Usa --force-with-lease solo en tu rama de feature y con aprobación.',
    test: (a) => a[0] === 'push' && (has(a, '--force', '-f') || combinedShortFlag(a, 'f')),
  },
  {
    id: 'push-protected',
    reason: 'Push directo a rama protegida. Publica una rama y abre un PR.',
    test: (a) =>
      a[0] === 'push' &&
      a.slice(1).some((arg) => {
        const target = arg.includes(':') ? arg.split(':').pop() ?? '' : arg
        return PROTECTED.includes(target.replace(/^refs\/heads\//, ''))
      }),
  },
  {
    id: 'push-delete',
    reason: 'Borrar ramas remotas requiere confirmación humana.',
    test: (a) => a[0] === 'push' && (has(a, '--delete', '-d') || a.slice(1).some((x) => x.startsWith(':') && x.length > 1)),
  },
  {
    id: 'reset-hard',
    reason: '`reset --hard` descarta trabajo sin commit.',
    test: (a) => a[0] === 'reset' && has(a, '--hard'),
  },
  {
    id: 'clean-force',
    reason: '`clean -f` borra archivos sin seguimiento de forma irreversible.',
    test: (a) => a[0] === 'clean' && (has(a, '--force') || combinedShortFlag(a, 'f')),
  },
  {
    id: 'discard-changes',
    reason: 'Descartar cambios locales de forma masiva requiere confirmación.',
    test: (a) =>
      (a[0] === 'restore' && !has(a, '--staged') && a.slice(1).some((x) => x === '.')) ||
      (a[0] === 'checkout' && (a.includes('--') ? a.slice(a.indexOf('--') + 1).includes('.') : a.slice(1).length === 1 && a[1] === '.')),
  },
  {
    id: 'branch-force-delete',
    reason: '`branch -D` borra ramas aunque no estén fusionadas.',
    test: (a) => a[0] === 'branch' && (has(a, '-D') || (has(a, '--delete') && has(a, '--force'))),
  },
  {
    id: 'no-verify',
    reason: 'Saltar hooks (--no-verify) está prohibido: los hooks son la política del repo.',
    test: (a) => (a[0] === 'commit' || a[0] === 'push' || a[0] === 'merge') && (has(a, '--no-verify') || (a[0] === 'commit' && has(a, '-n'))),
  },
  {
    id: 'rewrite-history',
    reason: 'Reescribir historia (filter-branch/filter-repo) requiere aprobación humana.',
    test: (a) => a[0] === 'filter-branch' || a[0] === 'filter-repo',
  },
  {
    id: 'interactive-rebase',
    reason: 'El rebase interactivo abre un editor y bloquea al agente.',
    test: (a) => a[0] === 'rebase' && has(a, '-i', '--interactive'),
  },
  {
    id: 'stash-drop',
    reason: 'Eliminar stashes pierde trabajo guardado.',
    test: (a) => a[0] === 'stash' && (a[1] === 'drop' || a[1] === 'clear'),
  },
  {
    id: 'hooks-tamper',
    reason: 'No modifiques core.hooksPath ni los hooks del repo.',
    test: (a) => a[0] === 'config' && a.some((x) => x.toLowerCase() === 'core.hookspath'),
  },
]

/** Separa una línea de shell en comandos simples (&&, ||, ;, |, saltos de línea). */
export function splitCommands(line: string): string[] {
  return line
    .split(/&&|\|\||;|\||\n/)
    .map((part) => part.trim())
    .filter(Boolean)
}

/** Convierte "git -C ruta -c k=v push ..." en ["push", ...]; null si no es git. */
export function toGitArgs(command: string): string[] | null {
  const tokens = command.match(/"[^"]*"|'[^']*'|\S+/g)?.map((t) => t.replace(/^["']|["']$/g, ''))
  if (!tokens || tokens[0] !== 'git') return null
  const args: string[] = []
  let i = 1
  while (i < tokens.length && tokens[i].startsWith('-') && args.length === 0) {
    const flag = tokens[i]
    i += flag === '-C' || flag === '-c' || flag === '--git-dir' || flag === '--work-tree' ? 2 : 1
  }
  return args.concat(tokens.slice(i))
}

export function evaluateCommand(line: string): GuardVerdict {
  for (const command of splitCommands(line)) {
    if (/\brm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)\b.*(^|\s|\/)\.git(\s|\/|$)/.test(command)) {
      return { allowed: false, rule: 'rm-dot-git', reason: 'Borrar .git destruye el repositorio.' }
    }
    const args = toGitArgs(command)
    if (!args) continue
    for (const rule of RULES) {
      if (rule.test(args)) return { allowed: false, rule: rule.id, reason: rule.reason }
    }
  }
  return { allowed: true }
}

function main(argv: string[]): number {
  const input = argv.length > 0 ? argv.join(' ') : readFileSync(0, 'utf8')
  const verdict = evaluateCommand(input)
  if (verdict.allowed) return 0
  console.error(`⛔ Bloqueado por guardia-antigravity [${verdict.rule}]: ${verdict.reason}`)
  return 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)))
}
