import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  MAX_FILE_BYTES,
  checkPath,
  scanContent,
  validateStaged,
} from './validate-staged.mts'

// Los secretos de prueba se arman por partes para que este archivo no dispare el escáner.
const fakeAwsKey = 'AK' + 'IA' + 'ABCDEFGHIJKLMNOP'
const fakeGithubToken = 'gh' + 'p_' + 'a'.repeat(36)
const fakePrivateKey = '-----' + 'BEGIN RSA PRIVATE KEY' + '-----'

describe('checkPath', () => {
  it('bloquea .env y variantes, permite .env.example', () => {
    assert.equal(checkPath('.env').length, 1)
    assert.equal(checkPath('.env.local').length, 1)
    assert.equal(checkPath('apps/web/.env.production').length, 1)
    assert.equal(checkPath('.env.example').length, 0)
  })

  it('bloquea llaves, node_modules, dist y logs', () => {
    assert.equal(checkPath('certs/server.pem').length, 1)
    assert.equal(checkPath('id_rsa').length, 1)
    assert.equal(checkPath('node_modules/x/index.js').length, 1)
    assert.equal(checkPath('dist/index.html').length, 1)
    assert.equal(checkPath('npm-debug.log').length, 1)
  })

  it('permite archivos normales', () => {
    assert.equal(checkPath('src/App.tsx').length, 0)
    assert.equal(checkPath('supabase/functions/create-order/index.ts').length, 0)
  })
})

describe('scanContent', () => {
  it('detecta AWS key, token GitHub y llave privada', () => {
    assert.equal(scanContent('a.ts', `const k = "${fakeAwsKey}"`).length, 1)
    assert.equal(scanContent('a.ts', fakeGithubToken).length, 1)
    assert.equal(scanContent('a.ts', fakePrivateKey).length, 1)
  })

  it('detecta asignación de secreto en claro', () => {
    const line = 'RESEND_API_KEY=' + 'x'.repeat(30)
    assert.equal(scanContent('a.ts', line).length >= 1, true)
  })

  it('no marca texto inocuo', () => {
    assert.equal(scanContent('a.ts', 'const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY').length, 0)
  })
})

describe('validateStaged', () => {
  it('reporta archivos demasiado grandes', () => {
    const issues = validateStaged([{ path: 'video.mp4', size: MAX_FILE_BYTES + 1 }])
    assert.equal(issues.length, 1)
    assert.match(issues[0].message, /excede/)
  })

  it('combina ruta, tamaño y contenido', () => {
    const issues = validateStaged([
      { path: '.env', size: 10, content: fakeAwsKey },
      { path: 'src/ok.ts', size: 10, content: 'export {}' },
    ])
    assert.equal(issues.length, 2)
    assert.ok(issues.every((i) => i.path === '.env'))
  })

  it('devuelve vacío cuando todo está bien', () => {
    assert.deepEqual(validateStaged([{ path: 'README.md', size: 100, content: '# hola' }]), [])
  })
})
