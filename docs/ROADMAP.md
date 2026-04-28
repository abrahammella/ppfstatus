# JS Detailing Center — Roadmap y conversación

Documento que captura el contexto completo de la conversación: qué pidió el cliente, qué decisiones tomamos, qué se construyó (referencia a [`AVANCE.md`](./AVANCE.md)) y qué queda pendiente.

---

## 1. Origen del proyecto

**Cliente:** JS Detailing Center — empresa de aplicación de PPF (Paint Protection Film) y Ceramic Coating en República Dominicana, instalador autorizado 3M Pro 100.

**Material entregado por el cliente al inicio:**
- `Flujograma Js detailing.pdf` — flujograma del proceso de aplicación (5 etapas)
- 2 imágenes de referencia visual (estilo "Growly", dashboard moderno con sidebar oscuro)
- `logojs.jpg` — logo "JS DETAILING CENTER" sobre fondo negro
- `branding.jpg` — flyer publicitario "PPF FULL CAR" mostrando la paleta real (negro + rojo + amarillo, tipografía agresiva)

**Petición original textual del cliente:**
> "Necesito que desarrollemos esta plataforma […] Un Login administrador, uno para empleados por rol — si es técnico, especialista, control de calidad — y deberíamos de compartir un link para el cliente only para ver el nombre del cliente, el carro, status y tiempo aproximado de entrega.
>
> Necesito que antes de empezar la implementación planifiquemos hacer una POC (Sin Base de Datos) solamente para ir viendo todo. La idea posteriormente es que le llegue un mensaje por WhatsApp al cliente para saber el status y también lo del link para verificación de status encrypted el link.
>
> Necesito hacer esto seguro porque hay datos sensibles de usuario.
>
> Hagamos esto por fase, un diseño moderno, responsive porque los técnicos utilizarán una tablet para manejar el procedimiento y asignación de tickets."

---

## 2. Decisiones técnicas tomadas en conversación

### Stack
| Pregunta | Decisión |
|---|---|
| Framework frontend | **Next.js 15+ (App Router) + TypeScript + Tailwind** |
| Sistema de diseño | **HeroUI v3** primario, **Mantine v9** complementario. **NUNCA shadcn/ui** (rechazado explícitamente) |
| Capa de datos POC | **Repository Pattern + JSON files** (para poder migrar a Supabase sin reescribir UI) |
| Validación | **Zod** schemas compartidos cliente/servidor |
| Autenticación POC | Mock JWT con cookie httpOnly + bcrypt + middleware (proxy) por rol |
| Granularidad tickets | **Etapas + checklist por subproceso + foto opcional** al completar cada paso |
| Idioma UI | **Español** (es-DO) |

### Estilo visual (iteraciones)

1. **Iteración 1:** estilo "Growly" inicial → el cliente lo rechazó: *"ese UI está horrible"*
2. **Iteración 2:** estilo BYTESPACE/EDUMENTOR (split-panel) → aprobado pero color azul/violeta
3. **Iteración 3 (final):** paleta brand real del cliente — **negro + rojo + amarillo**, vibra automotive premium tomada del flyer "PPF FULL CAR"

### Estructura del producto

- Cliente quiso que **el dashboard inicial sea KPIs**, no el kanban → kanban se movió a `/tablero` y `/dashboard` quedó como vista de métricas
- Cliente pidió que **clientes, empleados y servicios sean CRUD completo manejable**
- Cliente pidió **hover interactions** en el dashboard (ej. tendencia 14 días con tooltip de fecha)
- Cliente pidió **drag-and-drop** para adjuntar imagen en cada paso
- Cliente pidió que **los KPI widgets sean animados** (no planos)
- Cliente pidió que **el link público del cliente tenga más animación** para impactar al abrirlo

---

## 3. Alcance pactado por fases

| Fase | Estado | Contenido |
|---|---|---|
| **Fase 1 — POC sin BD** | ✅ Completa | Plataforma funcional con datos JSON, 6 áreas CRUD, vista pública animada, brand aplicado |
| **Fase 2 — Supabase + auth real** | ⏳ Pendiente | Migración de driver de datos, RLS, Auth real, Storage |
| **Fase 3 — WhatsApp + producción** | ⏳ Pendiente | Notificaciones, hardening, deploy |

---

## 4. Lo construido (Fase 1)

Ver detalle en **[`AVANCE.md`](./AVANCE.md)**. Resumen:

