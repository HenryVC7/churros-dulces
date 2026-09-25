# Churros Dulces - Decisiones del proyecto

## Decisión 001 - Tecnologías iniciales

### Decisión

Utilizar HTML, CSS y JavaScript para la primera versión.

### Motivo

Queremos construir una base sencilla y comprender cómo funciona una página web antes de incorporar frameworks o herramientas más avanzadas.

### Fecha

2026-09-14

---

## Decisión 002 - Desarrollo progresivo

### Decisión

Construir el proyecto por etapas.

### Motivo

Primero desarrollaremos una versión funcional sencilla y después incorporaremos GitHub, backend, APIs, automatizaciones e inteligencia artificial.

### Fecha

2026-09-14

---

## Decisión 003 - Mantener el proyecto gratuito inicialmente

### Decisión

Utilizar herramientas gratuitas durante la etapa inicial del proyecto.

### Motivo

Queremos aprender y comprobar hasta dónde podemos llegar sin contratar planes de pago.

### Fecha

2026-09-14

---

## Decisión 004 - Catálogo de Supabase mediante fetch

### Decisión

Consultar los productos activos de `public.productos` mediante REST Data API y `fetch()` con JavaScript puro, sin instalar dependencias. Solicitar `id`, `nombre`, `precio` y `activo`, ordenados por `id` ascendente.

Usar exclusivamente la Publishable key pública en el frontend, autorizada para esta integración; nunca incluir Secret keys ni `service_role`. RLS permanece activado y la tabla tiene una política pública SELECT con `USING (true)`. El filtro de productos activos controla el catálogo mostrado, pero no restringe la lectura de otros registros permitidos por esa política.

Identificar los productos del carrito por `id` y mantener temporalmente las descripciones y elementos visuales locales asociados a ese ID. Esta decisión cubre la consulta del catálogo; el guardado de pedidos se documenta en la Decisión 005.

### Motivo

Aprender a consultar una API con las herramientas del navegador, conservar el diseño y funcionamiento del carrito y evitar depender del nombre para identificar cada producto.

### Fecha

2026-09-20

---

## Decisión 005 - Guardado controlado de pedidos en Supabase

### Decisión

- Guardar los datos del cliente y la cabecera en `public.pedidos`, y los productos en `public.detalle_pedido`, relacionados por `pedido_id`. Cada detalle conserva el nombre y precio del producto al comprar.
- Crear pedidos únicamente mediante `public.crear_pedido`, llamada con `fetch()` desde el formulario. El frontend envía datos del cliente, `clave_solicitud` y productos con `producto_id` y `cantidad`; no envía nombres de productos, precios, subtotales, total ni estado.
- Validar productos activos y cantidades en la RPC; obtener nombres y precios desde `public.productos`, calcular importes en PostgreSQL y guardar cabecera y detalles en una sola transacción. El estado inicial es `pendiente`.
- Usar `clave_solicitud` UUID con restricción única para evitar duplicados. La RPC devuelve el mismo acuse `solicitud_recibida` ante una clave repetida, sin leer ni devolver datos privados del pedido existente y sin modificarlo. Una clave repetida con otros datos no crea una nueva versión del pedido.
- Generar la clave con `crypto.randomUUID()` y conservar la solicitud en memoria para reintentos idénticos. Bloquear envíos simultáneos y cambios mientras el resultado sea incierto. Recargar o cerrar la página pierde ese estado; no se garantiza deduplicación entre sesiones.
- Mantener RLS activado y permisos directos revocados para `PUBLIC`, `anon` y `authenticated` sobre las tablas de pedidos. Conceder a `anon` únicamente la ejecución de la RPC. La función usa `SECURITY DEFINER`, propietario `postgres`, `search_path` vacío y referencias de tablas con esquema; el visitante no obtiene los privilegios del propietario.
- Utilizar exclusivamente la Publishable key en el frontend, nunca Secret key ni `service_role`. La protección depende de los permisos y la validación en Supabase, no de ocultar la clave pública.
- Guardar antes de continuar con WhatsApp. Con el número comercial vacío, confirmar el guardado sin abrir WhatsApp. Guardar el pedido no confirma su envío por WhatsApp.

### Motivo

Evitar precios manipulados desde el navegador, pedidos incompletos, duplicados por reintentos y exposición pública de los datos de los clientes.

### Validación y límites

El usuario confirmó un pedido real desde el formulario con total S/ 23.00, dos detalles correctos y estado `pendiente`. También confirmó idempotencia, ejecución como `anon` con Publishable key (HTTP 200) y SELECT directo bloqueado en ambas tablas privadas (HTTP 401, código 42501).

Ronda de seguridad confirmada por el usuario el 2026-09-22: un pedido con producto 1 válido y producto 999999 inexistente devolvió PT400: "Uno de los productos no está disponible" y se revirtió por completo. Antes y después hubo 3 pedidos y 5 detalles, sin registros asociados a la clave de prueba.

Con Publishable key y rol `anon` desde el navegador, INSERT directo en ambas tablas y UPDATE/DELETE directo en `pedidos` devolvieron HTTP 401 / PostgreSQL 42501. Los conteos permanecieron iguales y no quedaron registros de prueba. Esta ronda no verifica UPDATE/DELETE en `detalle_pedido`.

Prueba de reintento e idempotencia superada, confirmada por el usuario el 2026-09-22 desde la interfaz real:

