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
- Pendiente: definir y crear la estructura de datos para pedidos y su detalle, configurar sus permisos/RLS e implementar y probar el guardado de pedidos en Supabase. Actualmente solo se consulta el catálogo; los pedidos no se guardan en la base de datos.

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
- El número comercial definitivo está pendiente de configuración intencionalmente. `NUMERO_WHATSAPP_NEGOCIO` permanece vacío y bloquea la apertura de WhatsApp; la vista previa sigue disponible. El número personal utilizado para la prueba fue retirado.
- Fase 5 - Git y GitHub: los hitos definidos ya están realizados (repositorio local, primer commit y conexión y subida a GitHub).
- Fase 6 - Backend: en progreso. Pruebas manuales principales confirmadas por el usuario: tres productos cargados, diseño conservado, carrito agrupado por ID, cantidades 2/3/1, subtotales S/ 10.00, S/ 21.00 y S/ 8.00, total S/ 39.00, vista previa y aviso por falta del número de WhatsApp correctos. Continúa pendiente el guardado de pedidos.