- ✅ Auth con 4 roles (admin, técnico, especialista, QC)
- ✅ Repository Pattern listo para swap a Supabase
- ✅ Token HMAC firmado para link público encriptado
- ✅ Login split-panel con showcase oscuro animado
- ✅ Dashboard de KPIs con 4 hero cards animados + 3 visualizaciones + 3 listas operacionales + hover tooltips
- ✅ Tablero kanban con drag & drop táctil
- ✅ Wizard creación de ticket (4 secciones)
- ✅ Detalle de ticket admin/empleado con checklist
- ✅ Photo dropzone drag & drop
- ✅ CRUD empleados con bloqueos de seguridad
- ✅ CRUD clientes + sub-CRUD vehículos
- ✅ CRUD servicios (nueva sección sidebar)
- ✅ Vista pública con coreografía de animaciones de alto impacto
- ✅ Repintada completa con paleta brand (negro + rojo + amarillo)
- ✅ Verificación: tsc, lint, smoke tests todos verdes

---

## 5. Lo pendiente

### Fase 2 — Supabase + Auth real (siguiente)

**Tareas estimadas:**

1. **Setup Supabase:**
   - Crear proyecto en Supabase
   - Schema SQL: tablas `users`, `clients`, `vehicles`, `tickets`, `services`
   - RLS policies por rol (admin ve todo, empleados solo sus tickets, lectura pública limitada para link)
   - Indexes en `clientId`, `vehicleId`, `publicToken`, `status`

2. **Implementar `lib/repositories/supabase/*.repo.ts`:**
   - Cumple las mismas interfaces que `json/`
   - Cliente Supabase server-side con cookies
   - Manejo de errores → mismo shape que JSON repos

3. **Cambiar driver:**
   - Variable `REPO_DRIVER=supabase` en `.env`
   - La factory en `lib/repositories/index.ts` ya está lista
   - **No se toca UI** (gracias al pattern)

4. **Auth real:**
   - Reemplazar bcrypt+jose con Supabase Auth
   - Email/password (puede agregar magic link después)
   - Sincronizar la tabla `users` con `auth.users` de Supabase
   - Mantener compatibilidad con el `proxy.ts` actual

5. **Storage para fotos:**
   - Bucket `evidencias` en Supabase Storage
   - Migrar el `savePhoto()` de `app/(employee)/ticket/[id]/actions.ts` para subir a Supabase
   - URLs firmadas o RLS que permita lectura solo por dueños del ticket

6. **Token público con expiración:**
   - Cambiar de HMAC simple a JWT con `exp` (30 días o hasta `etaAt + 7d`)
   - O usar RPC pública en Supabase con token en argumento

### Fase 3 — WhatsApp + producción

1. **Integración WhatsApp:**
   - Decidir entre Twilio WhatsApp API vs WhatsApp Cloud API (Meta)
   - Plantillas aprobadas:
     - Ticket creado (con link de status)
     - Cambio de etapa principal (lavado → aplicación → QC → entrega)
     - Listo para retiro
   - Webhook para delivery status / errores
   - Opt-in del cliente (consentimiento)

2. **Hardening de producción:**
   - Rate limit con Upstash Redis (en lugar de in-memory)
   - WAF (Vercel o Cloudflare)
   - Logs auditables (quién hizo qué, cuándo)
   - Backups de BD
   - Error tracking (Sentry)
   - Monitoring de uptime

3. **Deploy:**
   - Vercel (recomendado) o similar
   - Variables de entorno de producción
   - Dominio custom (probablemente `taller.jsdetailing.do` o similar)
   - Cert SSL (automático en Vercel)

### Mejoras menores ya identificadas

- **Paginación / búsqueda / filtros** en tablas (clientes, servicios, empleados) — se vuelve necesario al pasar de ~50 registros
- **Confetti completo** en estado "completado" del status público (actualmente solo sparkles ✦)
- **Toast notifications** cuando el cliente vuelve y la etapa cambió
- **Sonido sutil** en la vista pública al cambiar de etapa (decisión UX pendiente)
- **Vista mobile/tablet del sidebar** — actualmente `hidden md:flex`, falta menú hamburguesa para móvil
- **Modo oscuro** opcional (el sistema ya tiene CSS vars para `.dark`)
- **Reportes** — exportar CSV de servicios/tickets por rango de fechas
- **Dashboard del empleado** — KPIs personales (tickets propios, tiempo promedio, productividad)
- **Edición de la fecha de servicio** en CRUD servicios (actualmente solo edita notas)
- **Re-asignación de tickets** desde detalle admin (cambiar técnico/especialista/QC asignado)
- **Comentarios/observaciones por ticket** (chat interno entre roles)

