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
| Backend | Spring Boot 3.x + JWT + PostgreSQL (separado) |

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
│   └── dashboard/             # placeholder con navbar + logout
├── app.routes.ts              # rutas lazy + guards
└── app.config.ts              # provideHttpClient(withInterceptors([jwt, error]))
```

`src/environments/environment.ts` → `apiUrl` (cero URLs hardcodeadas).

## Módulo de autenticación

- **Registro** (`/registro`): nombre (3-100), email (≤150), password (6-50), confirmar con validador `passwordsIguales`. Éxito → SweetAlert verde → `/login?email=...` prellenado.
- **Login** (`/login`): lee queryParam `email` en `ngOnInit`. Éxito → guarda token (`clink_token`) → SweetAlert de bienvenida → `/dashboard`.
- **Errores**: siempre vía `extraerMensajeError(err, fallback)` — jamás `err.error.mensaje` directo.
- **Guards**: `publicGuard` (redirige a `/dashboard` si hay sesión), `authGuard` (redirige a `/login` si no hay sesión).
- **Sesión**: botón "Cerrar sesión" en la navbar del dashboard → borra token → `/login`.

### Endpoints backend (públicos)

| Método | Ruta | Request | Response |
|---|---|---|---|
| POST | `/api/v1/auth/registro` | `{nombre, email, password}` | `Usuario` (sin JWT, 201) |
| POST | `/api/v1/auth/login` | `{email, password}` | `{token, tipo, usuarioId, nombre, email, rol}` |

Nota: el backend responde `400` con mensaje en credenciales inválidas y `403` (no 401) en rutas protegidas sin token — por eso el interceptor de errores actúa en **401 y 403**.

### Credenciales de prueba

```
Email:     test.clink.1794383899@example.com
Password:  Secret123
```

## Verificación

- **27/27 casos PASS**: validaciones cliente (R1-R5, L1-L3), integración backend (R6-R9, L4-L7), guards (G1-G3), PostgreSQL (DB1-DB5: plan_id=1, rol=CLIENTE, hash `$2a$`, activo), seguridad (S1-S3).
- Unit tests: `src/app/auth-verification.spec.ts` (11 casos) + `app.spec.ts`.

## Escalado previsto

Módulos futuros sin refactor: **enlaces, etiquetas, reservas, reportes** — todos sobre `AuthService`, guards, interceptores y componentes shared existentes.
