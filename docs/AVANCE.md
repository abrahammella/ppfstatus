# JS Detailing Center — Avance Fase 1 (POC sin BD)

Documento de lo construido hasta el **2026-04-28**. La Fase 1 está completa: plataforma funcional end-to-end con datos mock persistidos en JSON, identidad de marca aplicada, animaciones, CRUD completo y vista pública para el cliente.

---

## Resumen ejecutivo

Plataforma web para gestionar el flujo de aplicación de PPF y Ceramic Coating de JS Detailing Center. Cubre todo el proceso del flujograma del cliente — desde recepción hasta entrega — con interfaces diferenciadas por rol y un link público encriptado para el cliente final.

**Estado:** Fase 1 entregada y verificada. Lista para feedback visual o para iniciar Fase 2 (Supabase).

**URL local:** `http://localhost:3000`

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router + Turbopack) | 16.2.4 |
| Lenguaje | TypeScript | 5.x |
| UI base | Tailwind CSS | v4 (CSS-first) |
| Componentes primarios | HeroUI v3 | 3.0.3 |
| Componentes complementarios | Mantine v9 | 9.1.1 (core, hooks, notifications, dates) |
| Animaciones | framer-motion | 12.x |
| Drag & drop kanban | @dnd-kit | core + sortable + utilities |
| Validación | Zod | 4.x |
| Auth | bcryptjs + jose (JWT) | — |
| Idioma UI | Español (es-DO) | — |

**Convenciones:**
- File-based routing con grupos `(admin)`, `(employee)`, `(public)`
- Server Actions de Next.js para mutaciones (no API REST artesanal)
- Repository Pattern para abstraer la capa de datos
- En Next 16, `middleware` se renombró a **`proxy.ts`** — usado para protección por rol
- React 19 `useActionState` para forms con feedback de errores

---

## Identidad de marca aplicada

Paleta extraída del logo y material publicitario "PPF FULL CAR" del cliente:

- **Negro real** (`oklch(0.06 0 0)`) — fondos oscuros, sidebar, panels premium
- **Rojo brand** (escala `--color-brand-red-50/100/500/600/700/900`) — CTAs, acentos, gradientes
- **Amarillo brand** (`--color-brand-red-yellow-300/400`) — badges secundarios (estrellas, "PRO 100", "Oferta")
- **Blanco/zinc** — texto y cards principales
- **Tipografía:** Inter, énfasis en `font-black uppercase tracking-tight` para titulares (lenguaje agresivo y automotriz)

**Patrones visuales reusables:**
- `.showroom-bg` — gradiente radial negro con resplandor rojo (login, vista pública)
- `.brand-glow` — blob gradiente rojo, blur-3xl, usado en cards oscuras
- Diagonales sutiles tipo carbon-fiber en panels oscuros
- Cards redondeadas con `rounded-3xl`, sombras grandes con tinte oscuro

---

## Estructura del proyecto

