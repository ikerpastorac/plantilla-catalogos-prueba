const contenedorProductos = document.getElementById("contenedorProductos");
const mensajeEstado = document.getElementById("mensajeEstado");
const buscarProducto = document.getElementById("buscarProducto");
const listaCategorias = document.getElementById("listaCategorias");

let productos = [];
let categoriaSeleccionada = "TODAS";

// CONFIGURAR ENCABEZADO

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
      throw new Error("El backend devolvió una respuesta incorrecta.");
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
      "No fue posible cargar los productos. Intenta nuevamente más tarde."
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
  const busqueda = buscarProducto.value
    .trim()
    .toLowerCase();

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

    const coincideBusqueda = texto.includes(busqueda);

    return coincideCategoria && coincideBusqueda;
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

  const precio = Number(
    String(producto.PRECIO).replace(",", ".")
  );

  const precioFormateado = Number.isFinite(precio)
    ? `${CONFIG.negocio.simboloMoneda} ${precio.toLocaleString("es-NI", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
    : "Consultar precio";

  const existencia = CONFIG.catalogo.mostrarExistenciaExacta
    ? `Existencia: ${producto.EXISTENCIA || 0}`
    : (disponible ? "Disponible" : "Agotado");

  const imagen = producto.IMAGEN_URL?.trim();

  tarjeta.innerHTML = `
    <div class="producto-imagen">
      ${
        imagen
          ? `<img src="${imagen}" alt="${producto.PRODUCTO || "Producto"}" loading="lazy">`
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

      <div class="producto-categoria">
        ${producto.CATEGORIA || ""}
      </div>

      <h3></h3>

      <p class="producto-descripcion"></p>

      <div class="producto-precio">${precioFormateado}</div>

      <div class="producto-existencia ${disponible ? "" : "agotado"}">
        ${existencia}
      </div>

    </div>
  `;

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

// FILTRAR POR CATEGORÍA

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

// MENSAJES

function mostrarMensaje(texto) {
  mensajeEstado.textContent = texto;
  mensajeEstado.classList.remove("oculto");
  contenedorProductos.innerHTML = "";
}

function ocultarMensaje() {
  mensajeEstado.classList.add("oculto");
}

// INICIAR CATÁLOGO

configurarNegocio();
cargarProductos();
