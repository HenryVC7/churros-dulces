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

        carrito.push({
            nombre: nombre,
            precio: precio
        });

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

        contenido += `
            <p>${producto.nombre} - S/ ${producto.precio.toFixed(2)}</p>
        `;

        total += producto.precio;
    });

    contenido += `
        <h3>Total: S/ ${total.toFixed(2)}</h3>
    `;

    carritoSeccion.innerHTML = contenido;
}