```
ppfstatus/
├── app/
│   ├── (public)/
│   │   ├── login/                   # Login split-panel + showcase oscuro
│   │   └── status/[token]/          # Vista cliente (animada)
│   ├── (admin)/
│   │   ├── dashboard/               # KPIs (con animaciones + hover)
│   │   ├── tablero/                 # Kanban drag&drop
│   │   ├── tickets/
│   │   │   ├── [id]/                # Detalle admin
│   │   │   └── nuevo/               # Wizard 4 pasos
│   │   ├── clientes/                # CRUD + sub-CRUD vehículos
│   │   ├── servicios/               # CRUD historial
│   │   └── empleados/               # CRUD usuarios
│   ├── (employee)/
│   │   ├── tecnico/, especialista/, qc/
│   │   └── ticket/[id]/             # Detalle con checklist + dropzone
│   ├── layout.tsx                   # HeroUI + Mantine providers
│   ├── providers.tsx
│   ├── globals.css                  # Brand vars + bg gradients
│   └── page.tsx                     # → redirect a /login
├── components/
│   ├── layout/sidebar.tsx           # Sidebar oscuro con logo + nav role-based
│   ├── layout/app-shell.tsx
│   ├── kanban/                      # Board + Column + Card (dnd-kit)
│   ├── ticket/                      # checklist, stage-badge, progress-pill
│   ├── dashboard/                   # KPI tiles, charts, hover tooltips
│   ├── public/animated-status.tsx   # Coreografía de animaciones
│   └── ui/                          # modal, form-fields, photo-dropzone
├── lib/
│   ├── auth/                        # password (bcrypt), jwt (jose), session, rate-limit
│   ├── crypto/public-token.ts       # HMAC-SHA256 firmado para link cliente
│   ├── flow/ppf-stages.ts           # Fuente de verdad del flujograma
│   ├── schemas/                     # Zod (User, Client, Vehicle, Ticket, Service)
│   ├── repositories/
│   │   ├── interfaces.ts            # Contratos
│   │   ├── json/                    # Impl JSON con lock + bootstrap desde seed
│   │   └── index.ts                 # Factory (driver=json|supabase)
│   ├── analytics.ts                 # Calculadores KPI
│   └── queries.ts                   # Tickets enriquecidos
├── data/                            # Mock storage (gitignored salvo seed.json)
├── public/
│   ├── brand/logojs.jpg             # Logo del cliente
│   └── uploads/                     # Fotos por ticket (gitignored)
├── proxy.ts                         # Protección por rol (Next 16)
├── .env.example
└── docs/                            # Este documento
```

**Total:** ~60 archivos TS/TSX. Lint y typecheck en verde.

---

## Funcionalidad implementada

### 1. Autenticación y autorización

- **Cookies httpOnly + JWT firmado con HS256** (jose), TTL 8h
- **bcrypt** (12 rounds) para passwords
- **Rate limiting** in-memory en `/login` (5 intentos por minuto/IP)
- **Proxy de Next 16** valida sesión y redirige según rol; cross-rol va al home propio
- **4 cuentas seed:**
  - `admin@jsdetailing.do` / `admin123`
  - `tecnico@jsdetailing.do` / `tecnico123`
  - `especialista@jsdetailing.do` / `especialista123`
  - `qc@jsdetailing.do` / `qc123`

### 2. Capa de datos (Repository Pattern)

- Interfaces TypeScript en `lib/repositories/interfaces.ts` (`IClientRepo`, `ITicketRepo`, `IVehicleRepo`, `IUserRepo`, `IServiceRepo`)
- Implementación JSON con write-through a `/data/*.json` y mutex en proceso
- Bootstrap automático desde `seed.json` cuando una colección no existe
- Factory en `lib/repositories/index.ts` lee `REPO_DRIVER=json|supabase` desde env
- **Migración a Supabase = solo crear `lib/repositories/supabase/*` y cambiar driver**, sin tocar UI

### 3. Login (split-panel inspiración BYTESPACE)

- Panel izquierdo oscuro con: logo del cliente, mock cards animadas (Tickets activos, Tahoe en aplicación, Clientes 4.9★), patrón carbon-fiber, footer "3M Pro 100"
- Panel derecho con: brand mark "JS DETAILING CENTER" + label rojo, headline "PROTEGE CADA **DETALLE**", form con focus ring rojo, botón sólido brand
- Bloque "Cuentas de demostración" para probar
- Background: `showroom-bg` (negro con resplandor rojo)
- Form usa `useActionState` con manejo de errores por campo

### 4. Dashboard de KPIs (`/dashboard`)

Vista principal del admin. Métricas calculadas dinámicamente desde tickets + servicios.

**4 tiles hero (animados con counter):**
- **Tickets activos** (card oscura brand) — total + desglose por etapa
- **Entregas (semana)** — con delta vs semana anterior
- **Tiempo medio entrega** — lead time real desde `createdAt` a `completedAt`
- **Cumplimiento ETA** — % de entregas a tiempo

