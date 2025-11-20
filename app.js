/********************************************
 *  CONFIGURACIONES
 ********************************************/

// Mapeo vendedor → correo automático
const mapaCorreos = {
    "ESTEFANY ZEVALLOS": "estefany_zr@hotmail.com",
    "PAUL ARELLANO": "leonardopremier94@gmail.com",
    "LEONARDO": "colchones.urbanspring@gmail.com",
    "HUAMAN": "springurban065@gmail.com",
    "OFICINA - APOYO LEONARDO": "oficina@premier.com"
};

// URL del Web App de Google Sheets
const API_URL =
"https://script.google.com/macros/s/AKfycbwsOjf92GFoSpz_8XCtPFzlClFMoM4hk6XVXFIRsQY_LoImgOlqe068i3HBdxsAjHhP/exec";


// Lista de productos agregados
let listaProductos = [];


/********************************************
 *  INICIALIZACIÓN GENERAL
 ********************************************/
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("form-pedido");
    const selectVendedor = document.getElementById("vendedor");
    const inputCorreo = document.getElementById("correo_vendedor");

    /********************************************
     * AUTOCOMPLETAR CORREO SEGÚN VENDEDOR
     ********************************************/
    selectVendedor.addEventListener("change", () => {
        const vendedor = selectVendedor.value;
        if (mapaCorreos[vendedor]) {
            inputCorreo.value = mapaCorreos[vendedor];
        }
    });


    /********************************************
     * SUBMIT → ENVIAR A GOOGLE SHEETS
     ********************************************/
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validación básica
        const camposObligatorios = [
            { id: "vendedor", nombre: "Vendedor" },
            { id: "correo_vendedor", nombre: "Correo del vendedor" },
            { id: "cliente", nombre: "Cliente" },
            { id: "telefono_cliente", nombre: "Teléfono del cliente" },
            { id: "telefono_agencia", nombre: "Teléfono de la agencia" },
            { id: "direccion", nombre: "Dirección" },
            { id: "fecha_despacho", nombre: "Fecha de despacho" }
        ];

        for (const campo of camposObligatorios) {
            const el = document.getElementById(campo.id);
            if (!el || !el.value.trim()) {
                alert(`Completa el campo: ${campo.nombre}`);
                el.focus();
                return;
            }
        }

        if (!listaProductos.length) {
            alert("Agrega al menos un producto antes de registrar el pedido.");
            return;
        }

        // Obtener tipo de pago
        const radiosPago = document.getElementsByName("tipo_pago");
        const seleccionado = Array.from(radiosPago).find(r => r.checked);
        const tipo_pago = seleccionado ? seleccionado.value : "";

        // Armar JSON de envío
        const datos = {
            vendedor: document.getElementById("vendedor").value,
            correo_vendedor: document.getElementById("correo_vendedor").value,
            cliente: document.getElementById("cliente").value,
            telefono_cliente: document.getElementById("telefono_cliente").value,
            telefono_agencia: document.getElementById("telefono_agencia").value,
            direccion: document.getElementById("direccion").value,
            direccion_lat: document.getElementById("direccion_lat").value,
            direccion_lng: document.getElementById("direccion_lng").value,
            total_aprox: document.getElementById("total_aprox").value,
            fecha_despacho: document.getElementById("fecha_despacho").value,

            tipo_pago,
            dias_pago: document.getElementById("dias_pago").value || "",
            cantidad_letras: document.getElementById("cantidad_letras").value || "",
            dias_entre_letras: document.getElementById("dias_entre_letras").value || "",

            info_adicional: document.getElementById("info_adicional").value || ""
        };

        const payload = {
            datos,
            productos: listaProductos
        };

        try {
            const resp = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await resp.json();

            if (data.status !== "ok") {
                alert("Ocurrió un error al registrar el pedido.");
                console.error(data);
                return;
            }

            // Mostrar modal éxito
            document.getElementById("modal_exito").style.display = "flex";

        } catch (err) {
            console.error(err);
            alert("Error de conexión con el servidor.");
        }
    });


    /********************************************
     * BOTÓN OK DEL MODAL
     ********************************************/
    document.getElementById("btn_modal_ok").addEventListener("click", () => {
        document.getElementById("modal_exito").style.display = "none";
        limpiarFormulario();
    });


    /********************************************
     * BLOQUEO DE AUTOFOCUS
     ********************************************/
    setTimeout(() => document.activeElement.blur(), 10);

    document.addEventListener("mousedown", (e) => {
        const esInput = ["INPUT", "TEXTAREA"].includes(e.target.tagName);
        if (!esInput) document.activeElement.blur();
    });
});


/********************************************
 *  FUNCIONES DE PRODUCTOS
 ********************************************/
function agregarProducto() {
    const prod = {
        cantidad: document.getElementById("p_cantidad").value,
        modelo: document.getElementById("p_modelo").value,
        marca: document.getElementById("p_marca").value,
        medida: document.getElementById("p_medida").value,
        color: document.getElementById("p_color").value,
        garantia: document.getElementById("p_garantia").value,
        almohada: document.getElementById("p_almohada").value,
        precio: document.getElementById("p_precio").value,
        observacion: document.getElementById("p_observacion").value
    };

    if (!prod.cantidad || !prod.modelo || !prod.marca) {
        alert("Completa al menos Cantidad, Modelo y Marca.");
        return;
    }

    listaProductos.push(prod);
    renderTablaProductos();
    actualizarTotal();
    limpiarCamposProducto();
}

