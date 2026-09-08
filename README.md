# Esencia Conf - Sistema Integral de Gestión de Eventos

Esencia Conf es una plataforma web completa desarrollada con React, TypeScript y Vite. Diseñada no solo como Landing Page, sino como el núcleo operativo (Backend-as-a-Service integrado) para la **venta de entradas, gestión de aforos en talleres por día, emisión automatizada de tickets PDF, registro masivo y control de asistencia mediante escaneo QR**.

## 🚀 Stack Tecnológico y Arquitectura

El sistema emplea un stack moderno que prioriza el rendimiento del cliente y la escalabilidad del backend mediante serverless:

### Frontend (Cliente & Panel de Administración)
- **Core**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Estilizado**: Tailwind CSS v4 (Glassmorphism, variables nativas, animaciones).
- **Enrutamiento**: React Router DOM v7 (Manejo de rutas públicas y privadas).
- **Lectura QR**: `@yudiel/react-qr-scanner` para lectura eficiente en dispositivos móviles.
- **Generación PDF**: `pdf-lib` para creación/edición de buffers PDF y `qrcode` para incrustación dinámica de códigos de barras.
- **Manejo de Hojas de Cálculo**: `exceljs` y `file-saver` (Utilizados en reportes y carga masiva de asistentes).
- **Iconografía y Gráficos**: `react-icons` y `recharts`.

### Backend (Supabase & Edge Functions)
- **Base de Datos**: PostgreSQL alojado en Supabase.
- **Almacenamiento (Storage)**: Buckets con RLS (Row Level Security) para el alojamiento seguro de comprobantes de pago.
- **Edge Functions (Deno)**: 
  - `create-order`: Función serverless principal que maneja transacciones atómicas. Parsea el `FormData`, sube archivos al bucket, valida capacidades de talleres concurrentemente, inserta la orden en BD, genera el ticket PDF y envía el correo de confirmación mediante la API de **Resend**.
- **RPC (Remote Procedure Calls)**: Funciones en Postgres (ej. `get_workshop_counts`) que exponen de forma segura la cantidad de cupos ocupados para validación en tiempo real en el frontend (sin vulnerar RLS).

## 📂 Estructura del Proyecto

```text
src/
├── components/
│   ├── admin/      # Componentes exclusivos del panel (Tablas, Gráficos, Scanner)
│   ├── layout/     # Estructuras maestras (Header, Sidebar, Topbar, Footers)
│   ├── sections/   # Secciones de la Landing y Formulario de Registro
│   └── ui/         # Componentes base y utilidades visuales (FadeIn, Modals, Buttons)
├── data/           # Configuración estática (Talleres por día, Locaciones, Textos)
├── hooks/          # Custom Hooks (Gestión de Autenticación, Órdenes)
├── lib/            # Clientes inicializados (Supabase client)
├── pages/
│   ├── admin/      # Vistas del Dashboard, Reportes, Detalle de Órdenes y Registro Masivo
│   └── public/     # Vistas de la Landing y NotFound
├── routes/         # Configuración del Router y ProtectedRoutes (Control de Acceso)
├── types/          # Definiciones y tipados TypeScript (Dominio y Base de Datos)
└── utils/          # Utilidades puras (Generadores de PDF, Parsers)
```

## ⚙️ Características Core y Lógica de Negocio

### 1. Sistema de Registro Híbrido
- **Registro Público (`/registro`)**: Formulario paso a paso con carga de comprobantes, captura de información extendida (Iglesia, Cargo, DNI, Edad, Profesión) y selección obligatoria de talleres validando el aforo dinámicamente.
- **Registro Masivo (`/admin/bulk-register`)**: Módulo de administración para carga batch a través de Excel. El sistema genera dinámicamente una plantilla `.xlsx` con listas desplegables validadas (`DataValidation`), parsea el archivo al subirlo, y procesa las órdenes de forma secuencial enviándolas a la Edge Function, reportando éxito/error por cada fila visualmente.

### 2. Gestión Avanzada de Talleres
Los asistentes deben seleccionar 2 talleres (uno para cada día). El sistema soporta:
- Desacoplamiento de nombres y temáticas por día para el mismo ID de taller (ej. Taller 10 cambia de tema el Día 1 y el Día 2).
- Validación de cupos absolutos para bloquear automáticamente inscripciones en el UI mediante funciones RPC.
- Excepciones explícitas de aforo ilimitado para talleres magistrales en el backend.

### 3. Emisión Automatizada de Tickets (PDF)
- Utilizando `pdf-lib`, el sistema incrusta datos del asistente (algoritmo de auto-escalado de fuentes para evitar desbordes visuales en nombres largos, UUID de orden, fecha y talleres específicos elegidos).
- Incrusta un código QR renderizado dinámicamente que contiene un JSON con metadata para acelerar el escaneo en puerta (incluso offline).
- Renderizado "On-the-fly": Los PDFs pueden ser reconstruidos y descargados al instante tanto por el cliente (al completar registro) como por el administrador (desde el detalle de orden), ahorrando espacio de almacenamiento en el bucket.

## 🛡️ Panel de Administración (`/admin`)

Área segura protegida a nivel de enrutador que escucha los cambios de sesión de JWT en Supabase Auth:

1. **Dashboard (`/admin`)**: Indicadores clave de rendimiento (KPIs), métricas de recaudación y ocupación.
2. **Gestión de Órdenes (`/admin/orders`)**: Listado completo. Permite revisar el registro detallado y el estado de la validación del pago.
3. **Detalle de Orden (`/admin/orders/:id`)**:
   - Visualización del comprobante a través de URLs firmadas temporales.
   - Botón nativo de integración con WhatsApp Web/App pre-rellenando un mensaje de saludo usando el nombre y teléfono del asistente.
4. **Registro Masivo (`/admin/bulk-register`)**: Flujo completo de carga en lote mediante plantillas generadas.
5. **Reportes Avanzados (`/admin/reports`)**:
   - Gráfica interactiva de barras mostrando la saturación actual vs la máxima capacidad de los talleres.
   - Filtros cruzados combinando Selectores de Taller y Checkboxes de Día (Día 1 / Día 2).
   - Generación instantánea de reportes precisos filtrados a formato Excel.
6. **Escáner de Asistencia (`/admin/attendance`)**: Interfaz enfocada en usabilidad móvil para control de acceso, lectura instantánea y prevención de tickets duplicados/usados.

## 🛠️ Desarrollo y Despliegue

Scripts disponibles pre-configurados:

- `pnpm dev`: Inicia el entorno de desarrollo local con Vite (HMR).
- `pnpm build`: Compila y empaqueta la aplicación en la carpeta `dist/` para producción.
- `pnpm preview`: Corre un servidor web ligero para visualizar la build localmente.

### Despliegue de Edge Functions
La lógica transaccional y el envío de correos requieren desplegar la función serverless en Supabase:
```bash
supabase functions deploy create-order
```
*Asegúrese de cargar las variables de entorno asociadas (por ejemplo, el secreto `RESEND_API_KEY`) en el vault o los secrets del proyecto en Supabase para habilitar el envío de PDFs por correo.*
