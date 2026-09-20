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

Identificar los productos del carrito por `id` y mantener temporalmente las descripciones y elementos visuales locales asociados a ese ID. Este paso solo consulta productos; el guardado de pedidos sigue pendiente.

### Motivo

Aprender a consultar una API con las herramientas del navegador, conservar el diseño y funcionamiento del carrito y evitar depender del nombre para identificar cada producto.

### Fecha

2026-09-20