### Preguntas/decisiones abiertas

- **Datos sensibles del cliente:** ¿qué obligaciones legales aplican (LOPDP RD)? Por ahora no exponemos PII en link público; en BD real evaluar encriptación at-rest de teléfonos/emails
- **Multi-tenant:** ¿el cliente eventualmente quiere ofrecer la plataforma a otros talleres? Si sí, hay que rediseñar el schema con `tenantId`
- **Pricing tiers (BÁSICO / DELUXE / PREMIER del flyer):** ¿se quieren manejar como entidad en la plataforma para cotizaciones? Hoy no están modelados
- **Integraciones contables:** ¿facturación dominicana (DGII) si el ticket también es factura?
- **Roles adicionales:** ¿se necesita un rol "recepcionista" separado del admin? Hoy admin hace todo
- **Notificaciones internas:** ¿push/email a empleados cuando se les asigna un ticket?

---

## 6. Memorias persistidas (para continuidad entre sesiones)

Guardadas en `~/.claude/projects/.../memory/`:

- `project_ppfstatus.md` — descripción del proyecto y plan aprobado
- `feedback_stack.md` — Next.js 15+ HeroUI v3 + Mantine v9 + Tailwind v4. **NUNCA shadcn/ui**
- `feedback_idioma.md` — UI en español
- `project_data_pattern.md` — repository pattern, JSON ahora, Supabase después

Plan original aprobado: `~/.claude/plans/en-que-quedamos-logical-taco.md`

---

## 7. Cronología de la conversación

| Hito | Resultado |
|---|---|
| 1. Cliente describe el problema y comparte flujograma + imágenes Growly | Captura de requisitos |
| 2. Plan de Fase 1 redactado y aprobado | Plan en disco |
| 3. Setup Next.js 16 + dependencias + tsc/lint verdes | Base lista |
| 4. Construcción end-to-end de toda la Fase 1 (auth, kanban, CRUDs base, status público) | POC funcional |
| 5. Cliente: "ese UI está horrible" → split-panel BYTESPACE | Login rediseñado |
| 6. Cliente: "no usen azul/violeta, esta es la marca real" (compartió logojs.jpg + branding.jpg) | Repintada brand: negro + rojo + amarillo |
| 7. Cliente: "el dashboard sea KPIs, separa el kanban" | `/dashboard` (KPIs) + `/tablero` (kanban) |
| 8. Construcción de KPIs animados (counters + bars + sparkline + listas) | Dashboard moderno |
| 9. Cliente: "el fondo es azul, los widgets son planos" | Bg neutral con tinte rojo + animaciones framer-motion |
| 10. Cliente: "necesito CRUD para servicios/clientes/empleados, hover interactions, drag-drop para fotos" | Hecho todo: 3 CRUDs + tooltips + PhotoDropzone |
| 11. Cliente: "el link del cliente con más animación" | Coreografía completa de animaciones en `/status/[token]` |
| 12. Documentación final | Este documento + `AVANCE.md` |

---

## 8. Recomendación de próximos pasos

**Si el siguiente foco es "demostrar al dueño del taller":**
- Pasar lo construido en navegador y tablet
- Probar el flujo end-to-end: admin crea ticket → técnico completa lavado con foto → especialista aplica PPF → QC revisa → admin entrega → cliente abre link y ve "Trabajo completado"
- Con esa demo en mano, decidir si arrancar Fase 2 directo o ajustar primero algún detalle visual/UX

**Si el siguiente foco es Fase 2 (Supabase):**
- Crear el proyecto Supabase
- Diseñar el schema SQL + RLS desde la mano de las interfaces actuales (es prácticamente 1:1)
- Construir `lib/repositories/supabase/`
- Cambiar `REPO_DRIVER=supabase` y validar todos los flujos
- Migrar Auth (último paso, después de validar la BD)

**Si el siguiente foco es WhatsApp:**
- Recomendable hacer Supabase primero (necesitas BD real para webhooks de delivery)
- Decidir Twilio vs Meta basado en presupuesto y volumen
