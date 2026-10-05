import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  checkConvivencia,
  isProtected,
  parsePushRefs,
  validateBranchName,
  validatePushRefs,
} from './validate-convivencia.mts'

describe('validateBranchName', () => {
  it('acepta ramas tipadas en kebab-case', () => {
    assert.deepEqual(validateBranchName('feat/filtro-talleres'), [])
    assert.deepEqual(validateBranchName('fix/qr-scanner.v2'), [])
    assert.deepEqual(validateBranchName('agent/git-specialist'), [])
  })

  it('acepta ramas protegidas', () => {
    assert.deepEqual(validateBranchName('main'), [])
  })

  it('advierte (no falla) con snake_case de worktree de agente', () => {
    const f = validateBranchName('activate_security_turbo_mode')
    assert.equal(f.length, 1)
    assert.equal(f[0].level, 'warning')
  })

  it('rechaza nombres sin tipo o con mayúsculas/espacios', () => {
    assert.equal(validateBranchName('Mi Rama')[0].level, 'error')
    assert.equal(validateBranchName('feat/Mayus')[0].level, 'error')
    assert.equal(validateBranchName('random')[0].level, 'error')
  })
})

describe('checkConvivencia', () => {
  it('bloquea HEAD desacoplado', () => {
    const f = checkConvivencia({ branch: null, behind: 0, ahead: 0 })
    assert.equal(f[0].level, 'error')
  })

  it('bloquea commits en main salvo override', () => {
    assert.equal(checkConvivencia({ branch: 'main', behind: 0, ahead: 0 })[0].level, 'error')
    assert.deepEqual(checkConvivencia({ branch: 'main', behind: 0, ahead: 0, allowProtected: true }), [])
  })

  it('advierte cuando la rama está detrás del upstream', () => {
    const f = checkConvivencia({ branch: 'feat/x', behind: 3, ahead: 1 })
    assert.equal(f.length, 1)
    assert.equal(f[0].level, 'warning')
  })

  it('no reporta nada en una rama sana', () => {
    assert.deepEqual(checkConvivencia({ branch: 'feat/x', behind: 0, ahead: 2 }), [])
  })
})

describe('push refs', () => {
  const sha = 'a'.repeat(40)
  const zero = '0'.repeat(40)

  it('parsea las líneas que git envía al hook pre-push', () => {
    const refs = parsePushRefs(`refs/heads/feat/x ${sha} refs/heads/feat/x ${zero}\n`)
    assert.equal(refs.length, 1)
    assert.equal(refs[0].remoteRef, 'refs/heads/feat/x')
  })

  it('bloquea push directo a main y borrado de main', () => {
    const push = parsePushRefs(`refs/heads/feat/x ${sha} refs/heads/main ${zero}`)
    assert.equal(validatePushRefs(push)[0].level, 'error')
    const del = parsePushRefs(`(delete) ${zero} refs/heads/main ${sha}`)
    assert.match(validatePushRefs(del)[0].message, /Eliminar/)
  })

  it('permite push de rama de feature y respeta el override', () => {
    const ok = parsePushRefs(`refs/heads/feat/x ${sha} refs/heads/feat/x ${zero}`)
    assert.deepEqual(validatePushRefs(ok), [])
    const main = parsePushRefs(`refs/heads/feat/x ${sha} refs/heads/main ${zero}`)
    assert.equal(validatePushRefs(main, true).some((f) => f.level === 'error'), false)
  })

  it('ignora tags', () => {
    const tag = parsePushRefs(`refs/tags/v1 ${sha} refs/tags/v1 ${zero}`)
    assert.deepEqual(validatePushRefs(tag), [])
  })
})

describe('isProtected', () => {
  it('reconoce ramas protegidas', () => {
    assert.equal(isProtected('main'), true)
    assert.equal(isProtected('feat/x'), false)
  })
})
