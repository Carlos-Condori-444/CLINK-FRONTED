# CLINK — Frontend

Aplicación frontend de **CLINK**: gestión de enlaces acortados con enfoque en marketing digital (clics, etiquetas, campañas, QR, reportes).

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Angular 21 (standalone components, lazy loading, SSR) |
| TypeScript | estricto (`strict`, `strictTemplates`, sin `any`) |
| Forms | Reactive Forms (nunca template-driven) |
| UI | Bootstrap 5.3 (CSS + bundle JS vía `angular.json`) |
| Feedback | SweetAlert2 |
| Tests | Vitest (`ng test`) |
| Backend | Spring Boot + JWT + PostgreSQL (separado) |

## Requisitos

- Node.js + npm
- Backend CLINK corriendo en `http://localhost:8080` (Swagger en `/swagger-ui/index.html`)
- PostgreSQL `clink_db` (gestionada por el backend)

## Comandos

```bash
npm start        # dev server en http://localhost:4200 (watch)
npm run build    # build producción en dist/
npm test         # unit tests (Vitest)
```

## Arquitectura

Feature-based + core/shared:

```
src/app/
├── core/                      # singletones, sin UI
│   ├── guards/                # auth.guard (protege /dashboard), public.guard (evita /login|/registro con sesión)
│   ├── interceptors/          # jwt (adjunta Bearer), error (401/403 → logout + /login)
│   ├── models/                # usuario.model.ts, api-error.model.ts (extraerMensajeError)
│   └── services/              # auth.service.ts, storage.service.ts (prefijo clink_)
├── shared/                    # reutilizables entre features
│   ├── components/            # password-input (CVA, toggle 👁️/🙈), form-error (control + reglas)
│   └── utils/                 # form.utils.ts (passwordsIguales)
├── features/
│   ├── auth/                  # login/, registro/ (standalone, lazy)
│   └── dashboard/             # contenedor, rutas hijas, métricas, enlaces y QR
├── app.routes.ts              # rutas lazy + guards
└── app.config.ts              # provideHttpClient(withInterceptors([jwt, error]))
```

`src/environments/environment.ts` → `apiUrl` (cero URLs hardcodeadas).

## Módulo de autenticación

- **Registro** (`/registro`): nombre (3-100), email (≤150), password (6-50), confirmar con validador `passwordsIguales`. Éxito → SweetAlert verde → `/login?email=...` prellenado.
- **Login** (`/login`): lee queryParam `email` en `ngOnInit`. Éxito → guarda token (`clink_token`) e identificador (`clink_usuarioId`) → SweetAlert de bienvenida → `/dashboard`.
- **Errores**: siempre vía `extraerMensajeError(err, fallback)` — jamás `err.error.mensaje` directo.
- **Guards**: `publicGuard` (redirige a `/dashboard` si hay sesión), `authGuard` (redirige a `/login` si no hay sesión).
- **Sesión**: botón "Cerrar sesión" al pie del panel lateral → borra token e identificador → `/login`.

### Endpoints backend (públicos)

| Método | Ruta | Request | Response |
|---|---|---|---|
| POST | `/api/v1/auth/registro` | `{nombre, email, password}` | `Usuario` (sin JWT, 201) |
| POST | `/api/v1/auth/login` | `{email, password}` | `{token, tipo, usuarioId, nombre, email, rol}` |

Nota: el backend responde `400` con mensaje en credenciales inválidas y `403` (no 401) en rutas protegidas sin token — por eso el interceptor de errores actúa en **401 y 403**.

### Cuentas de prueba

Hay dos cuentas locales con rol **CLIENTE**, una con plan Gratuito y otra con Premium. Los correos, pasos para ingresar, diferencias y preparación en otra base están en [la guía de cuentas de prueba](docs/cuentas-de-prueba.md).

## Verificación

- **24 pruebas unitarias aprobadas**: autenticación, guards, validaciones, API del dashboard, métricas, límite mixto de recursos, búsqueda, filtros y paginación.
- Compilación de producción y prerender correctos con `npm run build`. Persiste una advertencia por superar el presupuesto inicial de 500 kB.
- Pruebas de interfaz en Chrome con API simulada: escritorio, móvil de 390 px, creación, búsqueda, cancelar/confirmar eliminación, navegación, cuenta sin QR y recuperación de errores.
- Se verificaron el registro, el inicio de sesión y el perfil/plan de las cuentas locales con la API real. La prueba completa del dashboard contra Spring Boot y PostgreSQL sigue pendiente.

## Escalado previsto

Módulos futuros sin refactor: **etiquetas, campañas, generación de QR, reportes y administración** — todos sobre `AuthService`, guards, interceptores y componentes shared existentes.

## Dashboard

El dashboard incorpora resumen de métricas, gestión de enlaces, estadísticas y consulta/descarga de QR. Consulta [la documentación del dashboard](docs/dashboard.md) para ver rutas, componentes, validación y diferencias pendientes del backend.
