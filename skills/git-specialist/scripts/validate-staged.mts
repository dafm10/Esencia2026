#!/usr/bin/env node
/**
 * Valida los archivos en staging: rutas prohibidas, secretos y tamaño.
 * Pensado para el hook pre-commit. Ver references/git-hooks.md (sección "pre-commit").
 *
 * Uso: node validate-staged.mts            (lee `git diff --cached`)
 */
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

export interface StagedFile {
  path: string
  size: number
  /** Contenido de texto; undefined si es binario o demasiado grande. */
  content?: string
}

export interface StagedIssue {
  path: string
  message: string
}

export const MAX_FILE_BYTES = 5 * 1024 * 1024
export const MAX_SCAN_BYTES = 1024 * 1024

const FORBIDDEN_PATHS: Array<{ re: RegExp; reason: string }> = [
  { re: /(^|\/)\.env($|\.(?!example$)[^/]+$)/, reason: 'archivo de entorno con posibles secretos (usa .env.example)' },
  { re: /\.(pem|key|p12|pfx|keystore)$/i, reason: 'llave/certificado privado' },
  { re: /(^|\/)id_(rsa|dsa|ecdsa|ed25519)$/, reason: 'llave SSH privada' },
  { re: /(^|\/)node_modules\//, reason: 'dependencias (node_modules)' },
  { re: /(^|\/)(dist|dist-ssr)\//, reason: 'artefactos de build' },
  { re: /(^|\/)\.DS_Store$/, reason: 'metadatos del sistema' },
  { re: /\.log$/i, reason: 'archivo de log' },
]

const SECRET_PATTERNS: Array<{ re: RegExp; name: string }> = [
  { re: /AKIA[0-9A-Z]{16}/, name: 'AWS access key' },
  { re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/, name: 'llave privada' },
  { re: /gh[pousr]_[A-Za-z0-9]{36,}/, name: 'token de GitHub' },
  { re: /sk_live_[A-Za-z0-9]{16,}/, name: 'clave live de Stripe' },
  { re: /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{16,}\b/, name: 'API key de Resend' },
  {
    re: /(?:SERVICE_ROLE_KEY|RESEND_API_KEY|SECRET_KEY)\s*[:=]\s*['"]?[A-Za-z0-9._-]{20,}/,
    name: 'asignación de secreto en claro',
  },
]

export function checkPath(path: string): StagedIssue[] {
  return FORBIDDEN_PATHS.filter(({ re }) => re.test(path)).map(({ reason }) => ({
    path,
    message: `Ruta no permitida: ${reason}.`,
  }))
}

export function scanContent(path: string, content: string): StagedIssue[] {
  return SECRET_PATTERNS.filter(({ re }) => re.test(content)).map(({ name }) => ({
    path,
    message: `Posible secreto detectado (${name}).`,
  }))
}

export function validateStaged(files: StagedFile[]): StagedIssue[] {
  const issues: StagedIssue[] = []
  for (const file of files) {
    issues.push(...checkPath(file.path))
    if (file.size > MAX_FILE_BYTES) {
      issues.push({
        path: file.path,
        message: `Archivo de ${(file.size / 1024 / 1024).toFixed(1)} MB excede el máximo de ${MAX_FILE_BYTES / 1024 / 1024} MB.`,
      })
    }
    if (file.content !== undefined) issues.push(...scanContent(file.path, file.content))
  }
  return issues
}

function git(args: string[]): Buffer {
  return execFileSync('git', args, { maxBuffer: 64 * 1024 * 1024 })
}

export function readStagedFiles(): StagedFile[] {
  const names = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'])
    .toString('utf8')
    .split('\0')
    .filter(Boolean)

  return names.map((path) => {
    const size = Number(git(['cat-file', '-s', `:${path}`]).toString().trim())
    if (size > MAX_SCAN_BYTES) return { path, size }
    const buffer = git(['show', `:${path}`])
    const isBinary = buffer.subarray(0, 8000).includes(0)
    return { path, size, content: isBinary ? undefined : buffer.toString('utf8') }
  })
}

function main(): number {
  const issues = validateStaged(readStagedFiles())
  if (issues.length === 0) return 0
  for (const { path, message } of issues) console.error(`❌ ${path}: ${message}`)
  console.error('\nCommit bloqueado. Quita los archivos con `git restore --staged <ruta>`.')
  return 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main())
}
