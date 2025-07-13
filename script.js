//<TIENDA

// Script for navigation bar
const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');
const cerrar = document.getElementById('close');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active')
    })
}

if (cerrar) {
    cerrar.addEventListener('click', (e) => {
        e.preventDefault();
        nav.classList.remove('active')
    })
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductosCarrito();
});

// ----------------------------------------------------------------------- //
// Cargamos los productos que se encuentran en localStorage
function cargarProductosCarrito() {
    // Obtenemos el carrito
    const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];

    document.querySelector('#tabla_carrito').innerHTML = ''; // Limpiar el contenido existente de la tabla

    let subtotalCalculado = 0;

    if (carrito.length === 0) {
        // Mostrar mensaje si el carrito está vacío
        document.querySelector('#tabla_carrito').innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Tu carrito está vacío. Agrega productos desde la <a href="./tienda.html">tienda</a>.</td></tr>';
    } else {
        carrito.forEach(producto => {
            const filaHTML = crearFilaProducto(producto);
            document.querySelector('#tabla_carrito').innerHTML += filaHTML; // Añadir la fila al tbody
            subtotalCalculado += producto.price * producto.cantidad;
        });
    }

    // Actualizar el subtotal y el total en la sección de resumen
    actualizarTotalCarrito(subtotalCalculado);

    // Eventos a botones de eliminar o campos de cantidad 
    eventosFila();
}

// ---------------------------------------------- //
// Funciones auxiliares

function crearFilaProducto(producto) {
    const productoSubtotal = (producto.price * producto.cantidad).toFixed(2);
    const displayTitle = producto.title.substring(0, 10) + '...';
    return `
        <tr>
            <td>
                <button id="${producto.id}" class="remove-btn"><i class="far fa-times-circle"></i></button>
            </td>
            <td>
                <img src="${producto.image}" alt="${producto.title}" style="height: 80px; width: auto; object-fit: contain;">
            </td>
            <td>${displayTitle}</td>
            <td>$${producto.price.toFixed(2)}</td>
            <td>
                <input type="number" value="${producto.cantidad}" min="1" id="${producto.id}" class="cantidad-producto">
            </td>
            <td>$${productoSubtotal}</td>
        </tr>
   `
}

function actualizarTotalCarrito(subtotal) {
    document.querySelectorAll('#total').forEach(elemento => elemento.innerHTML = subtotal.toFixed(2))
}

// ------------------------------------------------- //
// Lógica para eliminar o cambiar cantidad

function eventosFila() {

    // Eventos para botones de eliminar
    //const botonesEliminar = document.querySelectorAll('.remove-btn');
    document.querySelectorAll('.remove-btn').forEach(boton => {
        boton.addEventListener('click', () => {
            // Obtenemos el carrito
            const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
            //obtenemos el id del boton
            const productId = parseInt(boton.id);
            // Encontrar el índice del producto en el carrito
            const indiceProducto = carrito.findIndex(producto => producto.id === productId);
            //console.log(indiceProducto)
            if (indiceProducto !== -1) {
                // Eliminar el producto del array
                carrito.splice(indiceProducto, 1);

                // Actualizar localStorage
                localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));

                // Recargar la vista del carrito
                cargarProductosCarrito();

                console.log(`Producto con ID ${productId} eliminado del carrito`);
            }

        });
    });


    // Eventos para cambiar cantidad

    document.querySelectorAll('.cantidad-producto').forEach(input => {
        input.addEventListener('change', () => {
            // Obtenemos el carrito
            const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
            // Obtener el input que fue modificado
            const input = document.activeElement;
            const productId = parseInt(input.id);
            const nuevaCantidad = parseInt(input.value);

            // Validar que la cantidad sea válida
            if (nuevaCantidad < 1) {
                input.value = 1;
                return;
            }

            // Encontrar el producto en el carrito
            const producto = carrito.find(item => item.id === productId);

            if (producto) {
                // Actualizar la cantidad
                producto.cantidad = nuevaCantidad;

                // Actualizar localStorage
                localStorage.setItem('carritoDeCompras', JSON.stringify(carrito));

                // Recalcular y actualizar solo los totales (sin recargar toda la tabla)
                actualizarTotales();

                console.log(`Cantidad del producto ID ${productId} actualizada a ${nuevaCantidad}`);
            }
        });
    });

}