**Visualizaciones:**
- **Tickets activos por etapa** — bar chart con columna "pico" en rojo, **hover tooltip** con stage label completo + "ver tablero →" (clickeable)
- **Mix de servicios** — barra apilada PPF / Ceramic / Both con colores brand
- **Tendencia 14 días** — bars dobles creados/entregados con **hover tooltip** mostrando fecha completa + counts

**Listas operacionales:**
- **Tickets atrasados** — card con `+Nh tarde`, o estado "Sin atrasos" en verde
- **Próximas entregas** — ordenadas por ETA, con `en Nh`
- **Productividad 30 días** — ranking con barras animadas por empleado

**Card oscura lateral (Mes en curso):**
- Counter animado de entregas + delta vs mes anterior
- Vehículos de oferta % del flujo activo

**Animaciones:**
- Cards entran con stagger fade-up
- Counters animan de 0 al valor real (1.1s ease-out)
- Barras crecen desde 0 con stagger
- Hover sobre KPI tiles: lift -2px + sombra
- Hover sobre barras: ring rojo + tooltip oscuro

### 5. Tablero kanban (`/tablero`)

- 5 columnas: Recepción / Lavado / Aplicación / QC / Entrega
- Drag & drop con `@dnd-kit/core` (PointerSensor + TouchSensor para tablet)
- Solo admin puede mover; al soltar, los pasos previos se auto-completan y los posteriores se resetean
- Header con label rojo "OPERACIÓN" + título uppercase + botón "+ Nuevo ticket"
- Cards con: marca/modelo, cliente, color, badge de tipo (PPF/CC/Both), barra de progreso, avatares de asignados, ETA, link "Ver detalle"

### 6. Tickets

**Wizard de creación (`/tickets/nuevo`):**
- 4 secciones numeradas con bullets rojos brand: 1·Cliente / 2·Vehículo / 3·Servicio / 4·Asignaciones
- Toggle Existente/Nuevo con AnimatePresence (transición suave entre modos)
- Cliente: select del existente o form para uno nuevo
- Vehículo: filtra por cliente, o form nuevo (marca/modelo/año/placa/color/VIN)
- Servicio: tipo (PPF/CC/Both), ETA datetime, checkbox "Vehículo de oferta"
- Asignaciones: técnico/especialista/QC desde users activos
- Submit: crea cliente y/o vehículo si son nuevos, genera `publicToken` HMAC, marca paso 1 (orden de servicio) como completado, redirige al detalle

**Detalle admin (`/tickets/[id]`):**
- Header con label rojo "TICKET tk_xxx", título uppercase con marca/modelo/año, placa mono
- StageBadge + ProgressPill arriba derecha
- Card de subprocesos (col-span-2) con `<TicketChecklist>`
- Sidebar derecha con secciones: Cliente (link al detalle), Servicio (badges negro/amarillo), Asignaciones, Tiempos, Link público con código mono

**Detalle empleado (`/ticket/[id]`):**
- Mismo header style
- Card con checklist; solo permite completar pasos asignados al rol del empleado actual
- Validación en server action: empleado solo puede tocar tickets donde está asignado

**Checklist con dropzone (`<TicketChecklist>` + `<PhotoDropzone>`):**
- Cada paso es una fila con número o checkmark verde
- Al hacer clic en "Completar" se expande con AnimatePresence (height: auto)
- **PhotoDropzone** drag & drop:
  - Borde dashed gris, se ilumina rojo al arrastrar encima
  - Click o drop ambos funcionan
  - Preview con nombre + tamaño + botón "Quitar"
  - Validación: solo imágenes, máx 5MB
  - Sincroniza con `<input type="file">` oculto vía `DataTransfer` para que el form lo capture
- Textarea opcional para notas
- Al guardar: foto va a `/public/uploads/{ticketId}/{stepKey}-{timestamp}.{ext}`, se actualiza el step, y si fue el último paso se crea un registro `Service` y se actualiza `lastVisitAt` del cliente

