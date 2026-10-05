# Protección de ramas, revisiones y Pull Requests

Fuentes: [G1 protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) · [G2 code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners) · [G3 revisión de PRs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/helping-others-review-your-changes) · [G4 plantilla de PR](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)

## 1. Checklist de protección de `main` (Settings → Branches) [G1]

| ✔ | Ajuste | Por qué |
|---|---|---|
| ☐ | Require a pull request before merging | Nada llega a `main` sin PR |
| ☐ | Require approvals (≥ 1) | Revisión humana |
| ☐ | Dismiss stale approvals on new commits | Una aprobación no cubre código nuevo |
| ☐ | Require review from Code Owners | Responsables por área [G2] |
| ☐ | Require status checks to pass (lint, build, `test:git`) | CI como compuerta |
| ☐ | Require branches to be up to date | Evita merges sobre base desactualizada |
| ☐ | Block force pushes | Protege la historia compartida |
| ☐ | Restrict/disable branch deletion | Evita borrados accidentales |
| ☐ | Include administrators | Las reglas aplican también a admins (por defecto no las incluyen) |

Estos ajustes son el **respaldo remoto** de los hooks locales (`git-specialist`): los hooks se pueden saltar, la protección de rama no.

## 2. CODEOWNERS [G2]

- Archivo en `.github/CODEOWNERS`, raíz o `docs/`. Cada regla asigna dueños a rutas; con "Require review from Code Owners" su aprobación es obligatoria.
- Plantilla lista: `assets/CODEOWNERS` (ajusta el usuario/equipo). Rutas sensibles del proyecto: `supabase/`, `.githooks/`, `skills/`, `.github/`.
- Los hooks y workflows son código ejecutable: deben tener dueño.

## 3. Pull Requests pequeños y revisables [G3]

- Un PR = un propósito; título en formato Conventional Commits (el squash lo convierte en el commit de `main`).
- Descripción con *qué*, *por qué*, cómo se probó y riesgos; enlaza el issue.
- Usa PR en borrador mientras no esté listo; pide revisión explícita.
- Autor responde cada comentario; los cambios posteriores van como commits nuevos (sin reescribir historia durante la revisión).

## 4. Plantilla de PR [G4]

- Archivo `.github/pull_request_template.md`; GitHub la precarga en cada PR nuevo.
- Plantilla lista: `assets/pull_request_template.md` (incluye checklist de seguridad y de pruebas).

## 5. Estrategia de merge recomendada

- **Squash merge** para ramas de feature: historia lineal y un commit convencional por PR.
- Borrar la rama tras el merge (vida corta, ver `git-specialist/references/multi-agent-branching.md`).

## 6. Verificación automática

```bash
node skills/github-specialist/scripts/validate-github-config.mts           # advertencias no bloquean
node skills/github-specialist/scripts/validate-github-config.mts --strict  # advertencias = fallo
```
