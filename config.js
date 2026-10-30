
const CONFIG = {
  // Datos generales del negocio
  negocio: {
    id: "catalogo_prueba",
    nombre: "Catálogo de prueba",
    descripcion: "Descubre nuestros productos",
    logo: "",
    whatsapp: "50588644959",

    // Se conserva temporalmente para compatibilidad
    // con la versión actual de app.js
    simboloMoneda: "C$"
  },

  // Personalización visual
  apariencia: {
    colorPrincipal: "#172B4D",
    colorSecundario: "#426B9A",
    colorFondo: "#F7F8FA",
    colorTarjetas: "#FFFFFF",
    colorTexto: "#202B3C",
    colorTextoSecundario: "#687386",
    colorBorde: "#E2E7EE"
  },

  // Configuración de moneda
  moneda: {
    codigo: "NIO",
    simbolo: "C$",
    locale: "es-NI",
    decimales: 2
  },

  // Opciones de visualización del catálogo
  catalogo: {
    mostrarExistenciaExacta: true,
    mostrarProductosAgotados: true,
    mostrarDestacados: true
  },

  // Conexión con Google Apps Script
  api: {
    url: "https://script.google.com/macros/s/AKfycbwhLfvlKbKWaVYVTbPDX7bXBsOioPvSHZRbWI4HwtH5RwsGwZ-DX51TG8X_e5LEPFPq/exec"
  }
};
