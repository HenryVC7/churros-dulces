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

    carrito.forEach((producto) => {

        const subtotal = producto.precio * producto.cantidad;

        contenido += `
            <p>${producto.nombre} × ${producto.cantidad} - S/ ${subtotal.toFixed(2)}</p>
        `;

        total += subtotal;
    });

    contenido += `
        <h3>Total: S/ ${total.toFixed(2)}</h3>
    `;

    carritoSeccion.innerHTML = contenido;
}
