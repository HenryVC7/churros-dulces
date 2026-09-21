// Nuestro carrito
let carrito = [];

// Pendiente de configurar: numero del negocio en formato internacional.
const NUMERO_WHATSAPP_NEGOCIO = "";
const formularioPedido = document.querySelector("#formulario-pedido");
const estadoPedido = document.querySelector("#estado-pedido");
const vistaPreviaPedido = document.querySelector("#vista-previa-pedido");
const mensajePedido = document.querySelector("#mensaje-pedido");
const botonPedido = formularioPedido.querySelector('button[type="submit"]');
let enviandoPedido = false;
let solicitudPedido = null;

function pedidoBloqueado() {
    return enviandoPedido || solicitudPedido?.estado === "incierto";
}

function actualizarControlesPedido() {
    const bloqueado = pedidoBloqueado();
    formularioPedido.querySelectorAll("input, textarea").forEach((campo) => {
        campo.disabled = bloqueado;
    });
    document.querySelectorAll(".productos button, .carrito button").forEach((boton) => {
        const producto = carrito[Number(boton.dataset.indice)];
        boton.disabled = bloqueado || (boton.dataset.accion === "disminuir" && producto?.cantidad === 1);
    });
    botonPedido.disabled = enviandoPedido;
    botonPedido.textContent = enviandoPedido ? "Guardando pedido…" :
        solicitudPedido?.estado === "incierto" ? "Reintentar guardado" : "Enviar pedido por WhatsApp";
}

function mostrarPedidoGuardado() {
    if (!NUMERO_WHATSAPP_NEGOCIO) {
        estadoPedido.textContent = "Pedido guardado correctamente. Falta configurar el número de WhatsApp del negocio; no se ha enviado por WhatsApp.";
        return;
    }
    if (!/^[1-9][0-9]{6,14}$/.test(NUMERO_WHATSAPP_NEGOCIO)) {
        estadoPedido.textContent = "Pedido guardado. El número de WhatsApp del negocio debe tener entre 7 y 15 dígitos, sin +, espacios ni guiones, y no comenzar con 0.";
        return;
    }
    // Un enlace evita que el navegador bloquee una ventana tras esperar fetch().
    const enlace = document.createElement("a");
    enlace.href = `https://wa.me/${NUMERO_WHATSAPP_NEGOCIO}?text=${encodeURIComponent(solicitudPedido.mensaje)}`;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
    enlace.textContent = "Abrir WhatsApp";
    estadoPedido.textContent = "Pedido guardado. Confirma el envío en WhatsApp. ";
    estadoPedido.append(enlace);
}

