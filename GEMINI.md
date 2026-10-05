# GEMINI.md - Directrices y Contexto del Proyecto Esencia Conf

Bienvenido al repositorio de **Esencia Conf**. Este archivo contiene la guía de arquitectura, estándares de código, flujos de desarrollo y configuración de herramientas para agentes en Google Antigravity.

---

## 1. Visión General del Proyecto

**Esencia Conf** es una plataforma integral para la gestión del evento *Esencia 2026*, combinando:
1. **Landing Page y Registro Público (`/registro`)**: Formulario por pasos con subida de comprobantes de pago, captura de datos detallados (DNI, Iglesia, Cargo, Edad, Profesión) y selección de talleres por día con control de aforo dinámico.
2. **Panel de Administración (`/admin`)**: Dashboard con métricas/KPIs, control de órdenes, visor de comprobantes (URLs firmadas temporales), contacto rápido por WhatsApp, generación y exportación de reportes a Excel, registro masivo (`/admin/bulk-register`) y escáner de asistencia móvil con código QR (`/admin/attendance`).
3. **Backend Serverless (Supabase)**:
   - **Base de Datos**: PostgreSQL con políticas RLS (Row Level Security).
   - **Storage**: Buckets seguros para almacenamiento de comprobantes de pago.
   - **Edge Functions (Deno)**:
     - `create-order`: Valida cupos concurrentemente, inserta la orden, genera tickets y envía confirmación por Resend.
     - `approve-order`: Aprobación administrativa y emisión final.
   - **RPCs**: Funciones almacenadas como `get_workshop_counts` para consultar disponibilidad de talleres en tiempo real sin romper RLS.

---

## 2. Stack Tecnológico

- **Frontend**:
  - React 19 + TypeScript (Strict mode)
  - Vite 8 (Bundler y entorno de desarrollo rápido)
  - Tailwind CSS v4 (`@tailwindcss/vite`)
  - React Router DOM v7 (Manejo de rutas públicas y protegidas)
  - Framer Motion (Animaciones de UI)
  - Recharts & React Icons (Visualización de datos e iconografía)
- **Utilidades Core**:
  - `pdf-lib` + `qrcode`: Generación dinámica de tickets en PDF con código QR.
  - `exceljs` + `file-saver`: Generación y parseo de plantillas Excel para registro masivo y reportes.
  - `@yudiel/react-qr-scanner` / `html5-qrcode`: Lectura de códigos QR en puerta.
- **Backend & Cloud**:
  - Supabase (`@supabase/supabase-js`, Supabase CLI)
  - Edge Functions en TypeScript/Deno
  - Resend API (Envío transaccional de correos)

---

## 3. Estructura de Directorios

```text
.
├── src/
│   ├── components/
│   │   ├── admin/       # Componentes del dashboard, tablas de órdenes, scanner QR
│   │   ├── layout/      # Navbar, Header, Sidebar, Footer
│   │   ├── sections/    # Secciones de la Landing y Formulario de Registro
│   │   └── ui/          # Componentes reutilizables (Botones, Modales, Tarjetas)
│   ├── data/            # Configuración estática (talleres, departamentos/ciudades)
│   ├── hooks/           # Custom hooks (useAuth, useOrders)
│   ├── lib/             # Clientes externos (supabaseClient)
│   ├── pages/
│   │   ├── admin/       # Vistas protegidas de administración
│   │   └── public/      # Landing, Registro, Confirmación, 404
│   ├── routes/          # AppRouter y ProtectedRoute
│   ├── types/           # Tipados TypeScript del dominio y base de datos
│   └── utils/           # Generador de PDF (pdfGenerator), formateadores
├── supabase/
│   ├── functions/       # Edge functions Deno (create-order, approve-order)
│   └── config.toml      # Configuración de Supabase local
└── public/              # Assets públicos, logos e imágenes
```

---

## 4. Comandos de Desarrollo

El gestor de paquetes del proyecto es **pnpm**:

