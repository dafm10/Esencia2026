import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { CHECK_COMMANDS, planPublish, prCommand, type PublishInput } from './publicar-codigo.mts'

const healthy: PublishInput = {
  branch: 'feat/filtro',
  base: 'main',
  dirty: false,
  behindBase: 0,
  aheadOfBase: 2,
  skipChecks: false,
}

describe('planPublish', () => {
  it('planifica checks y push sin force cuando todo está sano', () => {
    const plan = planPublish(healthy)
    assert.equal(plan.ok, true)
    assert.deepEqual(plan.steps.slice(0, CHECK_COMMANDS.length), CHECK_COMMANDS)
    assert.deepEqual(plan.steps.at(-3), ['node', 'skills/git-specialist/scripts/strip-ai-files.mts', 'main'])
    assert.deepEqual(plan.steps.at(-2), ['git', 'push', '-f', 'origin', 'publish_temp:feat/filtro'])
    assert.deepEqual(plan.steps.at(-1), ['git', 'branch', '-D', 'publish_temp'])
  })

  it('omite checks con skipChecks', () => {
    const plan = planPublish({ ...healthy, skipChecks: true })
    assert.deepEqual(plan.steps, [
      ['node', 'skills/git-specialist/scripts/strip-ai-files.mts', 'main'],
      ['git', 'push', '-f', 'origin', 'publish_temp:feat/filtro'],
      ['git', 'branch', '-D', 'publish_temp']
    ])
  })

  it('falla con árbol sucio', () => {
    const plan = planPublish({ ...healthy, dirty: true })
    assert.equal(plan.ok, false)
    assert.deepEqual(plan.steps, [])
    assert.match(plan.errors[0], /sin commitear/)
  })

  it('falla si la rama está detrás de la base', () => {
    const plan = planPublish({ ...healthy, behindBase: 4 })
    assert.equal(plan.ok, false)
    assert.match(plan.errors.join(' '), /git rebase origin\/main/)
  })

  it('falla si no hay commits nuevos', () => {
    const plan = planPublish({ ...healthy, aheadOfBase: 0 })
    assert.equal(plan.ok, false)
  })

  it('falla en rama protegida o HEAD desacoplado', () => {
    assert.equal(planPublish({ ...healthy, branch: 'main' }).ok, false)
    assert.equal(planPublish({ ...healthy, branch: null }).ok, false)
  })

  it('advierte (sin fallar) con rama snake_case de worktree', () => {
    const plan = planPublish({ ...healthy, branch: 'activate_security_turbo_mode' })
    assert.equal(plan.ok, true)
    assert.equal(plan.warnings.length, 1)
  })
})

describe('prCommand', () => {
  it('genera el comando de gh', () => {
    assert.equal(prCommand('feat/x', 'main'), 'gh pr create --base main --head feat/x --fill')
  })
})