async function guardarPedido() {
    enviandoPedido = true;
    actualizarControlesPedido();
    mensajePedido.textContent = solicitudPedido.mensaje;
    vistaPreviaPedido.hidden = false;
    estadoPedido.textContent = "Guardando pedido…";
    const controlador = new AbortController();
    const temporizador = setTimeout(() => controlador.abort(), 15000);
    try {
        const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/rpc/crear_pedido`, {
            method: "POST",
            headers: { apikey: SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
            body: solicitudPedido.cuerpo,
            signal: controlador.signal
        });
        const resultado = await respuesta.json();
        if (!respuesta.ok) {
            if (respuesta.status === 400 && resultado?.code === "PT400") {
                solicitudPedido = null;
                estadoPedido.textContent = "Supabase rechazó los datos del pedido. Revisa los campos, las cantidades y la disponibilidad de los productos antes de intentar de nuevo.";
                return;
            }
            throw new Error("No se pudo confirmar el guardado.");
        }
        if (resultado !== "solicitud_recibida") throw new Error("Respuesta inesperada.");
        solicitudPedido.estado = "guardado";
        mostrarPedidoGuardado();
    } catch (error) {
        // Un fallo de red o un timeout no demuestra que el servidor haya revertido.
        solicitudPedido.estado = "incierto";
        estadoPedido.textContent = "No se pudo confirmar el guardado. Reintenta sin recargar ni cerrar esta página: se conservarán la misma clave y los mismos datos.";
    } finally {
        clearTimeout(temporizador);
        enviandoPedido = false;
        actualizarControlesPedido();
    }
}

function limpiarVistaPrevia() {
    estadoPedido.textContent = "";
    mensajePedido.textContent = "";
    vistaPreviaPedido.hidden = true;
}

formularioPedido.addEventListener("input", limpiarVistaPrevia);

formularioPedido.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (enviandoPedido) return;
    if (solicitudPedido?.estado === "incierto") {
        await guardarPedido();
        return;
    }
    limpiarVistaPrevia();

    if (carrito.length === 0) {
        estadoPedido.textContent = "Agrega al menos un producto al carrito para preparar el pedido.";
        return;
    }

    const campos = formularioPedido.elements;
    const nombre = campos.nombre.value.trim();
    const telefono = campos.telefono.value.trim();
    const direccion = campos.direccion.value.trim();
    const comentario = campos.comentario.value.trim();

    if (!nombre || !telefono || !direccion) {
        estadoPedido.textContent = "Completa nombre, teléfono y dirección. No pueden contener solamente espacios.";
        const campoVacio = !nombre ? campos.nombre : !telefono ? campos.telefono : campos.direccion;
        campoVacio.focus();
        return;
    }

    // Comprobamos los caracteres permitidos y contamos solo los digitos.
    const digitos = telefono.replace(/[^0-9]/g, "");
    if (!/^\+?[0-9 -]+$/.test(telefono) || digitos.length < 7 || digitos.length > 15) {
        estadoPedido.textContent = "El teléfono debe tener entre 7 y 15 dígitos. Puede incluir espacios, guiones y un + inicial.";
        campos.telefono.focus();
        return;
    }

    if (nombre.length > 120 || telefono.length > 40 || direccion.length > 300 || comentario.length > 1000) {
        estadoPedido.textContent = "Máximos permitidos: nombre 120 caracteres, teléfono 40, dirección 300 y comentario 1000.";
        return;
    }
    if (carrito.length > 100 || carrito.some((producto) =>
        !Number.isSafeInteger(producto.id) || producto.id <= 0 ||
        !Number.isInteger(producto.cantidad) || producto.cantidad < 1 || producto.cantidad > 99
    )) {
        estadoPedido.textContent = "El pedido admite hasta 100 productos distintos, con cantidades entre 1 y 99.";
        return;
    }

    let total = 0;
    const lineas = [
        "Pedido para Churros Dulces", "",
        `Cliente: ${nombre}`,
        `Teléfono: ${telefono}`,
        `Dirección: ${direccion}`, "", "Productos:"
    ];

    carrito.forEach((producto) => {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;
        lineas.push(`${producto.nombre} × ${producto.cantidad} — Subtotal: S/ ${subtotal.toFixed(2)}`);
    });

    lineas.push("", `Total: S/ ${total.toFixed(2)}`);
    if (comentario) {
        lineas.push(`Referencia/comentario: ${comentario}`);
    }

    const mensaje = lineas.join("\n");
    // textContent muestra los datos como texto, nunca como HTML.
    mensajePedido.textContent = mensaje;
    vistaPreviaPedido.hidden = false;

    const datos = {
        p_nombre_cliente: nombre,
        p_telefono_cliente: telefono,
        p_direccion_entrega: direccion,
        p_comentario: comentario || null,
        p_productos: carrito.map((producto) => ({ producto_id: producto.id, cantidad: producto.cantidad }))
            .sort((a, b) => a.producto_id - b.producto_id)
    };
    const firma = JSON.stringify(datos);
    if (solicitudPedido?.estado === "guardado" && solicitudPedido.firma === firma) {
        mensajePedido.textContent = solicitudPedido.mensaje;
        mostrarPedidoGuardado();
        return;
    }
    if (typeof globalThis.crypto?.randomUUID !== "function") {
        estadoPedido.textContent = "Abre la página mediante localhost o HTTPS para generar la clave del pedido.";
        return;
    }
    solicitudPedido = {
        firma,
        cuerpo: JSON.stringify({ ...datos, p_clave_solicitud: crypto.randomUUID() }),
        mensaje,
        estado: "pendiente"
    };
    await guardarPedido();
});

// Botón para ir a la sección de productos
const botonVerProductos = document.querySelector("#ver-productos");

botonVerProductos.addEventListener("click", () => {
    document.querySelector("#productos").scrollIntoView({
        behavior: "smooth"
    });
});

// Configuracion publica para consultar el catalogo. No usar claves secretas.
const SUPABASE_URL = "https://pjiwqnhbmskimuqykiur.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_N1UERy8hV2xEuYIHDK3L_A_bvWP34Kr";
const catalogo = document.querySelector(".productos");
const estadoProductos = document.querySelector("#estado-productos");

// Detalles visuales locales asociados a los IDs verificados en Supabase.
const detallesProductos = {
    1: { emoji: "🥨", descripcion: "Churros crujientes con azúcar y canela." },
    2: { emoji: "🍫", descripcion: "Churros acompañados de delicioso chocolate." },
    3: { emoji: "🥮", descripcion: "Deliciosos churros rellenos de manjar." }
};

async function cargarProductos() {
    estadoProductos.textContent = "Cargando productos...";
    catalogo.replaceChildren();

    try {
        const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/productos?select=id,nombre,precio,activo&activo=eq.true&order=id.asc`, {
            headers: { apikey: SUPABASE_PUBLISHABLE_KEY }
        });
        if (!respuesta.ok) throw new Error("No se pudo consultar el catálogo.");

        const productos = await respuesta.json();
        if (!Array.isArray(productos) || productos.some((producto) =>
            !producto || !Number.isInteger(producto.id) ||
            typeof producto.nombre !== "string" || !producto.nombre.trim() ||
            typeof producto.precio !== "number" || !Number.isFinite(producto.precio) ||
            producto.precio < 0 || producto.activo !== true
        )) {
            throw new Error("El catálogo contiene datos inválidos.");
        }

        productos.forEach((producto) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "producto";
            const detalles = detallesProductos[producto.id];
            if (detalles) {
                const visual = document.createElement("div");
                visual.className = "emoji-producto";
                visual.textContent = detalles.emoji;
                tarjeta.append(visual);
            }

            const nombre = document.createElement("h3");
            nombre.textContent = producto.nombre;
            tarjeta.append(nombre);

            if (detalles) {
                const descripcion = document.createElement("p");
                descripcion.textContent = detalles.descripcion;
                tarjeta.append(descripcion);
            }

            const precio = document.createElement("strong");
            precio.textContent = `S/ ${producto.precio.toFixed(2)}`;
            const boton = document.createElement("button");
            boton.type = "button";
            boton.textContent = "Agregar al carrito";
            boton.addEventListener("click", () => agregarAlCarrito(producto));
            tarjeta.append(precio, boton);
            catalogo.append(tarjeta);
        });

        estadoProductos.textContent = productos.length ? "" : "No hay productos disponibles.";
        actualizarControlesPedido();
    } catch (error) {
        catalogo.replaceChildren();
        estadoProductos.textContent = "No se pudieron cargar los productos. Intenta recargar la página.";
    }
}

