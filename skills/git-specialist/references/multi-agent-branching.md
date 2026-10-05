# Ramas, worktrees y convivencia multi-agente

Fuentes: [S2 git-worktree](https://git-scm.com/docs/git-worktree) · [S3 Pro Git — Contributing](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project) · [S4 Pro Git — Branching Workflows](https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows) · [S9 protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

## 1. Modelo de trabajo

- **Ramas de tema de vida corta**: una rama por tarea, integrada pronto y borrada después. [S4]
- **Un worktree por agente/tarea**: `git worktree` permite varias copias de trabajo del mismo repositorio, cada una con su rama, sin pisarse. [S2] Antigravity ya lo hace (`~/.gemini/antigravity/worktrees/<repo>/<tarea>`).
- Git impide tener la **misma rama** en dos worktrees a la vez. [S2] Esa garantía es la base de la convivencia: nunca se comparte un árbol de trabajo entre agentes.
- `main` solo recibe cambios vía **Pull Request** con checks; la protección real se configura en GitHub. [S9]

## 2. Nombres de rama (`validate-convivencia.mts`)

| Patrón | Resultado |
|---|---|
| `<tipo>/<kebab-case>` con tipo ∈ `feat, fix, docs, style, refactor, perf, test, build, ci, chore, hotfix, release, agent` | ✅ válido |
| `main`, `master`, `develop` | ✅ válidas, pero **protegidas** |
| `snake_case` (rama autogenerada de worktree, p. ej. `activate_security_turbo_mode`) | ⚠️ advertencia: renombrar antes del PR (`git branch -m`) |
| Cualquier otra (mayúsculas, espacios, sin tipo) | ❌ error |

## 3. Reglas de convivencia

| # | Regla | Dónde se aplica |
|---|---|---|
| C1 | Sin commits directos en ramas protegidas | `pre-commit` |
| C2 | Sin push directo ni borrado de ramas protegidas | `pre-push` |
| C3 | Sin HEAD desacoplado al commitear | `pre-commit` |
| C4 | Aviso si la rama está detrás de su upstream | `pre-commit` |
| C5 | Nunca `push --force`; solo `--force-with-lease` en rama propia y con aprobación | `guardia-antigravity.mts` |
| C6 | Un agente no toca el worktree de otro | Diseño (git lo garantiza por rama) [S2] |

Override consciente (solo humanos, emergencias): `ESENCIA_ALLOW_PROTECTED=1`.

## 4. Publicar (`publicar-codigo.mts`)

Flujo y orden de verificación:

1. Árbol limpio (sin cambios sin commitear).
2. Convivencia: rama válida, no protegida, no desacoplada.
3. `git fetch origin --prune` y sincronía con `origin/<base>`: si hay commits de la base que faltan → **error** con el comando `git rebase origin/<base>`.
4. Debe haber commits nuevos respecto a la base.
5. Checks: `pnpm lint`, `pnpm build`, `pnpm test:git` (omitibles con `--skip-checks`).
6. `git push -u origin <rama>` — **nunca** con force.
7. Imprime `gh pr create --base <base> --head <rama> --fill`.

`--dry-run` imprime los pasos sin ejecutarlos.

```bash
node skills/git-specialist/scripts/publicar-codigo.mts --dry-run
```

## 5. Guardia de agentes (`guardia-antigravity.mts`)

Evalúa un comando (incluso encadenado con `&&`, `;`, `|`) y devuelve exit 1 si coincide con una regla. Úsalo para alimentar la *Command Denylist* de Antigravity o como verificación previa.

| Regla | Bloquea |
|---|---|
| `push-force` | `git push --force` / `-f` (permite `--force-with-lease`) |
| `push-protected` | push con destino `main`/`master`/`develop` (incluye `rama:main`) |
| `push-delete` | `git push --delete`, `git push origin :rama` |
| `reset-hard` | `git reset --hard` |
| `clean-force` | `git clean -f…` |
| `discard-changes` | `git restore .`, `git checkout -- .` |
| `branch-force-delete` | `git branch -D` |
| `no-verify` | `--no-verify`, `git commit -n` |
| `rewrite-history` | `filter-branch`, `filter-repo` |
| `interactive-rebase` | `git rebase -i` |
| `stash-drop` | `git stash drop/clear` |
| `hooks-tamper` | `git config core.hooksPath …` |
| `rm-dot-git` | `rm -rf .git` |

```bash
node skills/git-specialist/scripts/guardia-antigravity.mts "git push -f origin main"   # exit 1
```

## 6. Cuándo escalar a una persona

Cualquier comando bloqueado por la guardia, conflictos de rebase no triviales, o necesidad de tocar `main` directamente: detenerse y pedir confirmación explícita al usuario.
