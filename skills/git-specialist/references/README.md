# git-specialist — Índice de referencias

Este directorio concentra **toda** la documentación de la skill; `SKILL.md` solo apunta aquí.
Cada práctica enlaza a su fuente. Verificación de URLs: respuesta HTTP correcta el **2026-10-04**.

| Documento | Cubre | Scripts relacionados |
|---|---|---|
| [git-hooks.md](./git-hooks.md) | Hooks versionados (`core.hooksPath`), `commit-msg`, `pre-commit`, `pre-push`, política de bypass | `validate-commit.mts`, `validate-staged.mts` |
| [multi-agent-branching.md](./multi-agent-branching.md) | Ramas, worktrees, convivencia entre agentes/personas, publicación segura, guardia de comandos | `validate-convivencia.mts`, `guardia-antigravity.mts`, `publicar-codigo.mts` |

## Fuentes (todas verificadas)

| # | Fuente | URL | Se usa para |
|---|---|---|---|
| S1 | Git — githooks | https://git-scm.com/docs/githooks | Hooks disponibles, argumentos, códigos de salida |
| S2 | Git — git-worktree | https://git-scm.com/docs/git-worktree | Un worktree por agente/tarea |
| S3 | Pro Git — Contributing to a Project | https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project | Guía de commits y flujo de contribución |
| S4 | Pro Git — Branching Workflows | https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows | Ramas de tema de vida corta |
| S5 | Conventional Commits 1.0.0 | https://www.conventionalcommits.org/en/v1.0.0/ | Formato `<tipo>(<alcance>)!: <descripción>` |
| S6 | Cómo escribir un buen commit (reglas 50/72) | https://cbea.ms/git-commit/ | Límite 50/72, modo imperativo, sin punto final |
| S7 | Node.js — TypeScript (type stripping) | https://nodejs.org/api/typescript.html | Ejecutar `.mts` sin build; extensiones obligatorias en imports |
| S8 | Node.js — test runner | https://nodejs.org/api/test.html | `node --test`, `node:test` estable |
| S9 | GitHub Docs — protected branches | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches | Complemento remoto de los hooks locales |

> Los hooks locales son **ayuda al desarrollador**, no seguridad: se pueden saltar con `--no-verify`.
> La barrera real es la protección de rama en GitHub (ver skill `github-specialist`).