function actualizarTotales() {
    // Obtenemos el carrito
    const carrito = JSON.parse(localStorage.getItem('carritoDeCompras')) || [];
    let subtotalCalculado = 0;

    // Recalcular subtotal
    carrito.forEach(producto => {
        subtotalCalculado += producto.price * producto.cantidad;
    });

    // Actualizar subtotales individuales en la tabla
    const filas = document.querySelectorAll('#tabla_carrito tr');
    filas.forEach(fila => {
        const input = fila.querySelector('.cantidad-producto');
        if (input) {
            const productId = parseInt(input.id);
            const producto = carrito.find(item => item.id === productId);
            if (producto) {
                const subtotalCelda = fila.cells[5]; // La celda del subtotal es la sexta (índice 5)
                const subtotalProducto = (producto.price * producto.cantidad).toFixed(2);
                subtotalCelda.textContent = `$${subtotalProducto}`;
            }
        }
    });

    // Actualizar el total general
    actualizarTotalCarrito(subtotalCalculado);
}
    

 //-------------------CONTACTO------------------//
   document.addEventListener('DOMContentLoaded', function () {
    const formularioContacto = document.getElementById('formularioContacto');
    const tuNombre = document.getElementById('tuNombre');
    const tuCorreo = document.getElementById('tuCorreo');
    const asunto = document.getElementById('asunto');
    const tuMensaje = document.getElementById('tuMensaje');

    // Función para manejar la visibilidad y el texto de error
    const mostrarEstadoCampo = (elementoInput, esValido, mensaje = '') => {
        const divPadre = elementoInput.parentNode;
        const textoError = divPadre.querySelector('.texto-error');

        if (esValido) {
            divPadre.classList.remove('error');
            textoError.innerText = '';
        } else {
            divPadre.classList.add('error');
            textoError.innerText = mensaje;
        }
    };

    // mostrarEstadoCampo(asunto,false,'mensaje a agregar')


    // Función para validar el formato de correo electrónico
    const esCorreoValido = (correo) => {
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regexCorreo.test(correo);
    };
    // console.log(esCorreoValido('miguel@miguel.com'))

    // Función para validar un campo individual
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
    // validarCampo(tuNombre, 'Por favor, ingresa tu nombre.')

    // Agrega el evento 'change' a tuCorreo
    tuCorreo.addEventListener('change', () => {
        validarCampo(tuCorreo, 'El correo electrónico es obligatorio', 'Ingresa un correo electrónico válido.');
    });

   
    // agrega el evento 'change' a todos los campos
    [tuNombre, tuCorreo, asunto, tuMensaje].forEach(campo => {
        campo.addEventListener('change', () => {
            if (campo.id === 'tuCorreo') {
                validarCampo(tuCorreo, 'El correo electrónico es obligatorio', 'Ingresa un correo electrónico válido.');
            } else if (campo.id === 'tuNombre') {
                validarCampo(tuNombre, 'Por favor, ingresa tu nombre.');
            } else if (campo.id === 'asunto') {
                validarCampo(asunto, 'Por favor, ingresa un asunto.');
            } else if (campo.id === 'tuMensaje') {
                validarCampo(tuMensaje, 'Por favor, ingresa tu mensaje.');
            }
        });

    });



    // Escuchador de evento 'submit' del formulario
    formularioContacto.addEventListener('submit', function (evento) {
        evento.preventDefault(); // Evita el envío del formulario por defecto

        // Define los campos que necesitas validar en un array
        const camposAValidar = [
            { elemento: tuNombre, mensajeVacio: 'Por favor, ingresa tu nombre.' },
            { elemento: tuCorreo, mensajeVacio: 'El correo electrónico es obligatorio', mensajeInvalido: 'Ingresa un correo electrónico válido.' },
            { elemento: asunto, mensajeVacio: 'Por favor, ingresa un asunto.' },
            { elemento: tuMensaje, mensajeVacio: 'Por favor, ingresa tu mensaje.' }
        ];

        let formularioEsValido = true; // Asumimos que es válido al principio

        // Itera sobre cada campo y ejecuta la validación
        // Si 'validarCampo' retorna false, significa que hay un error y actualizamos formularioEsValido
        camposAValidar.forEach(campoInfo => {
            // La función validarCampo se encarga de mostrar/ocultar el error.
            // Si esCampoValido es falso, significa que hubo un error en ese campo.
            const esCampoValido = validarCampo(campoInfo.elemento, campoInfo.mensajeVacio, campoInfo.mensajeInvalido);
            if (!esCampoValido) {
                formularioEsValido = false; // Marcamos el formulario como inválido si al menos un campo falla
            }
        });

        if (formularioEsValido) {
            console.log('¡Formulario enviado con éxito!');
            // Aquí puedes añadir la lógica para enviar el formulario (por ejemplo, con fetch API)
            formularioContacto.reset(); // Resetea el formulario
        } else {
            console.log('El formulario no es válido. Por favor, revisa los campos.');
        }
    });

});