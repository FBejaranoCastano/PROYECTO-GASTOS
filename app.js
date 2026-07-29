// 1. ELEMENTOS DE LA INTERFAZ
const formularioGastos = document.getElementById('formulario-gastos');
const inputDescripcion = document.getElementById('input-descripcion');
const inputMonto = document.getElementById('input-monto');
const selectCategoria = document.getElementById('select-categoria');
const botonEnviar = document.getElementById('boton-enviar'); // <-- Nuevo selector

const contenedorTotalHoy = document.getElementById('total-hoy');
const contenedorTotalMes = document.getElementById('total-mes');
const contenedorTotalesCategoria = document.getElementById('totales-categoria');
const contenedorListaGastos = document.getElementById('lista-gastos');

// Validamos si hay datos guardados en el localStorage
let listaDeGastos = JSON.parse(localStorage.getItem('misGastos')) || [];

// Funcion para Validadr el Formulario
function validarFormulario() {
    const descripcion = inputDescripcion.value.trim();
    const textoMonto = inputMonto.value;
    const numeroMonto = parseFloat(textoMonto);
    const categoria = selectCategoria.value;

    // Evaluar las condiciones:
    // 1. Descripción no vacía
    // 2. Categoría seleccionada (no vacía)
    // 3. El monto no debe estar vacío, debe ser un número válido y estrictamente mayor que 0
    const descripcionValida = descripcion !== "";
    const categoriaValida = categoria !== "";
    const montoValido = textoMonto !== "" && !isNaN(numeroMonto) && numeroMonto > 0;

    // Si las tres condiciones se cumplen, habilitamos el botón; si no, se bloquea
    if (descripcionValida && categoriaValida && montoValido) {
        botonEnviar.disabled = false;
    } else {
        botonEnviar.disabled = true;
    }
}


// 'input' detecta cada letra o número borrado o escrito; 'change' detecta cambios en el select
inputDescripcion.addEventListener('input', validarFormulario);
inputMonto.addEventListener('input', validarFormulario);
selectCategoria.addEventListener('change', validarFormulario);

// Esta funcion sincroniza la aplicación con el LocalStorage
function actualizarAplicacion() {
    localStorage.setItem('misGastos', JSON.stringify(listaDeGastos));
    mostrarTotalesHoyYMes();
    mostrarTotalesPorCategoria();
    mostrarListaIndividualDeGastos();
}

// Esta funcion calcula el total del día y mes
function mostrarTotalesHoyYMes() {
    const fechaActual = new Date();
    const fechaHoyTexto = fechaActual.toDateString();
    const mesActual = fechaActual.getMonth();
    const anioActual = fechaActual.getFullYear();

    let totalDeHoy = 0;
    let totalDelMes = 0;

    listaDeGastos.forEach(gasto => {
        const fechaGasto = new Date(gasto.fecha);

        if (fechaGasto.toDateString() === fechaHoyTexto) {
            totalDeHoy += gasto.monto;
        }

        if (fechaGasto.getMonth() === mesActual && fechaGasto.getFullYear() === anioActual) {
            totalDelMes += gasto.monto;
        }
    });

    contenedorTotalHoy.innerHTML = `<span class="monto-destacado">$${totalDeHoy.toLocaleString()}</span>`;
    contenedorTotalMes.innerHTML = `<span class="monto-destacado">$${totalDelMes.toLocaleString()}</span>`;
}

// Esta funcion calcula el total por categoria
function mostrarTotalesPorCategoria() {
    const categorias = {
        comida: 0,
        transporte: 0,
        entretenimiento: 0,
        servicios: 0,
        otros: 0
    };

    listaDeGastos.forEach(gasto => {
        if (categorias.hasOwnProperty(gasto.categoria)) {
            categorias[gasto.categoria] += gasto.monto;
        }
    });

    contenedorTotalesCategoria.innerHTML = '';

    Object.keys(categorias).forEach(nombreCategoria => {
        const filaCategoria = document.createElement('div');
        filaCategoria.className = 'item-categoria-total';
        filaCategoria.style.display = 'flex';
        filaCategoria.style.justifyContent = 'space-between';
        filaCategoria.style.padding = '0.4rem 0';

        filaCategoria.innerHTML = `
            <span class="nombre-cat" style="text-transform: capitalize;">${nombreCategoria}:</span>
            <span class="monto-cat" style="font-weight: bold;">$${categorias[nombreCategoria].toLocaleString()}</span>
        `;
        contenedorTotalesCategoria.appendChild(filaCategoria);
    });
}

// Esta funcion muestra los gastos individuales
function mostrarListaIndividualDeGastos() {
    contenedorListaGastos.innerHTML = '';

    if (listaDeGastos.length === 0) {
        contenedorListaGastos.innerHTML = '<p style="color: #6c757d; font-style: italic;">No has registrado ningún gasto todavía.</p>';
        return;
    }

    const listaInvertida = [...listaDeGastos].reverse();

    listaInvertida.forEach(gasto => {
        const tarjetaGasto = document.createElement('article');
        tarjetaGasto.className = 'tarjeta-gasto-item';
        tarjetaGasto.style.display = 'flex';
        tarjetaGasto.style.justifyContent = 'space-between';
        tarjetaGasto.style.alignItems = 'center';
        tarjetaGasto.style.padding = '0.8rem';
        tarjetaGasto.style.borderBottom = '1px solid #dee2e6';

        tarjetaGasto.innerHTML = `
            <div class="informacion-gasto">
                <h4 style="margin: 0; font-size: 1rem;">${gasto.descripcion}</h4>
                <small style="color: #6c757d; text-transform: capitalize;">${gasto.categoria} • ${new Date(gasto.fecha).toLocaleDateString()}</small>
            </div>
            <div class="acciones-gasto" style="display: flex; align-items: center; gap: 1rem;">
                <span style="font-weight: bold; color: #dc3545;">-$${gasto.monto.toLocaleString()}</span>
                <button class="boton-eliminar" data-id="${gasto.id}" style="background: #dc3545; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer;">
                    Eliminar
                </button>
            </div>
        `;
        contenedorListaGastos.appendChild(tarjetaGasto);
    });
}

// Esta funcion captura todo el formualrio al agrgar un gasto
formularioGastos.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const nuevoGasto = {
        id: Date.now(),
        descripcion: inputDescripcion.value.trim(),
        monto: parseFloat(inputMonto.value),
        categoria: selectCategoria.value,
        fecha: new Date().toISOString()
    };

    listaDeGastos.push(nuevoGasto);
    actualizarAplicacion();

    formularioGastos.reset();
    validarFormulario(); // <-- Deshabilita el botón inmediatamente tras limpiar los campos
});

// Eliminar un gasto especifico
contenedorListaGastos.addEventListener('click', (evento) => {
    if (evento.target.classList.contains('boton-eliminar')) {
        const idParaEliminar = parseInt(evento.target.getAttribute('data-id'));
        listaDeGastos = listaDeGastos.filter(gasto => gasto.id !== idParaEliminar);
        actualizarAplicacion();
    }
});

// Inicio automatico de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    actualizarAplicacion();
    validarFormulario(); // <-- Asegura que el botón inicie bloqueado si la página se refresca
});