// Buscamos el lugar donde mostraremos el carrito
const carritoSeccion = document.querySelector(".carrito");

// El evento permanece en la sección aunque volvamos a dibujar sus botones.
carritoSeccion.addEventListener("click", (evento) => {
    if (pedidoBloqueado()) return;
    const boton = evento.target.closest("button[data-accion]");

    if (!boton) return;

    const indice = Number(boton.dataset.indice);
    const producto = carrito[indice];

    if (!producto) return;

    if (boton.dataset.accion === "aumentar") {
        producto.cantidad += 1;
    } else if (boton.dataset.accion === "disminuir") {
        if (producto.cantidad > 1) {
            producto.cantidad -= 1;
        }
    } else if (boton.dataset.accion === "eliminar") {
        carrito.splice(indice, 1);
    }

    mostrarCarrito();
});

function agregarAlCarrito(producto) {
    if (pedidoBloqueado()) return;
    const productoExistente = carrito.find((item) => item.id === producto.id);
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
    }
    mostrarCarrito();
}


// Función para mostrar el carrito
function mostrarCarrito() {
    limpiarVistaPrevia();

    if (carrito.length === 0) {
        carritoSeccion.innerHTML = `
            <h2>🛒 Tu carrito</h2>
            <p>Tu carrito está vacío.</p>
        `;
        return;
    }

    let total = 0;

    carritoSeccion.innerHTML = "<h2>🛒 Tu carrito</h2>";

    carrito.forEach((producto, indice) => {

        const subtotal = producto.precio * producto.cantidad;

        const fila = document.createElement("div");
        fila.className = "carrito-producto";
        // Esta plantilla es fija; los datos externos se asignan como texto.
        fila.innerHTML = `
            <p></p>
            <div class="carrito-controles">
                <button type="button" data-accion="disminuir">-</button>
                <span aria-label="Cantidad"></span>
                <button type="button" data-accion="aumentar">+</button>
                <button type="button" data-accion="eliminar">Eliminar</button>
            </div>`;
        fila.querySelector("p").textContent = `${producto.nombre} - Subtotal: S/ ${subtotal.toFixed(2)}`;
        fila.querySelector("span").textContent = producto.cantidad;
        fila.querySelectorAll("button").forEach((boton) => {
            boton.dataset.indice = indice;
            const accion = boton.dataset.accion;
            const etiqueta = accion === "aumentar" ? "Aumentar cantidad de" :
                accion === "disminuir" ? "Disminuir cantidad de" : "Eliminar";
            boton.setAttribute("aria-label", `${etiqueta} ${producto.nombre}`);
            boton.disabled = accion === "disminuir" && producto.cantidad === 1;
        });
        carritoSeccion.append(fila);

        total += subtotal;
    });

    const totalElemento = document.createElement("h3");
    totalElemento.textContent = `Total: S/ ${total.toFixed(2)}`;
    carritoSeccion.append(totalElemento);
}

cargarProductos();
