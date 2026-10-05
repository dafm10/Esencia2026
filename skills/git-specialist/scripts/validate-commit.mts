#!/usr/bin/env node
/**
 * Valida un mensaje de commit contra Conventional Commits 1.0.0 + reglas 50/72.
 * Fuentes: ver references/git-hooks.md (sección "commit-msg").
 *
 * Uso (hook commit-msg):  node validate-commit.mts <archivo-del-mensaje>
 * Uso manual:             node validate-commit.mts --message "feat(admin): agrega filtro"
 */
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export const COMMIT_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
] as const

export interface CommitValidation {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface CommitOptions {
  /** Máximo duro del encabezado (error). */
  maxHeader?: number
  /** Máximo recomendado del encabezado (warning). */
  softHeader?: number
  /** Ancho máximo recomendado del cuerpo (warning). */
  maxBodyLine?: number
}

const HEADER_RE =
  /^(?<type>[a-z]+)(?:\((?<scope>[a-z0-9][a-z0-9._/-]*)\))?(?<breaking>!)?: (?<subject>\S.*)$/

/** Mensajes generados por git que no deben validarse como Conventional Commits. */
const AUTO_GENERATED_RE = /^(Merge |Revert ")|^(fixup|squash|amend)! /

export function validateCommitMessage(
  raw: string,
  options: CommitOptions = {},
): CommitValidation {
  const { maxHeader = 72, softHeader = 50, maxBodyLine = 100 } = options
  const errors: string[] = []
  const warnings: string[] = []

  const lines = raw
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter((line) => !line.startsWith('#'))
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop()

  if (lines.length === 0 || lines[0].trim() === '') {
    return { valid: false, errors: ['El mensaje de commit está vacío.'], warnings }
  }

  const header = lines[0]
  if (AUTO_GENERATED_RE.test(header)) {
    return { valid: true, errors, warnings }
  }

  const match = HEADER_RE.exec(header)
  if (!match?.groups) {
    errors.push(
      `Encabezado inválido: "${header}". Formato: <tipo>(<alcance opcional>)!: <descripción>. ` +
        `Tipos: ${COMMIT_TYPES.join(', ')}.`,
    )
  } else {
    const { type, subject } = match.groups
    if (!(COMMIT_TYPES as readonly string[]).includes(type)) {
      errors.push(`Tipo "${type}" no permitido. Usa: ${COMMIT_TYPES.join(', ')}.`)
    }
    if (subject.endsWith('.')) {
      errors.push('La descripción no debe terminar con punto.')
    }
    if (/^[A-ZÁÉÍÓÚÑ]/.test(subject)) {
      warnings.push('La descripción debería iniciar en minúscula (estilo Conventional Commits).')
    }
  }

  if (header.length > maxHeader) {
    errors.push(`El encabezado tiene ${header.length} caracteres (máximo ${maxHeader}).`)
  } else if (header.length > softHeader) {
    warnings.push(`El encabezado tiene ${header.length} caracteres (recomendado ≤ ${softHeader}).`)
  }

  if (lines.length > 1 && lines[1].trim() !== '') {
    errors.push('Debe haber una línea en blanco entre el encabezado y el cuerpo.')
  }

  for (const [index, line] of lines.slice(2).entries()) {
    if (line.length > maxBodyLine && !/^\w[\w-]*: |^https?:\/\//.test(line)) {
      warnings.push(`Línea ${index + 3} del cuerpo excede ${maxBodyLine} caracteres.`)
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function hasBreakingChange(raw: string): boolean {
  const [header = ''] = raw.split('\n')
  return /^[a-z]+(\([^)]*\))?!:/.test(header) || /^BREAKING[ -]CHANGE: /m.test(raw)
}

function main(argv: string[]): number {
  const messageFlag = argv.indexOf('--message')
  let message: string
  if (messageFlag !== -1) {
    message = argv[messageFlag + 1] ?? ''
  } else if (argv[0]) {
    message = readFileSync(argv[0], 'utf8')
  } else {
    console.error('Uso: validate-commit.mts <archivo> | --message "<texto>"')
    return 2
  }

  const result = validateCommitMessage(message)
  for (const warning of result.warnings) console.warn(`⚠️  ${warning}`)
  for (const error of result.errors) console.error(`❌ ${error}`)
  if (!result.valid) {
    console.error('\nCommit rechazado. Referencia: skills/git-specialist/references/git-hooks.md')
    return 1
  }
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main(process.argv.slice(2)))
}