### 7. Empleados (CRUD `/empleados`)

- Tabla con avatar, nombre, rol, email mono, badge de estado (Activo/Inactivo)
- Botón **"+ Nuevo empleado"** abre modal con: nombre, email, rol, password (mín 8), checkbox activo
- Acciones por fila: **Editar** (modal con misma form, password opcional), **Activar/Desactivar**, **Eliminar**
- **Bloqueos de seguridad:**
  - No puedes eliminarte ni desactivarte a ti mismo (badge "tú" junto al nombre)
  - No puedes eliminar empleados con tickets activos asignados
- Email único validado server-side

### 8. Clientes (CRUD `/clientes` + `/clientes/[id]`)

**Lista:**
- Botón "+ Nuevo cliente" → modal con nombre/teléfono/email/notas
- Tabla con stats por cliente (vehículos, servicios, última visita)
- Acciones: Editar / Eliminar

**Detalle:**
- Header con info de contacto + acciones (Editar/Eliminar)
- Sección **Vehículos** con sub-CRUD: agregar, editar, eliminar vehículos del cliente
- Sección **Historial de servicios** (timeline)

**Bloqueos:**
- No se puede eliminar cliente con vehículos / tickets / servicios asociados
- No se puede eliminar vehículo con tickets

### 9. Servicios (CRUD `/servicios`)

Nuevo módulo en sidebar admin. Permite registrar servicios manualmente (útil para historial pre-plataforma) y editar/eliminar registros.

- Botón "+ Nuevo servicio" → modal con: cliente (select), vehículo filtrado por cliente, tipo, fecha datetime, notas
- Tabla con vehículo / cliente / tipo (badge) / fecha / notas
- Acciones: Editar Notas (modal) / Eliminar
- Al crear, bumpea `client.lastVisitAt` si la fecha del servicio es más reciente

### 10. Vista pública del cliente (`/status/[token]`)

Acceso sin login mediante token HMAC firmado. **Coreografía completa de animaciones** para máximo impacto al abrir el link.

**Datos visibles (privacy-safe):**
- Nombre del cliente
- Vehículo: marca/modelo/año/color
- Placa enmascarada (`A••••56`)
- Etapa actual + porcentaje
- Última foto de evidencia (si existe)
- ETA o fecha de entrega

**Datos NUNCA expuestos:**
- Email, teléfono, placa completa, VIN

**Animaciones de entrada (escalonadas):**
- 0s: Logo (encima del card) — fade + scale
- 0.1s: Card completo — slide-up + scale
- 0.4s: **Counter del % anima 0→pct** (1.4s easing custom)
- 0.5s: **Barra de progreso** crece 0→pct con ease-out
- 0.7s + 90ms each: 5 círculos del stepper — **pop spring** (scale + rotate)
- Reached steps: ✓ aparece con rotate -180→0 (backOut)
- 1.1s: Foto fade + scale-in
- 1.2s: Card oscura ETA slide-up
- 1.4s: Fecha de entrega
- 1.5s: Footer

**Animaciones continuas (loop):**
- Glow del banner respira (opacidad 0.5→0.85→0.5, scale 0.9→1.08→0.9, ciclo 5s)
- **Sweep de brillo en la barra de progreso** — franja blanca translúcida cruza cada 1.8s con 1.5s de pausa
- **Ring pulsante en la etapa activa** — escala 1→1.5→1 + opacidad 0.6→0→0.6, ciclo 2s
- Glow del card de ETA respira (ciclo 6s)
- **Sparkles ✦ flotantes** cuando estado = "completado" — 5 estrellas suben y desvanecen, escalonadas

### 11. Sidebar y navegación

- Sidebar oscuro con logo del cliente, brand mark "JS DETAILING CENTER", indicador de sesión
- Item activo con barra lateral roja + ícono en cuadrado rojo brand
- 6 entradas admin: Dashboard, Tablero, Nuevo ticket, Clientes, Servicios, Empleados
- 1 entrada por rol empleado
- Footer con avatar + rol + botón "Cerrar sesión"
- Glow rojo sutil arriba a la izquierda
- Solo visible en desktop (oculto en mobile)

