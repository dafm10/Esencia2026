# Seguridad en GitHub: secretos, Actions y dependencias

Fuentes: [G5 push protection](https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection) · [G6 hardening de Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions) · [G7 Dependabot](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates) · [G8 SECURITY.md](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository)

## 1. Secretos [G5]

- Activar **secret scanning + push protection** (Settings → Code security): bloquea el `git push` que contiene un secreto reconocido, antes de que llegue al repo.
- Complementa el escaneo local de `git-specialist/scripts/validate-staged.mts` (primera línea, sin red).
- Si un secreto se filtró: **rotarlo primero**, luego limpiar. Reescribir historia no lo des-filtra.
- Proyecto: nunca commitear `.env*` (salvo `.env.example`), `SERVICE_ROLE_KEY` de Supabase ni `RESEND_API_KEY`; usar *Secrets* de GitHub/Supabase.

## 2. GitHub Actions endurecidas [G6] — validado por `validate-workflows.mts`

| Práctica | Regla del script | Severidad |
|---|---|---|
| Fijar cada acción a un **SHA completo de 40 caracteres** (dejar la versión como comentario `# v4.2.2`) | `uses:` sin `@<sha40>` | Error |
| **Mínimo privilegio**: bloque `permissions:` explícito (`contents: read` por defecto) y `GITHUB_TOKEN` read-only por defecto en Settings | Falta `permissions:` | Advertencia |
| **Evitar inyección de scripts**: no interpolar `${{ github.event.*.title/body/… }}` ni `github.head_ref` en `run:`; pasarlos por `env:` | Interpolación directa | Error |
| Cuidado con `pull_request_target`: corre con secretos; no ejecutar código del PR | Presencia del trigger | Advertencia |

Ejemplo seguro:

```yaml
permissions:
  contents: read
steps:
  - uses: actions/checkout@<sha-de-40-caracteres> # v4.x
  - env:
      PR_TITLE: ${{ github.event.pull_request.title }}
    run: echo "$PR_TITLE"
```

## 3. Dependencias y acciones al día [G7]

- Dependabot version updates abre PRs para `npm` (pnpm) y `github-actions`; esto mantiene vigentes los SHA fijados. Plantilla: `assets/dependabot.yml`.
- Agrupar actualizaciones menores para reducir ruido; exigir que pasen los status checks.

## 4. Política de seguridad [G8]

- `SECURITY.md` (raíz, `.github/` o `docs/`) indica cómo reportar vulnerabilidades de forma privada. Plantilla: `assets/SECURITY.md`.

## 5. Checklist en Settings (no verificable desde el repo)

| ☐ | Ajuste |
|---|---|
| ☐ | Secret scanning y push protection activados |
| ☐ | Dependabot alerts y security updates activados |
| ☐ | Workflow permissions por defecto: *Read repository contents* |
| ☐ | Protección de `main` (ver `branch-protection-and-prs.md`) |
| ☐ | 2FA obligatorio para colaboradores |

## 6. Verificación

```bash
node skills/github-specialist/scripts/validate-workflows.mts
node skills/github-specialist/scripts/validate-github-config.mts
```
