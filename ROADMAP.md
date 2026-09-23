# Churros Dulces - Roadmap

## Fase 1 - Preparación
- Crear la estructura inicial del proyecto.
- Crear la documentación del proyecto.
- Git configurado.

## Fase 2 - Página web
- Crear la página de inicio.
- Crear la sección de productos.
- Crear el diseño responsive.
- Agregar estilos con CSS.

## Fase 3 - Carrito
- Agregar productos al carrito.
- Mostrar cantidades.
- Calcular el total.
- Permitir eliminar productos.

## Fase 4 - Pedidos
- Crear formulario de pedido.
- Validar los datos.
- Mostrar resumen del pedido.
- Generar mensaje para WhatsApp.

## Fase 5 - Git y GitHub
- Repositorio local creado.
- Primer commit realizado.
- Proyecto conectado al repositorio remoto `origin` y subido a GitHub.

## Fase 6 - Backend
- Completado: catálogo conectado a Supabase mediante REST Data API y `fetch()`, sin dependencias nuevas.
- Completado: tabla `public.productos` con tres productos guardados. Se consultan `id`, `nombre`, `precio` y `activo`, filtrando activos y ordenando por `id` ascendente.
- RLS permanece activado y `productos` tiene una política pública SELECT con `USING (true)`. El frontend utiliza exclusivamente la Publishable key, nunca Secret ni `service_role`.
- El carrito identifica los productos por `id`; las descripciones y elementos visuales siguen temporalmente en JavaScript asociados a ese ID.
- Completado: tablas `public.pedidos` y `public.detalle_pedido`, relacionadas mediante claves foráneas, con restricciones y RLS activado. Sin acceso público directo; `anon` solo puede crear pedidos mediante la RPC autorizada.
- Completado: RPC `public.crear_pedido` conectada al formulario mediante `fetch()` y Publishable key. Obtiene nombres y precios de `productos`, calcula importes en PostgreSQL y guarda pedido y detalles de forma atómica, con estado inicial `pendiente`.
- Completado: idempotencia mediante `clave_solicitud` única. El navegador bloquea envíos simultáneos y conserva la misma clave y datos para reintentar resultados inciertos mientras la página permanece abierta.
- Verificado por el usuario: formulario real con producto 2 (cantidad 1, precio/subtotal S/ 7.00) y producto 3 (cantidad 2, precio S/ 8.00, subtotal S/ 16.00); total guardado S/ 23.00 y estado `pendiente`. Catálogo y carrito siguen funcionando.
- Verificado previamente: reintentos sin duplicados, RPC como `anon` con HTTP 200 y `solicitud_recibida`, y SELECT directo denegado en ambas tablas privadas con HTTP 401 / PostgreSQL 42501.
- Verificado por el usuario (2026-09-22): atomicidad con producto 1 válido y producto 999999 inexistente. La RPC devolvió PT400: "Uno de los productos no está disponible". Los conteos permanecieron en 3 pedidos y 5 detalles, sin registros asociados a la clave de prueba; el fallo revirtió la operación completa.
- Verificado por el usuario (2026-09-22): desde el navegador con Publishable key y rol `anon`, INSERT directo en `pedidos` y `detalle_pedido`, y UPDATE/DELETE directo en `pedidos`, fueron rechazados con HTTP 401 / PostgreSQL 42501. Los conteos siguieron en 3 pedidos y 5 detalles, sin registros de prueba.
- Verificado por el usuario (2026-09-22): reintento desde la interfaz real tras simular la pérdida de confirmación de la primera llamada a `crear_pedido`, que respondió HTTP 200 y `solicitud_recibida`. La interfaz pasó a estado incierto y permitió "Reintentar guardado" sin recargar. Los conteos pasaron de 3 pedidos / 5 detalles a 4 / 6 tras el primer intento y permanecieron en 4 / 6 tras el reintento, con un único pedido marcado de prueba y sin duplicados.
- Verificado por el usuario: prueba manual de dos llamadas concurrentes a `crear_pedido` con la misma clave y datos. Ambas respondieron HTTP 200 y `solicitud_recibida`; los conteos pasaron de 4 pedidos / 6 detalles a 5 / 8, con un único pedido completo y dos detalles para la clave de prueba, sin duplicados. Aporta evidencia del comportamiento concurrente, pero no sustituye una revisión formal del cuerpo SQL completo de la RPC para garantizar todos los posibles casos de concurrencia.
- Pendiente de verificación: recuperación después de recargar/cerrar la página y una caída real de red. También sigue pendiente antes de publicar comprobar el bloqueo de UPDATE/DELETE directo sobre `detalle_pedido`.
- Pendiente antes de publicar: protección contra abuso de la RPC pública (límites de solicitudes y evaluación de CAPTCHA). RLS e idempotencia no impiden spam con claves nuevas.
- Limitaciones actuales: la clave de reintento no persiste al recargar o cerrar; la vista previa usa precios del catálogo cargado y la RPC no devuelve los importes guardados. Debe definirse cómo manejar cambios de precio antes de publicar; la persistencia entre recargas queda como mejora por evaluar.

## Fase 7 - APIs y automatización
- Integrar APIs.
- Crear automatizaciones.
- Explorar agentes de IA.

## Fase 8 - Publicación
- Antes de publicar, configurar un número comercial autorizado en `NUMERO_WHATSAPP_NEGOCIO`, en formato internacional, y comprobar el destinatario y el mensaje en WhatsApp.
- Publicar el proyecto.
- Conectar el frontend con el backend.
- Probar la aplicación.

## Estado actual

- Fase 1 - Preparación: completada. Estructura y documentación creadas, y Git configurado.
- Fase 2 - Página web: en progreso.
- Fase 3 - Carrito: completada. Permite agregar productos, modificar cantidades, eliminar productos y calcular subtotales y total.
- Fase 4 - Pedidos: completada en su alcance funcional. Formulario del cliente, validación, vista previa e integración mediante `wa.me` implementados. Prueba local de WhatsApp confirmada por el usuario.
- El número comercial definitivo está pendiente de configuración intencionalmente. `NUMERO_WHATSAPP_NEGOCIO` permanece vacío: el pedido se guarda en Supabase y la vista previa sigue disponible, pero no se abre ni se envía por WhatsApp. El número personal utilizado para la prueba fue retirado.
- Fase 5 - Git y GitHub: los hitos definidos ya están realizados (repositorio local, primer commit y conexión y subida a GitHub).
- Fase 6 - Backend: alcance funcional completado y guardado real probado por el usuario. Quedan las verificaciones y medidas previas a publicación detalladas en la fase; no significa que la web esté lista para producción.
