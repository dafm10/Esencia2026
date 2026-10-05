import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { validateWorkflow } from './validate-workflows.mts'

const sha = 'a'.repeat(40)

const goodWorkflow = `name: ci
on: [push]
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@${sha} # v4.2.2
      - uses: ./.github/actions/local
      - run: pnpm build
`

describe('validateWorkflow', () => {
  it('acepta un workflow endurecido', () => {
    assert.deepEqual(validateWorkflow('ci.yml', goodWorkflow), [])
  })

  it('exige SHA completo en las acciones', () => {
    const f = validateWorkflow('ci.yml', goodWorkflow.replace(sha, 'v4'))
    assert.equal(f.length, 1)
    assert.equal(f[0].level, 'error')
    assert.equal(f[0].line, 9)
  })

  it('rechaza tags flotantes y ramas', () => {
    const text = goodWorkflow.replace(`@${sha} # v4.2.2`, '@main')
    assert.equal(validateWorkflow('ci.yml', text).some((x) => x.level === 'error'), true)
  })

  it('advierte si falta permissions', () => {
    const f = validateWorkflow('ci.yml', goodWorkflow.replace('permissions:\n  contents: read\n', ''))
    assert.equal(f.length, 1)
    assert.equal(f[0].level, 'warning')
  })

  it('detecta inyección de scripts en run', () => {
    const text = goodWorkflow.replace(
      '- run: pnpm build',
      '- run: echo "${{ github.event.pull_request.title }}"',
    )
    const f = validateWorkflow('ci.yml', text)
    assert.equal(f.length, 1)
    assert.match(f[0].message, /inyección/)
  })

  it('permite la forma segura vía env', () => {
    const text = goodWorkflow.replace(
      '- run: pnpm build',
      '- env:\n          PR_TITLE: ${{ github.event.pull_request.title }}\n        run: echo "$PR_TITLE"',
    )
    assert.deepEqual(validateWorkflow('ci.yml', text), [])
  })

  it('advierte sobre pull_request_target', () => {
    const text = goodWorkflow.replace('on: [push]', 'on:\n  pull_request_target:')
    const f = validateWorkflow('ci.yml', text)
    assert.equal(f.length, 1)
    assert.match(f[0].message, /pull_request_target/)
  })
})