```bash
# Iniciar servidor de desarrollo (Vite)
pnpm dev

# Comprobar tipos y compilar para producción
pnpm build

# Ejecutar linter (ESLint 9/10)
pnpm lint

# Previsualizar el build de producción localmente
pnpm preview

# Despliegue de Edge Functions en Supabase
supabase functions deploy create-order
supabase functions deploy approve-order
```

---

## 5. Reglas y Convenciones de Código

### TypeScript & React
- Usar TypeScript estricto. Evitar terminantemente el uso de `any`; definir interfaces explícitas en `src/types/`.
- Componentes funcionales modernos con hooks de React 19.
- Mantener la separación de responsabilidades: la lógica de llamadas a Supabase y estado complejo debe residir en hooks (`src/hooks/`) o utilidades (`src/utils/`).
- Mantener la integridad de rutas protegidas en `src/routes/ProtectedRoute.tsx` validando la sesión activa de Supabase Auth.

### Estilizado con Tailwind CSS v4
- Usar clases utilitarias de Tailwind v4 evitando CSS en línea innecesario.
- Seguir el diseño visual del proyecto: Glassmorphism (`backdrop-blur`, fondos semitransparentes, bordes tenues), paleta oscura/elegante con acentos acordes al branding de Esencia Conf.
- Asegurar diseño responsivo (mobile-first), especialmente en el formulario de inscripción y el escáner de asistencia QR.

### Supabase y Base de Datos
- **Seguridad RLS**: Nunca desactivar RLS en tablas expuestas al cliente (`orders`, `attendees`, etc.).
- **Cupos de talleres**: Las consultas de disponibilidad para validación visual deben hacerse preferentemente mediante las funciones RPC autorizadas (`get_workshop_counts`), garantizando conteos atómicos.
- **Comprobantes de pago**: Acceder a las imágenes mediante URLs firmadas generadas en el backend/hook de administración para respetar la privacidad de los asistentes.

---

## 6. Integración MCP y Herramientas del Agente

- **Chrome DevTools MCP (`chrome-devtools-mcp`)**:
  - Habilitado para depuración, inspección en vivo de elementos del DOM, monitoreo de errores de consola en el navegador y verificación de estilos responsivos.
- **Supabase MCP**:
  - Permite consultar esquemas, tablas y operaciones de base de datos de manera integrada.
- **Pruebas y Verificación**:
  - Tras cualquier cambio relevante de código, ejecutar `pnpm lint` o `pnpm build` para asegurar que no se introduzcan errores de tipado o regresiones de compilación.

---

## 7. Skills de Antigravity (Directrices de Activación)

El agente debe activar y consultar proactivamente las siguientes skills según el tipo de tarea:

1. **`modern-web-guidance`**:
   - **Cuándo activar:** Obligatorio para tareas de maquetación HTML/CSS, Tailwind CSS v4, animaciones con Framer Motion, diseño de formularios y componentes de UI. Asegura el uso de APIs y estándares web modernos sin caer en patrones obsoletos.
2. **`chrome-devtools`**:
   - **Cuándo activar:** Al depurar errores visuales en runtime, verificar interactividad en `localhost`, capturar screenshots del flujo de registro o inspeccionar errores en la consola y red.
3. **`a11y-debugging`**:
   - **Cuándo activar:** Para auditorías de accesibilidad (WCAG/A11y), contrastes de color en el tema oscuro/glassmorphic, navegación accesible por teclado en el formulario por pasos y accesibilidad en el panel `/admin`.
4. **`debug-optimize-lcp`**:
   - **Cuándo activar:** En tareas de optimización de rendimiento y Core Web Vitals (LCP, CLS, INP) de la Landing Page pública (`/`) y carga optimizada de imágenes/logos.
5. **`memory-leak-debugging`**:
   - **Cuándo activar:** Al depurar o refactorizar el escáner de códigos QR (`@yudiel/react-qr-scanner` o `html5-qrcode`) en `/admin/attendance`, verificando la liberación correcta del stream de la cámara y heap memory.
6. **`generative_ui`**:
   - **Cuándo activar:** Para renderizar previsualizaciones interactivas de nuevos componentes de dashboard, widgets de métricas o simulaciones de flujos antes de aplicarlos al código.

