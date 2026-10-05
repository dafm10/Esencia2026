# Git hooks versionados y validación de commits

Fuentes: [S1 githooks](https://git-scm.com/docs/githooks) · [S5 Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) · [S6 reglas 50/72](https://cbea.ms/git-commit/) · [S7 Node type stripping](https://nodejs.org/api/typescript.html) · [S8 node:test](https://nodejs.org/api/test.html)

## 1. Hooks versionados con `core.hooksPath`

- Por defecto Git busca hooks en `.git/hooks`, que **no se versiona**. La práctica estándar es guardarlos en el repo (`.githooks/`) y apuntar Git a esa carpeta: `git config core.hooksPath .githooks` (requiere Git ≥ 2.9). [S1]
- Los scripts deben ser ejecutables (`chmod +x .githooks/*`). Un hook que sale con código distinto de 0 aborta la operación. [S1]
- Este repo lo automatiza con `pnpm install` → script `prepare` (ver `package.json`). La configuración vive en el `.git/config` común, así que aplica a **todos los worktrees**.

| Hook | Cuándo corre | Qué ejecuta aquí | Costo |
|---|---|---|---|
| `commit-msg` | Tras escribir el mensaje; recibe la ruta del archivo (`$1`) [S1] | `validate-commit.mts "$1"` | Instantáneo |
| `pre-commit` | Antes de crear el commit [S1] | `validate-staged.mts` + `validate-convivencia.mts --hook pre-commit` | Rápido (solo staging) |
| `pre-push` | Antes de enviar; recibe refs por stdin [S1] | `validate-convivencia.mts --hook pre-push` | Rápido |

Regla de diseño: **pre-commit rápido, trabajo pesado (lint/build/tests) en `publicar-codigo.mts` o CI**. Los hooks lentos incentivan el `--no-verify`.

## 2. Reglas de `commit-msg` (implementadas en `validate-commit.mts`)

Formato [S5]: `<tipo>[alcance opcional][!]: <descripción>` + cuerpo opcional + pie opcional.

| Regla | Severidad | Fuente |
|---|---|---|
| Tipo ∈ `feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert` | Error | S5 |
| `!` tras tipo/alcance o pie `BREAKING CHANGE:` marca cambio incompatible | Soportado | S5 |
| Encabezado ≤ 72 caracteres | Error | S6 |
| Encabezado ≤ 50 caracteres | Advertencia | S6 |
| Sin punto final en la descripción | Error | S6 |
| Línea en blanco entre encabezado y cuerpo | Error | S6 |
| Cuerpo ajustado (aquí ≤ 100, advertencia) y explica *qué* y *por qué*, no *cómo* | Advertencia | S6 |
| Descripción en minúscula | Advertencia | S5 (convención) |
| `Merge …`, `Revert "…"`, `fixup!`/`squash!` se omiten | — | Mensajes autogenerados por git |

Plantilla opcional: `assets/gitmessage.txt` (`git config commit.template skills/git-specialist/assets/gitmessage.txt`).

## 3. Reglas de `pre-commit` (`validate-staged.mts`)

| Verificación | Detalle |
|---|---|
| Rutas prohibidas | `.env*` (excepto `.env.example`), `*.pem/*.key/*.p12`, `id_rsa*`, `node_modules/`, `dist/`, `*.log`, `.DS_Store` |
| Secretos en contenido | AWS key, llaves privadas, tokens de GitHub, Stripe live, Resend, `*_SERVICE_ROLE_KEY=…` |
| Tamaño | Máx. 5 MB por archivo |

El escaneo local es una primera línea; el respaldo remoto es *push protection* de GitHub (ver `github-specialist`).

## 4. Ejecutar TypeScript (`.mts`) sin build

- Node ejecuta archivos con sintaxis TypeScript **borrable** (type stripping) sin flags en versiones actuales; no hace chequeo de tipos. [S7]
- Consecuencias para los scripts: nada de `enum`, `namespace` ni *parameter properties*; los `import` **deben llevar extensión** (`./validate-commit.mts`). [S7]
- Pruebas con el runner nativo: `node --test "skills/*/scripts/*.test.mts"` (`pnpm test:git`). [S8]
- Entorno actual verificado: Node v26.4.0.

## 5. Política de bypass

- `git commit --no-verify` / `git push --no-verify` **están prohibidos** para agentes (`guardia-antigravity.mts` los bloquea).
- Para personas: usar solo en emergencias y dejar constancia en el PR. Para operar en ramas protegidas existe `ESENCIA_ALLOW_PROTECTED=1`.
- Los hooks son código que se ejecuta localmente: revísalos en cada PR como cualquier otro código.

## 6. Cómo probar

```bash
pnpm test:git                                    # 52+ pruebas node:test
node skills/git-specialist/scripts/validate-commit.mts --message "feat: algo"
git commit --allow-empty -m "mal mensaje"        # debe ser rechazado por commit-msg
```