- Pedido ficticio con `producto_id` 3, cantidad 2, total esperado S/ 16.00 y comentario `PRUEBA-REINTENTO-20260922-01 - No preparar ni entregar`.
- Estado inicial: 3 pedidos, 5 detalles y 0 pedidos con esa marca.
- Se interceptó solo la primera llamada a `crear_pedido`: la petición real llegó a Supabase y respondió HTTP 200 con `solicitud_recibida`; después se simuló la pérdida de esa confirmación. La interfaz quedó en estado incierto y mostró "Reintentar guardado".
- Después del primer intento: 4 pedidos, 6 detalles y 1 pedido con la marca.
- Al pulsar "Reintentar guardado" sin recargar, se utilizó el flujo previsto de reintento con la misma clave y datos conservados en memoria. La interfaz mostró "Pedido guardado correctamente". Los conteos siguieron en 4 pedidos, 6 detalles y 1 pedido con la marca: no se duplicaron el pedido ni su detalle. El registro ficticio queda identificado como prueba, no para preparar ni entregar.

En la prueba de reintento, la pérdida de confirmación fue simulada; el estado de reintento continuó en memoria con la página abierta.

Prueba manual de concurrencia superada, confirmada por el usuario:

- Desde la consola del navegador se lanzaron dos llamadas a `public.crear_pedido`, creando ambas promesas antes de esperar sus respuestas. Ambas usaron la misma `clave_solicitud` (`ca4dda20-64d1-467d-9a44-0c17f10bc47e`), los mismos datos ficticios y productos: producto 1, cantidad 1; producto 3, cantidad 2.
- Estado inicial: 4 pedidos y 6 detalles; 0 pedidos y 0 detalles para esa clave.
- Ambas peticiones respondieron HTTP 200 y `solicitud_recibida`.
- Estado final: 5 pedidos y 8 detalles; 1 pedido y 2 detalles para esa clave. Las dos solicitudes dejaron un único pedido completo, sin duplicados.

Esta prueba aporta evidencia del comportamiento concurrente, pero no sustituye una revisión formal del cuerpo SQL completo de la RPC para garantizar todos los posibles casos de concurrencia. Siguen sin probarse la recuperación después de recargar/cerrar la página y una caída real de red.

El propietario de la RPC tiene privilegios amplios: su código y permisos requieren revisión cuidadosa. La respuesta no contiene importes definitivos; la vista previa mantiene los precios cargados en el navegador. Las pruebas pendientes y la protección contra abuso antes de publicar se detallan en ROADMAP.md.

### Fecha

2026-09-20

---

## Decisión 006 - Outbox privada para avisos de pedidos

### Decisión

- Registrar un aviso por pedido nuevo en `public.avisos_pedido`, como primera pieza del futuro email al negocio. La tabla contiene `id` UUID generado automáticamente, `pedido_id` UUID obligatorio, `created_at` automático y `estado` inicialmente `pendiente`, limitado a `pendiente` o `procesado`.
- Relacionar `pedido_id` con `public.pedidos(id)` mediante FOREIGN KEY con `ON DELETE RESTRICT` y `UNIQUE (pedido_id)` para impedir avisos duplicados. No duplicar datos del cliente ni importes en la outbox.
- Mantener RLS activado, sin políticas públicas y con permisos directos revocados para `PUBLIC`, `anon` y `authenticated`.
- Insertar el aviso desde `crear_pedido` usando `v_pedido_id`, después de actualizar `pedidos.total` y antes del retorno final, sin parámetros nuevos del navegador. Pedido, detalles y aviso forman parte de la misma transacción; un error revierte el conjunto. Los reintentos con una clave existente retornan antes de insertar otro aviso.
- Separar el registro del aviso de su futuro envío: no hay procesamiento, proveedor ni API key de email configurados y todavía no se envían emails. Los avisos permanecen pendientes. No se generaron avisos para pedidos anteriores a la migración.

### Motivo

Registrar de forma consistente la tarea pendiente sin depender del servicio de email durante el guardado del pedido. La unicidad del aviso no garantiza por sí sola que el futuro envío externo no se duplique.

### Validación y límites

Pruebas confirmadas por el usuario el 2026-09-24. Los conteos son globales:

| Paso | Pedidos | Detalles | Avisos |
| --- | --- | --- | --- |
| Antes de la migración | 5 | 8 | Tabla aún no creada |
| Después de la migración | 5 | 8 | 0 |
| Pedido desde la web con tres productos | 6 | 11 | 1 |
| Primer envío con clave fija | 7 | 12 | 2 |
| Repetición del mismo envío y clave | 7 | 12 | 2 |
| Dos llamadas concurrentes con una segunda clave nueva | 8 | 13 | 3 |

El pedido desde la web tuvo total S/ 27.00 y su aviso quedó relacionado correctamente, con estado `pendiente`. La repetición secuencial no duplicó pedido, detalle ni aviso. En la prueba concurrente, ambas llamadas respondieron HTTP 200 y `solicitud_recibida`; para esa clave se creó solo un pedido, un detalle y un aviso.

Estas pruebas aportan evidencia práctica, no una garantía formal para todos los posibles órdenes de ejecución concurrente. No prueban el envío de emails. Quedan por comprobar específicamente los permisos directos de la nueva outbox y la reversión conjunta con avisos ante un pedido inválido; las pruebas previas de Fase 6 no incluían esta tabla.

### Fecha

2026-09-24
