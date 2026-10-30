
const CONFIG = {
  // Datos generales del negocio
  negocio: {
    id: "catalogo_prueba",
    nombre: "Tienda Demostración",
    descripcion: "los mejores productos a excelentes precios",
    logo: "",
    whatsapp: "50588644959",

  },

  // Personalización visual
  apariencia: {
    colorPrincipal: "#8B0000",
    colorSecundario: "#C0392B",
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
    mostrarExistenciaExacta: false,
    mostrarProductosAgotados: true,
    mostrarDestacados: false
  },

  // Conexión con Google Apps Script
  api: {
    url: "https://script.google.com/macros/s/AKfycbwhLfvlKbKWaVYVTbPDX7bXBsOioPvSHZRbWI4HwtH5RwsGwZ-DX51TG8X_e5LEPFPq/exec"
  }
};
