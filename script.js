// Script para la barra de navegación
const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');
const cerrar = document.getElementById('close');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (cerrar) {
    cerrar.addEventListener('click', (e) => {
        e.preventDefault();
        nav.classList.remove('active');
    });
}

let productosGlobales = []; // Para almacenar todos los productos obtenidos
const API_URL = 'https://fakestoreapi.com/products';

// 1. Función para realizar la petición a la API
async function llamarAPI(API) {
    try {
        const response = await fetch(API);
        if (!response.ok) {
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }
        productosGlobales = await response.json();
        return productosGlobales;
    } catch (error) {
        console.error('Error al obtener los productos de la API:', error);
        return [];
    }
}

// 2. Función que recibe un producto y crea su elemento HTML como cadena de texto
function Producto(producto) {
    const displayTitle = producto.title.substring(0, 20) + '...';

    return `
    <div class="producto">
        <img src="${producto.image}" alt="${producto.title}">
        <div class="producto-descripcion">
            <span>${producto.category}</span>
            <h5>${displayTitle}</h5>
            <h4>$${producto.price.toFixed(2)}</h4>
        </div>
        <a id="btn-agregar-${producto.id}" class="carrito" href="#">
            <i class="fal fa-shopping-cart"></i>
        </a>
    </div>
    `;
}

// 3. Función que inserta los productos en el contenedor HTML
function dibujarDatos(json) {
    const filas = json.map(obj => Producto(obj));
    document.querySelector('.productos-container').innerHTML = filas.join('');
}

// 4. Adjuntar eventos a los botones "Agregar al carrito"
function adjuntarEventosCarrito() {
    productosGlobales.forEach(producto => {
        const boton = document.getElementById(`btn-agregar-${producto.id}`);
        if (boton) {
            boton.addEventListener('click', (e) => {
                e.preventDefault();
                agregarProductoAlCarrito(producto);
                const prodElemento = boton.closest('.producto');
                prodElemento.classList.add('agregado');
                setTimeout(() => prodElemento.classList.remove('agregado'), 1000);
            });
        }
    });
}

// 5. Agregar producto al carrito guardado en localStorage
function agregarProductoAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];

    const indiceProductoExistente = carrito.findIndex(item => item.id === producto.id);

    if (indiceProductoExistente !== -1) {
        carrito[indiceProductoExistente].cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            title: producto.title,
            price: producto.price,
            image: producto.image,
            cantidad: 1
        });
    }

    localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));
    alert(`${producto.title} agregado al carrito!`);

    actualizarContadorCarrito();
    mostrarPreviewCarrito();
    cargarProductosCarrito(); // Para actualizar vista carrito si está visible
}

// Función para actualizar el contador del carrito en el header
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
    const cantidadTotal = carrito.reduce((total, producto) => total + producto.cantidad, 0);

    const contadorElemento = document.getElementById('contador-carrito');
    if (contadorElemento) {
        contadorElemento.textContent = cantidadTotal;
    }
}

