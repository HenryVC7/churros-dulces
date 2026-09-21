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

El propietario de la RPC tiene privilegios amplios: su código y permisos requieren revisión cuidadosa. La respuesta no contiene importes definitivos; la vista previa mantiene los precios cargados en el navegador. Las pruebas pendientes y la protección contra abuso antes de publicar se detallan en ROADMAP.md.

### Fecha

2026-09-20
