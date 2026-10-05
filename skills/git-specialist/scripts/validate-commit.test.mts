import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { hasBreakingChange, validateCommitMessage } from './validate-commit.mts'

describe('validateCommitMessage', () => {
  it('acepta un commit convencional simple', () => {
    const r = validateCommitMessage('feat: agrega filtro por taller')
    assert.equal(r.valid, true)
    assert.deepEqual(r.errors, [])
  })

  it('acepta alcance y breaking con "!"', () => {
    assert.equal(validateCommitMessage('fix(admin)!: corrige exportación').valid, true)
  })

  it('acepta cuerpo separado por línea en blanco', () => {
    const r = validateCommitMessage('docs: actualiza guía\n\nExplica el porqué del cambio.')
    assert.equal(r.valid, true)
  })

  it('rechaza mensaje vacío o solo comentarios', () => {
    assert.equal(validateCommitMessage('').valid, false)
    assert.equal(validateCommitMessage('# solo comentario\n').valid, false)
  })

  it('rechaza formato sin tipo', () => {
    const r = validateCommitMessage('agrega cosas')
    assert.equal(r.valid, false)
    assert.match(r.errors[0], /Encabezado inválido/)
  })

  it('rechaza tipo no permitido', () => {
    const r = validateCommitMessage('feature: algo')
    assert.equal(r.valid, false)
    assert.match(r.errors.join(' '), /no permitido/)
  })

  it('rechaza punto final en la descripción', () => {
    assert.equal(validateCommitMessage('fix: corrige bug.').valid, false)
  })

  it('rechaza encabezado mayor a 72 y advierte sobre 50', () => {
    const long = `feat: ${'a'.repeat(70)}`
    assert.equal(validateCommitMessage(long).valid, false)
    const medium = `feat: ${'a'.repeat(50)}`
    const r = validateCommitMessage(medium)
    assert.equal(r.valid, true)
    assert.equal(r.warnings.length, 1)
  })

  it('exige línea en blanco antes del cuerpo', () => {
    const r = validateCommitMessage('feat: algo\ncuerpo pegado')
    assert.equal(r.valid, false)
    assert.match(r.errors.join(' '), /línea en blanco/)
  })

  it('ignora merges, reverts y fixups autogenerados', () => {
    assert.equal(validateCommitMessage("Merge branch 'main' into feat/x").valid, true)
    assert.equal(validateCommitMessage('Revert "feat: algo"').valid, true)
    assert.equal(validateCommitMessage('fixup! feat: algo').valid, true)
  })

  it('ignora líneas de comentario de git', () => {
    assert.equal(validateCommitMessage('fix: algo\n# Please enter the commit message').valid, true)
  })
})

describe('hasBreakingChange', () => {
  it('detecta "!" y footer BREAKING CHANGE', () => {
    assert.equal(hasBreakingChange('feat!: x'), true)
    assert.equal(hasBreakingChange('feat: x\n\nBREAKING CHANGE: cambia API'), true)
    assert.equal(hasBreakingChange('feat: x'), false)
  })
})