### 12. UI primitives reusables

Construidos durante la iteración:

- **`<Modal>`** — backdrop blur, animación spring, ESC para cerrar, lock body scroll
- **`<FormField>` / `<FormSelect>` / `<FormTextarea>`** — inputs brand-aligned con focus ring rojo
- **`<PrimaryButton>` / `<GhostButton>`** — botones brand consistentes
- **`<PhotoDropzone>`** — drag & drop reusable (cualquier paso del checklist)
- **`<KpiTile>` / `<SectionCard>` / `<AnimatedNumber>`** — componentes del dashboard
- **`<StageBadge>` / `<ProgressPill>`** — visualización de estado en tarjetas/listas

---

## Datos seed

- 4 usuarios (uno por rol) con bcrypt hashes
- 5 clientes con teléfonos y emails realistas
- 8 vehículos (algunos clientes con múltiples)
- 11 tickets (3 activos en distintas etapas + 8 históricos completados con timestamps espaciados en últimos 14 días)
- 11 servicios (3 legacy pre-plataforma + 8 generados de tickets completados)

Diseñado para que los KPIs muestren números realistas en demo (lead time ~2.6 días, cumplimiento ETA 75%, mix de servicios variado).

---

## Cómo correrlo

```bash
cd "/Users/abrahammella/Documents/Proyectos Dreamex/ppfstatus"
npm install            # solo la primera vez
npm run dev
```

Abre `http://localhost:3000` → login con cualquier cuenta seed.

**Resetear datos a estado inicial:**
```bash
rm data/clients.json data/vehicles.json data/tickets.json data/services.json data/users.json
# data/seed.json se conserva; el bootstrap recargará desde ahí
```

**Variables de entorno** (`.env.local`, no se commitea):
- `AUTH_SECRET` — JWT secret (mínimo 24 caracteres)
- `PUBLIC_TOKEN_SECRET` — HMAC para links públicos
- `REPO_DRIVER=json` — actual; cambiará a `supabase` en Fase 2

---

## Verificación realizada

| Check | Estado |
|---|---|
| `tsc --noEmit` | ✅ exit 0 (sin errores de tipos) |
| `npm run lint` | ✅ 0 errores, 0 warnings |
| Login admin → /dashboard | ✅ 200 |
| Login tecnico → /tecnico | ✅ 200 |
| Login especialista → /especialista | ✅ 200 |
| Login qc → /qc | ✅ 200 |
| Acceso cross-rol redirige al home propio | ✅ 307 |
| Sin sesión redirige a /login con `?next=` | ✅ 307 |
| Token público válido → 200 | ✅ |
| Token público manipulado → 404 | ✅ |
| PII oculta en vista pública (email/teléfono/placa) | ✅ no expuesta |
| CRUD empleados (crear/editar/desactivar/eliminar) | ✅ con bloqueos |
| CRUD clientes + vehículos | ✅ con bloqueos |
| CRUD servicios | ✅ |
| Persistencia JSON entre reinicios del dev server | ✅ |

---

## Seguridad implementada

- ✅ Cookies `httpOnly` + `Secure` (en prod) + `SameSite=Lax`
- ✅ bcrypt con 12 rounds para passwords
- ✅ Validación Zod en cada server action (server-side)
- ✅ Proxy/middleware valida rol antes de cada request
- ✅ Rate limiting básico en `/login` (in-memory)
- ✅ Token público con HMAC-SHA256 + timing-safe comparison
- ✅ Vista pública NO expone PII sensible (email, teléfono, placa completa, VIN)
- ✅ Server Actions de Next.js con CSRF integrado
- ✅ `.env*` y `data/*.json` (excepto seed.json) en `.gitignore`
- ✅ Validación de límite de archivo en upload (5MB) y tipo (image/*)
