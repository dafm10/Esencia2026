# github-specialist — Índice de referencias

`SKILL.md` solo apunta aquí. Verificación de URLs: respuesta HTTP correcta el **2026-10-04**.
Las afirmaciones de cada documento citan la fuente con su código `G#`.

| Documento | Cubre | Scripts |
|---|---|---|
| [branch-protection-and-prs.md](./branch-protection-and-prs.md) | Protección de `main`, revisiones, CODEOWNERS, plantilla de PR | `validate-github-config.mts` |
| [github-security.md](./github-security.md) | Push protection, Actions endurecidas, Dependabot, SECURITY.md | `validate-workflows.mts`, `validate-github-config.mts` |

## Fuentes (todas verificadas)

| # | Fuente | URL |
|---|---|---|
| G1 | About protected branches | https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches |
| G2 | About code owners | https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners |
| G3 | Helping others review your changes | https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/getting-started/helping-others-review-your-changes |
| G4 | Creating a pull request template | https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository |
| G5 | About push protection (secret scanning) | https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection |
| G6 | Security hardening for GitHub Actions | https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions |
| G7 | About Dependabot version updates | https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates |
| G8 | Adding a security policy (SECURITY.md) | https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository |

## Límite de esta skill

El repo solo puede versionar archivos (`CODEOWNERS`, plantillas, workflows, `dependabot.yml`).
**La protección de ramas, push protection y permisos por defecto de `GITHUB_TOKEN` se activan en
GitHub → Settings** y no se pueden verificar desde el código: usa el checklist de cada documento.
