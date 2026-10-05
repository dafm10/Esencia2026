import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { checkRepoFiles, type RepoFiles } from './validate-github-config.mts'

function fakeRepo(files: Record<string, string>): RepoFiles {
  return {
    exists: (path) => path in files,
    read: (path) => files[path],
  }
}

const complete = {
  '.github/CODEOWNERS': '* @dafm10',
  '.github/pull_request_template.md': '## Resumen',
  '.github/dependabot.yml': 'version: 2',
  'SECURITY.md': '# Seguridad',
  '.gitignore': 'node_modules\n.env\n.env.*\n',
}

describe('checkRepoFiles', () => {
  it('no reporta nada con configuración completa', () => {
    assert.deepEqual(checkRepoFiles(fakeRepo(complete)), [])
  })

  it('advierte por cada archivo recomendado ausente', () => {
    const findings = checkRepoFiles(fakeRepo({ '.gitignore': '.env\n' }))
    assert.equal(findings.length, 4)
    assert.ok(findings.every((f) => f.level === 'warning'))
  })

  it('acepta ubicaciones alternativas (raíz, docs)', () => {
    const findings = checkRepoFiles(
      fakeRepo({
        CODEOWNERS: '* @x',
        'docs/pull_request_template.md': 'x',
        '.github/dependabot.yaml': 'x',
        '.github/SECURITY.md': 'x',
        '.gitignore': '.env',
      }),
    )
    assert.deepEqual(findings, [])
  })

  it('falla si .gitignore no excluye .env', () => {
    const findings = checkRepoFiles(fakeRepo({ ...complete, '.gitignore': 'node_modules\n' }))
    assert.equal(findings.length, 1)
    assert.equal(findings[0].level, 'error')
  })

  it('falla si no hay .gitignore', () => {
    const { '.gitignore': _omit, ...rest } = complete
    const findings = checkRepoFiles(fakeRepo(rest))
    assert.equal(findings.some((f) => f.level === 'error'), true)
  })
})
