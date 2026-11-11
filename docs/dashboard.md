# Dashboard de CLINK

Implementado en `feacture/dashboard` a partir del informe `ModeloInforme_v2.pdf`, el diagrama de clases y los controladores actuales de CLINK-API. No incorpora datos de demostración al producto.

## Vistas

- `/dashboard`: bienvenida, métricas acumuladas, dispositivos, fuentes y cinco enlaces recientes.
- `/dashboard/enlaces`: creación con formulario reactivo, búsqueda por nombre/URL/alias/canal, filtro por estado, paginación de ocho registros, copia y eliminación confirmada.
- `/dashboard/estadisticas`: métricas acumuladas de los enlaces actuales; los QR independientes y los enlaces eliminados no se incluyen en los clics de enlaces.
- `/dashboard/qr`: consulta de QR existentes y descarga autenticada de PNG. No incluye generación de nuevos QR.

La interfaz incluye carga, cuenta vacía, errores y reintento, y menú adaptable a móvil. No hay cobros, cambio de plan ni módulos de campañas, etiquetas o administración en esta entrega.

## Relación con las clases

| Tema | Aplicación |
|---|---|
| Componentes standalone | Contenedor, página, bienvenida, tarjetas, gráficos, formulario, tabla y QR |
| Padre a hijo | `input()` para métricas, enlaces, permisos y estados de carga |
| Hijo a padre | `output()` para crear, copiar, eliminar, cerrar y descargar |
| Servicio compartido | `DashboardService`, provisto en el contenedor y compartido por sus rutas hijas |
| Rutas | Rutas hijas con carga diferida y protección heredada del dashboard |
| SCSS | Estilos encapsulados, variable de color, anidamiento, estados y media queries |
| Formularios reactivos | `FormBuilder`, validadores y mensajes por campo |
| API REST | `HttpClient`, modelos TypeScript, JWT existente y tratamiento de errores |

`input()` y `output()` son las APIs de Angular utilizadas aquí para comunicar componentes, equivalentes en propósito a los ejemplos de `@Input()` y `@Output()` del curso. Los signals mantienen actualizado el dashboard al terminar las peticiones, incluido Angular sin Zone.js.

## Contrato con el backend

Se usan las rutas del código actual, que difieren de algunas rutas antiguas del informe:

- `GET /api/v1/auth/perfil/{id}`
- `GET /api/v1/enlaces`
- `POST /api/v1/enlaces`
- `DELETE /api/v1/enlaces/{id}`
- `GET /api/v1/clicks/enlace/{id}/fuente`
- `GET /api/v1/qr`
- `GET /api/v1/qr/{id}/descargar`

La URL base se toma de `environment.apiUrl`. El id necesario para consultar el perfil se guarda al iniciar sesión como `clink_usuarioId`; no se utiliza para autorizar las operaciones de enlaces ni QR. Las sesiones antiguas sin ese dato deben iniciar sesión otra vez.

Los clics por dispositivo se calculan con los contadores de enlaces; las fuentes se obtienen del endpoint de estadísticas de cada enlace. Si fallan las fuentes, se informa su indisponibilidad y se conserva el resto del dashboard. Si falla la carga principal, se muestra un error y se bloquea la creación.

El consumo combina enlaces no eliminados y QR activos y se compara con `limiteRecursos` del perfil. La API sigue siendo responsable de autorizar y validar cada operación. Una fecha vencida se muestra como expirada aunque la API todavía devuelva estado ACTIVO; esta evaluación se renueva al cargar los datos.

## Puntos pendientes del backend

- El perfil devuelve un consumo basado solo en enlaces. El dashboard cuenta los QR activos para cumplir el límite mixto del informe.
- La creación de enlaces del backend también verifica solo enlaces; debe reforzarse el límite mixto en servidor para que se cumpla fuera de esta interfaz.
- La API genera enlaces y QR con el dominio fijo `https://clink.pe`. Las pruebas locales de redirección requieren configurar ese dominio/base en el backend.
- La creación actual asigna dos meses de expiración a todos los planes. Esta pantalla respeta la fecha devuelta y no promete expiración ilimitada para Premium.
- Las métricas reflejan lo que devuelve la API. Revisar la coexistencia de trigger SQL y actualización de contadores en `ClickServiceImpl` para evitar duplicación.
- La autenticación previa conserva sus guards basados en presencia del token y su tratamiento global de 401/403; no se rediseñó en este trabajo.

## Validación

- `npm run build`: compilación de producción y prerender.
- `npm test -- --watch=false`: pruebas existentes y pruebas del dashboard (API, límite mixto, métricas, errores, URL, alias, mensajes, estados, búsqueda y paginación).
- Chrome headless con API simulada: carga, creación, validaciones visibles, búsqueda, cancelar/confirmar eliminación, navegación, QR vacío, error/reintento, escritorio y móvil de 390 px. Las capturas utilizan datos ficticios únicamente en el contexto aislado de prueba.
- Se corrigió `FormErrorComponent`: su computed anterior no observaba los cambios internos de un FormControl. Ahora observa sus eventos y actualiza el mensaje al tocar o corregir el campo.

Se verificaron el registro, el inicio de sesión y el perfil/plan de las dos cuentas locales contra la API real. La prueba completa de las operaciones del dashboard contra Spring Boot y PostgreSQL sigue pendiente. Consulta [la guía de cuentas de prueba](cuentas-de-prueba.md) para ingresar o preparar las cuentas en otra base de datos.
