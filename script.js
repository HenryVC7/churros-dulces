// Nuestro carrito
let carrito = [];

// Pendiente de configurar: numero del negocio en formato internacional.
const NUMERO_WHATSAPP_NEGOCIO = "";
const formularioPedido = document.querySelector("#formulario-pedido");
const estadoPedido = document.querySelector("#estado-pedido");
const vistaPreviaPedido = document.querySelector("#vista-previa-pedido");
const mensajePedido = document.querySelector("#mensaje-pedido");

function limpiarVistaPrevia() {
    estadoPedido.textContent = "";
    mensajePedido.textContent = "";
    vistaPreviaPedido.hidden = true;
}

formularioPedido.addEventListener("input", limpiarVistaPrevia);

formularioPedido.addEventListener("submit", (evento) => {
    evento.preventDefault();
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
    const mensajeCodificado = encodeURIComponent(mensaje);
    // textContent muestra los datos como texto, nunca como HTML.
    mensajePedido.textContent = mensaje;
    vistaPreviaPedido.hidden = false;

    if (!NUMERO_WHATSAPP_NEGOCIO) {
        estadoPedido.textContent = "El pedido se generó correctamente, pero falta configurar el número de WhatsApp del negocio. No se ha enviado.";
        return;
    }

    window.open(`https://wa.me/${NUMERO_WHATSAPP_NEGOCIO}?text=${mensajeCodificado}`, "_blank", "noopener,noreferrer");
    estadoPedido.textContent = "Pedido preparado. Confirma el envío en WhatsApp.";
});

// Botón para ir a la sección de productos
const botonVerProductos = document.querySelector("#ver-productos");

botonVerProductos.addEventListener("click", () => {
    document.querySelector("#productos").scrollIntoView({
        behavior: "smooth"
    });
});

// Buscamos todos los productos
const productos = document.querySelectorAll(".producto");

// Buscamos el lugar donde mostraremos el carrito
const carritoSeccion = document.querySelector(".carrito");

// El evento permanece en la sección aunque volvamos a dibujar sus botones.
carritoSeccion.addEventListener("click", (evento) => {
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

// Agregamos un evento a cada botón
productos.forEach((producto) => {

    const boton = producto.querySelector("button");

    boton.addEventListener("click", () => {

        const nombre = producto.dataset.nombre;
        const precio = Number(producto.dataset.precio);

        const productoExistente = carrito.find((item) => item.nombre === nombre);

        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            carrito.push({
                nombre: nombre,
                precio: precio,
                cantidad: 1
            });
        }

        mostrarCarrito();
    });
});


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

    let contenido = `
        <h2>🛒 Tu carrito</h2>
    `;

    carrito.forEach((producto, indice) => {

        const subtotal = producto.precio * producto.cantidad;

        contenido += `
            <div class="carrito-producto">
                <p>${producto.nombre} - Subtotal: S/ ${subtotal.toFixed(2)}</p>
                <div class="carrito-controles">
                    <button type="button" data-accion="disminuir" data-indice="${indice}"
                        aria-label="Disminuir cantidad de ${producto.nombre}"
                        ${producto.cantidad === 1 ? "disabled" : ""}>-</button>
                    <span aria-label="Cantidad">${producto.cantidad}</span>
                    <button type="button" data-accion="aumentar" data-indice="${indice}"
                        aria-label="Aumentar cantidad de ${producto.nombre}">+</button>
                    <button type="button" data-accion="eliminar" data-indice="${indice}"
                        aria-label="Eliminar ${producto.nombre}">Eliminar</button>
                </div>
            </div>
        `;

        total += subtotal;
    });

    contenido += `
        <h3>Total: S/ ${total.toFixed(2)}</h3>
    `;

    carritoSeccion.innerHTML = contenido;
}
