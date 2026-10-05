import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { evaluateCommand, splitCommands, toGitArgs } from './guardia-antigravity.mts'

const blocked = (cmd: string, rule: string) => {
  const v = evaluateCommand(cmd)
  assert.equal(v.allowed, false, `debería bloquear: ${cmd}`)
  assert.equal(v.rule, rule, `regla incorrecta para: ${cmd}`)
}
const allowed = (cmd: string) => assert.equal(evaluateCommand(cmd).allowed, true, `debería permitir: ${cmd}`)

describe('evaluateCommand — bloqueos', () => {
  it('push forzado y push a ramas protegidas', () => {
    blocked('git push --force origin feat/x', 'push-force')
    blocked('git push -f', 'push-force')
    blocked('git push origin main', 'push-protected')
    blocked('git push origin feat/x:main', 'push-protected')
  })

  it('borrados remotos', () => {
    blocked('git push origin --delete feat/x', 'push-delete')
    blocked('git push origin :feat/x', 'push-delete')
  })

  it('operaciones destructivas locales', () => {
    blocked('git reset --hard HEAD~1', 'reset-hard')
    blocked('git clean -fd', 'clean-force')
    blocked('git restore .', 'discard-changes')
    blocked('git checkout -- .', 'discard-changes')
    blocked('git branch -D feat/x', 'branch-force-delete')
    blocked('git stash drop', 'stash-drop')
    blocked('git stash clear', 'stash-drop')
  })

  it('saltar hooks o tocar su configuración', () => {
    blocked('git commit -m "x" --no-verify', 'no-verify')
    blocked('git commit -n -m "x"', 'no-verify')
    blocked('git push --no-verify origin feat/x', 'no-verify')
    blocked('git config core.hooksPath /dev/null', 'hooks-tamper')
  })

  it('reescritura de historia y rebase interactivo', () => {
    blocked('git rebase -i HEAD~3', 'interactive-rebase')
    blocked('git filter-branch --all', 'rewrite-history')
  })

  it('detecta comandos dentro de cadenas y con opciones globales', () => {
    blocked('pnpm lint && git push -f', 'push-force')
    blocked('git -C ../repo reset --hard', 'reset-hard')
    blocked('echo ok; git clean -fdx', 'clean-force')
  })

  it('borrado de .git', () => {
    blocked('rm -rf .git', 'rm-dot-git')
  })
})

describe('evaluateCommand — permitidos', () => {
  it('flujo normal de trabajo', () => {
    allowed('git status')
    allowed('git add GEMINI.md')
    allowed('git commit -m "docs: algo"')
    allowed('git push -u origin feat/x')
    allowed('git push --force-with-lease origin feat/x')
    allowed('git fetch origin')
    allowed('git rebase origin/main')
    allowed('git restore --staged src/App.tsx')
    allowed('git branch -d feat/merged')
    allowed('git stash push -m "wip"')
    allowed('pnpm build && pnpm lint')
    allowed('ls -la')
  })
})

describe('helpers', () => {
  it('splitCommands separa operadores de shell', () => {
    assert.deepEqual(splitCommands('a && b || c; d | e'), ['a', 'b', 'c', 'd', 'e'])
  })

  it('toGitArgs ignora -C/-c y devuelve null si no es git', () => {
    assert.deepEqual(toGitArgs('git -C /tmp -c a=b status -s'), ['status', '-s'])
    assert.equal(toGitArgs('ls -la'), null)
  })
})
