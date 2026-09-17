// Nuestro carrito
let carrito = [];

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