// Función para mostrar preview del carrito (lista resumida)
function mostrarPreviewCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
    const lista = document.getElementById('lista-productos-preview');
    if (!lista) return;
    lista.innerHTML = '';

    carrito.forEach(producto => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${producto.image}" alt="${producto.title}">
            <span>${producto.title.substring(0, 15)}... (${producto.cantidad})</span>
        `;
        lista.appendChild(li);
    });
}

// ----------------------------------------------------------------------- //
// Cargar productos del carrito y mostrarlos en tabla (carrito.html)
function cargarProductosCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
    const tablaCarrito = document.querySelector('#tabla_carrito');
    if (!tablaCarrito) return;

    tablaCarrito.innerHTML = '';

    if (carrito.length === 0) {
        tablaCarrito.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Tu carrito está vacío. Agrega productos desde la <a href="./tienda.html">tienda</a>.</td></tr>';
    } else {
        carrito.forEach(producto => {
            tablaCarrito.innerHTML += crearFilaProducto(producto);
        });
    }

    actualizarTotales();
    eventosFila();
}

// Crear fila HTML para cada producto en el carrito
function crearFilaProducto(producto) {
    const productoSubtotal = (producto.price * producto.cantidad).toFixed(2);
    const displayTitle = producto.title.substring(0, 10) + '...';

    return `
        <tr>
            <td>
                <button id="remove-${producto.id}" class="remove-btn"><i class="far fa-times-circle"></i></button>
            </td>
            <td>
                <img src="${producto.image}" alt="${producto.title}" style="height: 80px; width: auto; object-fit: contain;">
            </td>
            <td>${displayTitle}</td>
            <td>$${producto.price.toFixed(2)}</td>
            <td>
                <input type="number" value="${producto.cantidad}" min="1" id="cantidad-${producto.id}" class="cantidad-producto">
            </td>
            <td class="subtotal">$${productoSubtotal}</td>
        </tr>
    `;
}

// Actualiza subtotal y total general del carrito
function actualizarTotales() {
    const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
    let subtotalCalculado = 0;

    carrito.forEach(producto => {
        subtotalCalculado += producto.price * producto.cantidad;
    });

    // Actualizar subtotales en cada fila
    const filas = document.querySelectorAll('#tabla_carrito tr');
    filas.forEach(fila => {
        const input = fila.querySelector('.cantidad-producto');
        if (input) {
            const productId = parseInt(input.id.replace('cantidad-', ''));
            const producto = carrito.find(item => item.id === productId);
            if (producto) {
                const subtotalCelda = fila.querySelector('.subtotal');
                const subtotalProducto = (producto.price * producto.cantidad).toFixed(2);
                subtotalCelda.textContent = `$${subtotalProducto}`;
            }
        }
    });

    // Actualizar total general
    document.querySelectorAll('#total').forEach(elemento => {
        elemento.textContent = subtotalCalculado.toFixed(2);
    });

    actualizarContadorCarrito();
    mostrarPreviewCarrito();
}

// Eventos para eliminar producto o cambiar cantidad en carrito
function eventosFila() {
    // Eliminar productos
    document.querySelectorAll('.remove-btn').forEach(boton => {
        boton.addEventListener('click', () => {
            const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
            const productId = parseInt(boton.id.replace('remove-', ''));
            const indiceProducto = carrito.findIndex(producto => producto.id === productId);

            if (indiceProducto !== -1) {
                carrito.splice(indiceProducto, 1);
                localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));
                cargarProductosCarrito();
                actualizarContadorCarrito();
                mostrarPreviewCarrito();
            }
        });
    });

    // Cambiar cantidad
    document.querySelectorAll('.cantidad-producto').forEach(input => {
        input.addEventListener('change', () => {
            const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
            const productId = parseInt(input.id.replace('cantidad-', ''));
            let nuevaCantidad = parseInt(input.value);

            if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
                nuevaCantidad = 1;
                input.value = nuevaCantidad;
            }

            const producto = carrito.find(item => item.id === productId);
            if (producto) {
                producto.cantidad = nuevaCantidad;
                localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));
                actualizarTotales();
            }
        });
    });
}

// -------------------------- //
// Validación y envío del formulario de contacto

// Referencias a los campos
const formularioContacto = document.getElementById('formularioContacto');
const tuNombre = document.getElementById('tuNombre');
const tuCorreo = document.getElementById('tuCorreo');
const asunto = document.getElementById('asunto');
const tuMensaje = document.getElementById('tuMensaje');

// Mostrar estado del campo (error o válido)
const mostrarEstadoCampo = (elementoInput, esValido, mensaje = '') => {
    const divPadre = elementoInput.parentNode;
    const textoError = divPadre.querySelector('.texto-error');

    if (esValido) {
        divPadre.classList.remove('error');
        if (textoError) textoError.innerText = '';
    } else {
        divPadre.classList.add('error');
        if (textoError) textoError.innerText = mensaje;
    }
};

// Validar correo electrónico con regex
function esCorreoValido(correo) {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexCorreo.test(correo);
}

// Validar campo individual
const validarCampo = (campo, mensajeVacio, mensajeInvalido = '') => {
    const valor = campo.value.trim();
    if (valor === '') {
        mostrarEstadoCampo(campo, false, mensajeVacio);
        return false;
    } else if (campo.id === 'tuCorreo' && !esCorreoValido(valor)) {
        mostrarEstadoCampo(campo, false, mensajeInvalido);
        return false;
    } else {
        mostrarEstadoCampo(campo, true);
        return true;
    }
};

// Validar campos al cambiar (eventos)
[tuNombre, tuCorreo, asunto, tuMensaje].forEach(campo => {
    if (!campo) return; // Por si no existe alguno

    campo.addEventListener('change', () => {
        if (campo.id === 'tuCorreo') {
            validarCampo(campo, 'El correo electrónico es obligatorio', 'Ingresa un correo electrónico válido.');
        } else if (campo.id === 'tuNombre') {
            validarCampo(campo, 'Por favor, ingresa tu nombre.');
        } else if (campo.id === 'asunto') {
            validarCampo(campo, 'Por favor, ingresa un asunto.');
        } else if (campo.id === 'tuMensaje') {
            validarCampo(campo, 'Por favor, ingresa tu mensaje.');
        }
    });
});

// Enviar formulario con validación
if (formularioContacto) {
    formularioContacto.addEventListener('submit', (event) => {
        event.preventDefault();

        const camposAValidar = [
            { elemento: tuNombre, mensajeVacio: 'Por favor, ingresa tu nombre.' },
            { elemento: tuCorreo, mensajeVacio: 'El correo electrónico es obligatorio', mensajeInvalido: 'Ingresa un correo electrónico válido.' },
            { elemento: asunto, mensajeVacio: 'Por favor, ingresa un asunto.' },
            { elemento: tuMensaje, mensajeVacio: 'Por favor, ingresa tu mensaje.' }
        ];

        let formularioEsValido = true;

        camposAValidar.forEach(campoInfo => {
            if (!validarCampo(campoInfo.elemento, campoInfo.mensajeVacio, campoInfo.mensajeInvalido)) {
                formularioEsValido = false;
            }
        });

        if (!formularioEsValido) {
            console.log('El formulario no es válido. Por favor, revisa los campos.');
            return;
        }

        // Preparar datos para enviar
        const data = {
            nombre: tuNombre.value,
            correo: tuCorreo.value,
            asunto: asunto.value,
            mensaje: tuMensaje.value
        };

        fetch('https://formspree.io/f/tuID', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                alert('Mensaje enviado correctamente.');
                formularioContacto.reset();
            } else {
                alert('Hubo un error al enviar el mensaje.');
            }
        })
        .catch(error => {
            console.error('Error en el envío:', error);
        });
    });
}

// -------------------------- //
// Iniciar todo cuando carga el DOM
document.addEventListener('DOMContentLoaded', async () => {
    await llamarAPI(API_URL);
    if (productosGlobales.length > 0) {
        dibujarDatos(productosGlobales);
        adjuntarEventosCarrito();
    }

    actualizarContadorCarrito();
    mostrarPreviewCarrito();
    cargarProductosCarrito();
});
const API_URL = 'https://fakestoreapi.com/products';
let productosGlobales = [];

// 1. Cargar productos desde la API y dibujarlos
async function llamarAPI() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al cargar productos');
    productosGlobales = await res.json();
    dibujarDatos(productosGlobales);
    adjuntarEventosCarrito();
    actualizarContadorCarrito();
    mostrarPreviewCarrito();
    cargarProductosCarrito(); // carga tabla carrito
  } catch (e) {
    console.error(e);
  }
}

// 2. Dibujar productos en el contenedor
function ProductoHTML(producto) {
  return `
    <div class="producto" data-id="${producto.id}">
      <img src="${producto.image}" alt="${producto.title}" width="100" />
      <h4>${producto.title.substring(0, 20)}...</h4>
      <p>$${producto.price.toFixed(2)}</p>
      <button class="btn-agregar" data-id="${producto.id}">Agregar al carrito</button>
    </div>
  `;
}

function dibujarDatos(productos) {
  const container = document.querySelector('.productos-container');
  container.innerHTML = productos.map(ProductoHTML).join('');
}

// 3. Añadir eventos a los botones "Agregar al carrito"
function adjuntarEventosCarrito() {
  document.querySelectorAll('.btn-agregar').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const producto = productosGlobales.find(p => p.id === id);
      if (producto) agregarProductoAlCarrito(producto);
    });
  });
}

// 4. Agregar producto al carrito (localStorage)
function agregarProductoAlCarrito(producto) {
  let carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
  const index = carrito.findIndex(item => item.id === producto.id);
  if (index > -1) {
    carrito[index].cantidad++;
  } else {
    carrito.push({...producto, cantidad: 1});
  }
  localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));
  alert(`${producto.title} agregado al carrito`);
  actualizarContadorCarrito();
  mostrarPreviewCarrito();
  cargarProductosCarrito();
}

// 5. Actualizar contador carrito
function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
  const cantidad = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  document.getElementById('contador-carrito').textContent = cantidad;
}

// 6. Mostrar preview carrito (lista simple)
function mostrarPreviewCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
  const lista = document.getElementById('lista-productos-preview');
  lista.innerHTML = '';
  carrito.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `<img src="${p.image}" alt="${p.title}"> ${p.title.substring(0, 15)}... (${p.cantidad})`;
    lista.appendChild(li);
  });
}

// 7. Cargar productos en la tabla del carrito (detallada)
function cargarProductosCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
  const tbody = document.querySelector('#tabla_carrito tbody');
  tbody.innerHTML = '';

  if (carrito.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">El carrito está vacío</td></tr>`;
    actualizarTotalCarrito(0);
    return;
  }

  let total = 0;
  carrito.forEach(producto => {
    const subtotal = producto.price * producto.cantidad;
    total += subtotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><button class="btn-eliminar" data-id="${producto.id}">X</button></td>
      <td><img src="${producto.image}" alt="${producto.title}" width="50"></td>
      <td>${producto.title.substring(0, 20)}...</td>
      <td>$${producto.price.toFixed(2)}</td>
      <td><input type="number" min="1" class="cantidad-input" data-id="${producto.id}" value="${producto.cantidad}" style="width: 50px;"></td>
      <td>$${subtotal.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });

  actualizarTotalCarrito(total);
  adjuntarEventosTabla();
}

// 8. Actualizar total carrito
function actualizarTotalCarrito(total) {
  document.getElementById('total').textContent = total.toFixed(2);
}

// 9. Adjuntar eventos a botones eliminar y inputs cantidad en la tabla
function adjuntarEventosTabla() {
  // Eliminar producto
  document.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => {
      let carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
      const id = parseInt(btn.dataset.id);
      carrito = carrito.filter(p => p.id !== id);
      localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));
      actualizarContadorCarrito();
      mostrarPreviewCarrito();
      cargarProductosCarrito();
    });
  });

  // Cambiar cantidad
  document.querySelectorAll('.cantidad-input').forEach(input => {
    input.addEventListener('change', () => {
      let carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
      const id = parseInt(input.dataset.id);
      let nuevaCantidad = parseInt(input.value);
      if (isNaN(nuevaCantidad) || nuevaCantidad < 1) {
        nuevaCantidad = 1;
        input.value = 1;
      }
      const producto = carrito.find(p => p.id === id);
      if (producto) {
        producto.cantidad = nuevaCantidad;
        localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));
        actualizarContadorCarrito();
        mostrarPreviewCarrito();
        cargarProductosCarrito();
      }
    });
  });
}

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', llamarAPI);