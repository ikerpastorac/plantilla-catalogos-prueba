const contenedorProductos = document.getElementById("contenedorProductos");
const mensajeEstado = document.getElementById("mensajeEstado");
const buscarProducto = document.getElementById("buscarProducto");
const listaCategorias = document.getElementById("listaCategorias");

const listaCarrito = document.getElementById("listaCarrito");
const cantidadCarrito = document.getElementById("cantidadCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const vaciarCarrito = document.getElementById("vaciarCarrito");
const enviarWhatsApp = document.getElementById("enviarWhatsApp");

let productos = [];
let carrito = [];
let categoriaSeleccionada = "TODAS";

// CONFIGURAR NEGOCIO

function configurarNegocio() {
  document.title = CONFIG.negocio.nombre;

  document.getElementById("nombreNegocio").textContent =
    CONFIG.negocio.nombre;

  document.getElementById("tituloCatalogo").textContent =
    CONFIG.negocio.descripcion;

  document.getElementById("descripcionNegocio").textContent =
    "Explora nuestro catálogo y descubre todos nuestros productos.";

  document.getElementById("pieNegocio").textContent =
    CONFIG.negocio.nombre;

  if (CONFIG.negocio.logo) {
    const logo = document.getElementById("logoNegocio");
    logo.src = CONFIG.negocio.logo;
    logo.style.display = "block";
  }
}

// FORMATO DE PRECIOS

function obtenerPrecio(producto) {
  const precio = Number(
    String(producto.PRECIO).replace(",", ".")
  );

  return Number.isFinite(precio) ? precio : 0;
}

function formatearPrecio(precio) {
  return `${CONFIG.negocio.simboloMoneda} ${precio.toLocaleString("es-NI", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

// CONSULTAR BACKEND

async function cargarProductos() {
  const estadoConexion = document.getElementById("estadoConexion");

  try {
    estadoConexion.textContent = "Consultando productos...";

    const respuesta = await fetch(CONFIG.api.url);

    if (!respuesta.ok) {
      throw new Error("No se pudo consultar el catálogo.");
    }

    const datos = await respuesta.json();

    if (!datos.ok) {
      throw new Error("Respuesta incorrecta del backend.");
    }

    productos = datos.productos.filter(producto =>
      producto.PUBLICO?.trim().toUpperCase() === "SI"
    );

    if (!CONFIG.catalogo.mostrarProductosAgotados) {
      productos = productos.filter(producto =>
        producto.DISPONIBLE?.trim().toUpperCase() === "SI" &&
        Number(producto.EXISTENCIA) > 0
      );
    }

    productos.sort((a, b) =>
      Number(a.ORDEN || 999) - Number(b.ORDEN || 999)
    );

    estadoConexion.textContent =
      `${productos.length} productos disponibles en el catálogo`;

    crearCategorias();
    mostrarProductos();

  } catch (error) {
    console.error(error);

    estadoConexion.textContent = "No se pudo conectar";

    mostrarMensaje(
      "No fue posible cargar los productos. Intenta nuevamente."
    );
  }
}

// CREAR CATEGORÍAS

function crearCategorias() {
  const categorias = [
    ...new Set(
      productos
        .map(producto => producto.CATEGORIA?.trim())
        .filter(Boolean)
    )
  ];

  listaCategorias.innerHTML = `
    <button class="categoria activa" data-categoria="TODAS">
      Todas
    </button>
  `;

  categorias.forEach(categoria => {
    const boton = document.createElement("button");

    boton.className = "categoria";
    boton.dataset.categoria = categoria;
    boton.textContent = categoria;

    listaCategorias.appendChild(boton);
  });
}

// MOSTRAR PRODUCTOS

function mostrarProductos() {
  const busqueda = buscarProducto.value.trim().toLowerCase();

  const filtrados = productos.filter(producto => {
    const coincideCategoria =
      categoriaSeleccionada === "TODAS" ||
      producto.CATEGORIA === categoriaSeleccionada;

    const texto = [
      producto.PRODUCTO,
      producto.CATEGORIA,
      producto.DESCRIPCION,
      producto.CODIGO
    ].join(" ").toLowerCase();

    return coincideCategoria && texto.includes(busqueda);
  });

  document.getElementById("cantidadProductos").textContent =
    `${filtrados.length} productos encontrados`;

  contenedorProductos.innerHTML = "";

  if (filtrados.length === 0) {
    mostrarMensaje("No se encontraron productos.");
    return;
  }

  ocultarMensaje();

  filtrados.forEach(producto => {
    contenedorProductos.appendChild(crearTarjeta(producto));
  });
}

// CREAR TARJETA

function crearTarjeta(producto) {
  const tarjeta = document.createElement("article");
  tarjeta.className = "producto";

  const disponible =
    producto.DISPONIBLE?.trim().toUpperCase() === "SI" &&
    Number(producto.EXISTENCIA) > 0;

  const imagen = producto.IMAGEN_URL?.trim();

  const precioFormateado = formatearPrecio(obtenerPrecio(producto));

  const existencia = CONFIG.catalogo.mostrarExistenciaExacta
    ? `Existencia: ${producto.EXISTENCIA || 0}`
    : (disponible ? "Disponible" : "Agotado");

  tarjeta.innerHTML = `
    <div class="producto-imagen">
      ${
        imagen
          ? `<img src="${imagen}" alt="Producto" loading="lazy">`
          : `<span class="imagen-vacia">Imagen no disponible</span>`
      }
    </div>

    <div class="producto-contenido">

      ${
        CONFIG.catalogo.mostrarDestacados &&
        producto.DESTACADO?.trim().toUpperCase() === "SI"
          ? `<span class="etiqueta-destacado">DESTACADO</span>`
          : ""
      }

      <div class="producto-categoria"></div>

      <h3></h3>

      <p class="producto-descripcion"></p>

      <div class="producto-precio">${precioFormateado}</div>

      <div class="producto-existencia ${disponible ? "" : "agotado"}">
        ${existencia}
      </div>

      <button
        class="boton-agregar"
        data-codigo="${producto.CODIGO}"
        ${disponible ? "" : "disabled"}
      >
        ${disponible ? "Agregar al carrito" : "Agotado"}
      </button>

    </div>
  `;

  tarjeta.querySelector(".producto-categoria").textContent =
    producto.CATEGORIA || "";

  tarjeta.querySelector("h3").textContent =
    producto.PRODUCTO || "Producto sin nombre";

  tarjeta.querySelector(".producto-descripcion").textContent =
    producto.DESCRIPCION || "";

  const imagenElemento = tarjeta.querySelector("img");

  if (imagenElemento) {
    imagenElemento.addEventListener("error", () => {
      const contenedor = tarjeta.querySelector(".producto-imagen");
      contenedor.innerHTML =
        '<span class="imagen-vacia">Imagen no disponible</span>';
    });
  }

  return tarjeta;
}

// FILTROS DE CATEGORÍA

listaCategorias.addEventListener("click", evento => {
  const boton = evento.target.closest(".categoria");

  if (!boton) return;

  categoriaSeleccionada = boton.dataset.categoria;

  document.querySelectorAll(".categoria").forEach(elemento => {
    elemento.classList.remove("activa");
  });

  boton.classList.add("activa");

  mostrarProductos();
});

// BUSCADOR

buscarProducto.addEventListener("input", mostrarProductos);

// AGREGAR PRODUCTOS AL CARRITO

contenedorProductos.addEventListener("click", evento => {
  const boton = evento.target.closest(".boton-agregar");

  if (!boton || boton.disabled) return;

  const codigo = boton.dataset.codigo;

  const producto = productos.find(item =>
    item.CODIGO === codigo
  );

  if (!producto) return;

  agregarAlCarrito(producto);
});

function agregarAlCarrito(producto) {
  const existente = carrito.find(item =>
    item.producto.CODIGO === producto.CODIGO
  );

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({
      producto: producto,
      cantidad: 1
    });
  }

  mostrarCarrito();
}

// MOSTRAR CARRITO

function mostrarCarrito() {
  listaCarrito.innerHTML = "";

  const totalUnidades = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  const total = carrito.reduce(
    (suma, item) =>
      suma + obtenerPrecio(item.producto) * item.cantidad,
    0
  );

  cantidadCarrito.textContent =
    `${totalUnidades} productos seleccionados`;

  totalCarrito.textContent = formatearPrecio(total);

  vaciarCarrito.disabled = carrito.length === 0;
  enviarWhatsApp.disabled = carrito.length === 0;

  if (carrito.length === 0) {
    listaCarrito.innerHTML = `
      <p class="carrito-vacio">
        Todavía no has agregado productos.
      </p>
    `;

    return;
  }

  carrito.forEach(item => {
    const producto = item.producto;

    const elemento = document.createElement("div");
    elemento.className = "item-carrito";

    const informacion = document.createElement("div");
    informacion.className = "item-carrito-info";

    const nombre = document.createElement("h3");
    nombre.textContent = producto.PRODUCTO;

    const subtotal = document.createElement("p");
    subtotal.textContent =
      `Subtotal: ${formatearPrecio(
        obtenerPrecio(producto) * item.cantidad
      )}`;

    informacion.append(nombre, subtotal);

    const controles = document.createElement("div");
    controles.className = "controles-cantidad";

    const disminuir = document.createElement("button");
    disminuir.textContent = "−";
    disminuir.dataset.accion = "disminuir";
    disminuir.dataset.codigo = producto.CODIGO;
    disminuir.setAttribute("aria-label", "Disminuir cantidad");

    const cantidad = document.createElement("span");
    cantidad.className = "cantidad-actual";
    cantidad.textContent = item.cantidad;

    const aumentar = document.createElement("button");
    aumentar.textContent = "+";
    aumentar.dataset.accion = "aumentar";
    aumentar.dataset.codigo = producto.CODIGO;
    aumentar.setAttribute("aria-label", "Aumentar cantidad");

    const eliminar = document.createElement("button");
    eliminar.textContent = "Eliminar";
    eliminar.className = "boton-eliminar";
    eliminar.dataset.accion = "eliminar";
    eliminar.dataset.codigo = producto.CODIGO;

    controles.append(disminuir, cantidad, aumentar, eliminar);
    elemento.append(informacion, controles);

    listaCarrito.appendChild(elemento);
  });
}

// MODIFICAR CANTIDADES Y ELIMINAR

listaCarrito.addEventListener("click", evento => {
  const boton = evento.target.closest("button");

  if (!boton) return;

  const codigo = boton.dataset.codigo;
  const accion = boton.dataset.accion;

  const item = carrito.find(elemento =>
    elemento.producto.CODIGO === codigo
  );

  if (!item) return;

  if (accion === "aumentar") {
    item.cantidad++;
  }

  if (accion === "disminuir") {
    item.cantidad--;

    if (item.cantidad <= 0) {
      carrito = carrito.filter(elemento =>
        elemento.producto.CODIGO !== codigo
      );
    }
  }

  if (accion === "eliminar") {
    carrito = carrito.filter(elemento =>
      elemento.producto.CODIGO !== codigo
    );
  }

  mostrarCarrito();
});

// VACIAR CARRITO

vaciarCarrito.addEventListener("click", () => {
  carrito = [];
  mostrarCarrito();
});

// MENSAJES

function mostrarMensaje(texto) {
  mensajeEstado.textContent = texto;
  mensajeEstado.classList.remove("oculto");
  contenedorProductos.innerHTML = "";
}

function ocultarMensaje() {
  mensajeEstado.classList.add("oculto");
}
// GENERAR PEDIDO POR WHATSAPP

function enviarPedidoWhatsApp() {

  if (carrito.length === 0) {
    alert("El carrito está vacío.");
    return;
  }

  const telefono = CONFIG.negocio.whatsapp
    .replace(/\D/g, "");

  if (!telefono) {
    alert("Primero debes configurar el número de WhatsApp del negocio.");
    return;
  }

  const total = carrito.reduce(
    (suma, item) =>
      suma + obtenerPrecio(item.producto) * item.cantidad,
    0
  );

  let mensaje = `Hola, deseo realizar el siguiente pedido para ${CONFIG.negocio.nombre}:\n\n`;

  carrito.forEach(item => {

    const producto = item.producto;
    const precio = obtenerPrecio(producto);
    const subtotal = precio * item.cantidad;

    mensaje += `*${producto.PRODUCTO}*\n`;
    mensaje += `Cantidad: ${item.cantidad}\n`;
    mensaje += `Precio unitario: ${formatearPrecio(precio)}\n`;
    mensaje += `Subtotal: ${formatearPrecio(subtotal)}\n\n`;

  });

  mensaje += `*TOTAL DEL PEDIDO: ${formatearPrecio(total)}*\n\n`;

  mensaje += "Por favor, confirmen la disponibilidad de los productos y las cantidades solicitadas.\n\n";

  mensaje += "Gracias.";

  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank");
}

enviarWhatsApp.addEventListener("click", enviarPedidoWhatsApp);
// INICIAR

configurarNegocio();
mostrarCarrito();
cargarProductos();
