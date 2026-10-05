---
name: git-specialist
description: Especialista en Git del proyecto Esencia Conf. Úsalo para commits, ramas, worktrees, hooks, publicar código o PRs, y antes de ejecutar cualquier comando git destructivo. Valida mensajes (Conventional Commits), archivos en staging, convivencia entre agentes y publicación segura.
---

# git-specialist

`SKILL.md` es solo un índice. Las prácticas, fuentes con URL y reglas están en `references/`.

## Qué leer según la tarea

| Tarea | Leer |
|---|---|
| Panorama y fuentes verificadas | [references/README.md](references/README.md) |
| Hooks, formato de commit, secretos en staging, ejecutar `.mts` | [references/git-hooks.md](references/git-hooks.md) |
| Ramas, worktrees, publicar, guardia de comandos | [references/multi-agent-branching.md](references/multi-agent-branching.md) |
| Protección de ramas, PRs, seguridad en GitHub | skill hermana `github-specialist` |

## Scripts (`scripts/`, TypeScript `.mts` ejecutado con Node)

| Script | Uso |
|---|---|
| `validate-commit.mts` | Hook `commit-msg` · `node … --message "feat: x"` |
| `validate-staged.mts` | Hook `pre-commit` (rutas, secretos, tamaño) |
| `validate-convivencia.mts` | Hooks `pre-commit`/`pre-push` · chequeo manual |
| `guardia-antigravity.mts` | `node … "<comando git>"` → exit 1 si está bloqueado |
| `publicar-codigo.mts` | `node … [--base main] [--dry-run] [--skip-checks]` |

Cada script tiene su `*.test.mts`. Ejecutar todo: `pnpm test:git`.

## Reglas mínimas (detalle en references)

1. Mensajes `tipo(alcance)!: descripción`, encabezado ≤ 72 (ideal ≤ 50).
2. Nunca commit/push directo a `main`; rama `<tipo>/<kebab-case>` + PR.
3. Nunca `--force`, `--no-verify`, `reset --hard`, `clean -f` sin aprobación explícita.
4. Publicar con `publicar-codigo.mts`, no con `git push` manual.

## Assets

- `assets/gitmessage.txt`: plantilla para `git config commit.template`.