function renderTablaProductos() {
    const tbody = document.querySelector("#tablaProductos tbody");
    tbody.innerHTML = "";

    listaProductos.forEach((p, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${p.cantidad}</td>
                <td>${p.modelo}</td>
                <td>${p.marca}</td>
                <td>${p.medida}</td>
                <td>${p.color}</td>
                <td>${p.garantia} años</td>
                <td>${p.almohada}</td>
                <td>S/ ${p.precio}</td>
                <td>${p.observacion || ""}</td>
                <td><button class="btn-remove" onclick="eliminarProducto(${index})">X</button></td>
            </tr>
        `;
    });
}

function eliminarProducto(i) {
    listaProductos.splice(i, 1);
    renderTablaProductos();
    actualizarTotal();
}

function limpiarCamposProducto() {
    document.getElementById("p_cantidad").value = "";
    document.getElementById("p_modelo").value = "";
    document.getElementById("p_marca").value = "";
    document.getElementById("p_medida").value = "";
    document.getElementById("p_color").value = "";
    document.getElementById("p_garantia").value = "";
    document.getElementById("p_almohada").value = "CON";
    document.getElementById("p_precio").value = "";
    document.getElementById("p_observacion").value = "";
}

function actualizarTotal() {
    let total = 0;
    listaProductos.forEach(p => {
        const precio = parseFloat(p.precio);
        if (!isNaN(precio)) total += precio * parseFloat(p.cantidad || 1);
    });
    document.getElementById("total_aprox").value = total.toFixed(2);
}


/********************************************
 *  DIRECCIONES AUTOCOMPLETE (NOMINATIM)
 ********************************************/
const inputDireccion = document.getElementById("direccion");
const box = document.getElementById("suggestions");
let timer = null;

inputDireccion?.addEventListener("input", () => {
    const query = inputDireccion.value.trim();
    if (query.length < 3) {
        box.style.display = "none";
        return;
    }

    clearTimeout(timer);
    timer = setTimeout(() => buscarDireccion(query), 400);
});

function buscarDireccion(q) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5&countrycodes=pe`, {
        headers: { "Accept-Language": "es" }
    })
    .then(res => res.json())
    .then(data => {
        box.innerHTML = "";
        if (!data.length) {
            box.style.display = "none";
            return;
        }

        box.style.display = "block";

        data.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("suggestion-item");
            div.textContent = item.display_name;

            div.addEventListener("click", () => {
                inputDireccion.value = item.display_name;
                document.getElementById("direccion_lat").value = item.lat;
                document.getElementById("direccion_lng").value = item.lon;
                box.innerHTML = "";
                box.style.display = "none";
            });

            box.appendChild(div);
        });
    });
}

// Ocultar sugerencias al hacer clic fuera
document.addEventListener("click", (e) => {
    if (!box.contains(e.target) && e.target !== inputDireccion) {
        box.style.display = "none";
    }
});


/********************************************
 * COMBOS (Marca, Medida, Color)
 ********************************************/
function toggleLista(id) {
    const lista = document.getElementById(id);
    if (lista) lista.style.display = lista.style.display === "block" ? "none" : "block";
}

function seleccionarValor(inputId, valor) {
    document.getElementById(inputId).value = valor;
    document.querySelectorAll(".combo-list").forEach(list => list.style.display = "none");
}

document.addEventListener("click", (e) => {
    if (!e.target.closest(".combo-wrapper")) {
        document.querySelectorAll(".combo-list").forEach(list => list.style.display = "none");
    }
});


/********************************************
 * CORREO "OTRO"
 ********************************************/
const radiosCorreo = document.getElementsByName("correo_sel");
const inputOtro = document.getElementById("correo_otro");
const correoFinal = document.getElementById("correo_vendedor");

radiosCorreo.forEach(r => {
    r.addEventListener("change", () => {
        if (r.value === "otro") {
            inputOtro.style.display = "block";
            correoFinal.value = "";
        } else {
            inputOtro.style.display = "none";
            inputOtro.value = "";
            correoFinal.value = r.value;
        }
    });
});

inputOtro.addEventListener("input", () => {
    correoFinal.value = inputOtro.value;
});


/********************************************
 * TIPO DE PAGO
 ********************************************/
const radiosPago = document.getElementsByName("tipo_pago");
const seccionCredito = document.getElementById("pago_credito");
const seccionLetras = document.getElementById("pago_letras");

radiosPago.forEach(r => {
    r.addEventListener("change", () => {
        if (r.value === "Contado") {
            seccionCredito.style.display = "none";
            seccionLetras.style.display = "none";
        } else if (r.value === "Crédito") {
            seccionCredito.style.display = "block";
            seccionLetras.style.display = "none";
        } else if (r.value === "Letras") {
            seccionCredito.style.display = "none";
            seccionLetras.style.display = "block";
        }
    });
});


/********************************************
 * VISTA PREVIA DE ARCHIVOS
 ********************************************/
const inputArchivos = document.getElementById("archivo_adjunto");
const preview = document.getElementById("preview_archivos");

inputArchivos.addEventListener("change", () => {
    preview.innerHTML = "";
    Array.from(inputArchivos.files).forEach(file => {
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = e => {
                const img = document.createElement("img");
                img.src = e.target.result;
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
});


/********************************************
 * FECHA DESPACHO → bloquear pasado
 ********************************************/
const fechaDespacho = document.getElementById("fecha_despacho");

function bloquearFechasPasadas() {
    const hoy = new Date().toISOString().split("T")[0];
    fechaDespacho.min = hoy;
}
bloquearFechasPasadas();


/********************************************
 * LIMPIAR TODO DESPUÉS DEL OK
 ********************************************/
function limpiarFormulario() {
    document.getElementById("form-pedido").reset();
    listaProductos = [];
    renderTablaProductos();
    document.getElementById("preview_archivos").innerHTML = "";
    document.getElementById("total_aprox").value = "0.00";
}
