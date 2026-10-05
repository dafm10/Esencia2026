---
name: github-specialist
description: Especialista en buenas prácticas de GitHub del proyecto Esencia Conf. Úsalo para proteger ramas, revisar PRs, configurar CODEOWNERS/plantillas/Dependabot/SECURITY.md, endurecer workflows de GitHub Actions o auditar la configuración del repositorio.
---

# github-specialist

`SKILL.md` es solo un índice. Prácticas, fuentes con URL y checklists están en `references/`.

## Qué leer según la tarea

| Tarea | Leer |
|---|---|
| Panorama y fuentes verificadas | [references/README.md](references/README.md) |
| Protección de `main`, CODEOWNERS, PRs, plantilla de PR | [references/branch-protection-and-prs.md](references/branch-protection-and-prs.md) |
| Secretos, Actions, Dependabot, SECURITY.md | [references/github-security.md](references/github-security.md) |
| Commits, hooks, ramas locales, publicar | skill hermana `git-specialist` |

## Scripts (`scripts/`, `.mts` ejecutado con Node)

| Script | Uso |
|---|---|
| `validate-github-config.mts` | Audita CODEOWNERS, plantilla PR, Dependabot, SECURITY.md, `.gitignore` · `--strict` |
| `validate-workflows.mts` | Audita `.github/workflows/*.yml` (SHA fijados, permisos, inyección) |

Tests: `pnpm test:git` (incluye ambas skills).

## Assets (plantillas listas para copiar a `.github/` o raíz)

`pull_request_template.md` · `CODEOWNERS` · `dependabot.yml` · `SECURITY.md`

## Límite

La protección de ramas y push protection se activan en GitHub → Settings; usa los checklists de `references/`.
