# Cuentas de prueba: Gratuito y Premium

Estas dos cuentas se crearon en la base PostgreSQL local `clink_db`. Ambas tienen rol **CLIENTE**, están activas y se verificaron el inicio de sesión y el plan de su perfil mediante la API real.

| Plan | Nombre | Correo |
|---|---|---|
| Plan Gratuito | Demo CLINK | `demo.clink@example.com` |
| Plan Premium | Demo Premium CLINK | `demo.premium.clink@example.com` |

Las contraseñas se entregaron en el chat de preparación y no se incluyen en este repositorio. Para una base de datos distinta, cada integrante debe crear sus cuentas con contraseñas propias.

## Iniciar la aplicación

1. Iniciar PostgreSQL y el backend CLINK-API, conectado a la base donde están las cuentas. La API debe escuchar en `http://localhost:8080`.
2. En la carpeta del frontend, instalar las dependencias con `npm ci` y ejecutar `npm start`.
3. Abrir [el login](http://localhost:4200/login), ingresar el correo de una cuenta y su contraseña y pulsar **Iniciar sesión**.
4. El sistema abrirá `/dashboard`. En el panel lateral aparecerán el nombre del plan y el consumo de recursos.
5. Para cambiar de cuenta, pulsar **Cerrar sesión** al pie del panel lateral y volver a ingresar con la otra cuenta. En móvil, abrir primero el menú lateral.

## Qué comprobar

| Comprobación | Gratuito | Premium |
|---|---|---|
| Rol | CLIENTE | CLIENTE |
| Plan mostrado | Plan Gratuito | Plan Premium |
| Límite actual en la base local | 10 recursos | 999999 recursos |
| Vista general, enlaces y estadísticas | Disponible | Disponible |
| Consultar y descargar QR existentes | Disponible | Disponible |
| Crear enlaces | Hasta alcanzar el límite del plan | Hasta alcanzar el límite del plan |

El dashboard calcula el consumo combinado de enlaces no eliminados y QR activos. El plan Premium está representado por un límite alto en la base actual, aunque el informe lo describa como ilimitado.

Las cuentas se crearon sin cargar enlaces ni QR de demostración. Sus métricas reflejan los recursos y visitas registrados en la base. Las capturas de desarrollo utilizan datos simulados de pruebas y no son datos iniciales de estas cuentas.

No hay dashboard de administrador ni pantalla para cambiar de plan en esta entrega. La generación de nuevos QR, etiquetas, campañas y exportación no forma parte de las pantallas implementadas. La pantalla respeta las fechas de expiración que devuelve el backend para ambos planes.

## Preparar cuentas en otra base de datos

Subir el frontend a GitHub **no transfiere los usuarios ni los planes de PostgreSQL**. Cada integrante necesita una API conectada a la misma base o crear cuentas en su propia base local.

1. Verificar que existan los planes `Plan Gratuito` y `Plan Premium`. El registro requiere `Plan Gratuito`.
2. Abrir `/registro` y registrar ambas cuentas con los nombres y correos de la tabla y contraseñas propias. El backend asigna inicialmente el plan gratuito y cifra la contraseña mediante BCrypt. Si el correo ya existe, usar esa cuenta en lugar de repetir el registro.
3. Para la segunda cuenta, un administrador debe asignar `Plan Premium` mediante el endpoint del backend `PUT /api/v1/admin/usuarios/{id}/plan`, autenticado con un usuario ADMIN. El cuerpo de la petición es `{ "planId": 2 }` en la base local preparada, donde Premium tiene id 2. Consultar el identificador del plan en cada entorno antes de enviarlo; no asumir que siempre es 2.
4. Como alternativa para preparar una demo local, el responsable de la base puede cambiar únicamente el `plan_id` del usuario `demo.premium.clink@example.com` por el id de `Plan Premium` desde pgAdmin. No cambiar su rol: ambas cuentas deben seguir siendo CLIENTE.
5. Cerrar sesión e ingresar de nuevo con la cuenta Premium. Comprobar el nombre del plan y su límite en el panel lateral.

No se incluyen volcados de la base, hashes de contraseñas ni tokens. Estas cuentas no se crean automáticamente al clonar el repositorio.

## Problemas frecuentes

- **Credenciales inválidas:** comprobar que la API esté conectada a la base donde se crearon las cuentas.
- **No carga el dashboard:** verificar el backend en el puerto 8080 y la URL en `src/environments/environment.ts`.
- **Solicita iniciar sesión de nuevo:** las sesiones anteriores al dashboard pueden carecer de `clink_usuarioId`; cerrar sesión e ingresar otra vez.
- **No aparecen datos:** es normal en una cuenta nueva; usar **Crear enlace** para comenzar.
- **No suma clics al probar en localhost:** el backend genera actualmente URLs con `https://clink.pe`; consultar las diferencias pendientes en [la documentación del dashboard](dashboard.md).
