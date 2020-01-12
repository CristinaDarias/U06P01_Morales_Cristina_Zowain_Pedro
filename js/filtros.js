import { cultura as dbCultura } from './culturaEducacion.js';

/* ------------------------------------------- FILTRO CÓDIGO POSTAL ----------------------------------------------------  */

//Referencias
let inputCodigoPostal = document.getElementById('codigoPostal');
let labelControlError = document.getElementById('controlError');
let btnFiltrar = document.getElementById('filtrar');

//Variables de alamcen
let centrosFiltroPostal = [];
let marcas = [];// Array con los datos filtrados
let marcasColocadas = new Array();

//Expresion regular de control
let cp = new RegExp('^38[0-9]{3}$');


window.onload = function inicializar() {
    doDropdown1();
    doDropdown2();
}


/** Filtra los datos por el código postal indicado.
 * @description Recoge el valor del input de CP y filtra los datos de "dbCultura" que coincidan
 * con ese valor y los añade en "marcas";
 */
function filtrarcodigoPostal() {

    marcas.length = 0; // Vaciamos el array

    let codigoPostal = inputCodigoPostal.value;

    if (cp.test(codigoPostal) != -1) {
        for (let k = 0; k < dbCultura.length; k++) {
            if (dbCultura[k]['properties']['cp'] == codigoPostal) {
                marcas.push([
                    dbCultura[k]['properties']['nombre'],
                    dbCultura[k]['geometry']['coordinates'][1], // Latitud
                    dbCultura[k]['geometry']['coordinates'][0] //Longitud
                ]);
            }
        }
    } else
        labelControlError.innerHTML = 'Codigo postal no válido (ej: 38XXX)';
}

/* ----------------------------------------- Definiendo Mapa ----------------------------------------- */
let zoom = 14;

var map = L.map('mapa');
map.setView([28.463938, -16.262598], // Posicionado por defecto en las coordenadas de santa cruz de tenerife
    zoom);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
    minZoom: 8,
    maxZoom: 18,
    id: "mapbox/streets-v11",
    accessToken: 'pk.eyJ1IjoicGVkcm80cm1hcyIsImEiOiJjazU2bnB5dXcwNHF4M2psejFuYTIwd3VwIn0.qH3Pd9mQIO3Yuwy_i_0rpQ'
}).addTo(map);

/* ------------------------------------- Colocando Marcas --------------------------------------------------- */

/** Coloca las marcas en el mapa.
 * @description Función que se encarca de comprobar si el array "marcasColocadas" contiene datos
 * va añadiendo una marca en el mapa por cada uno de ellos, utilizando su nombre, longitud y latitud.
 */
function colocarMarcas() {
    comparaFiltros();
    if (marcasColocadas.length > 0)
        eliminarMarcas();

    var nuevoIcono = new L.Icon({
        iconUrl: '../img/Icono.png',
        iconSize: [50, 50],
        iconAnchor: [25, 50]
    });

    if (marcas.length > 0) {//Si hay marcas que cumplan los filtros
        for (let i = 0; i < marcas.length; i++) {
            let marker = new L.marker([marcas[i][1], marcas[i][2]], { icon: nuevoIcono }).bindPopup(marcas[i][0]);
            marcasColocadas.push(marker);
            map.addLayer(marcasColocadas[i]);
        }
        map.setView([marcas[0][1], marcas[0][2]], // Posicionado por defecto en las coordenadas de santa cruz de tenerife
            zoom);
    } else {
        alert('Esta búsqueda, no da prorciona resultados');
    }
}

/** Elimina las marcas colocadas en el mapa.
 * @description Función que elimina las marcas colocadas en el mapa recogiendo los datos del array
 * "marcasColocadas".
 */
function eliminarMarcas() {
    for (let i = 0; i < marcasColocadas.length; i++) {
        map.removeLayer(marcasColocadas[i]);
    }
    marcasColocadas.length = 0;
}

btnFiltrar.addEventListener('click', colocarMarcas, true);

// ---------------- CHECK ------------------ //
var centrosFiltroCheck = []; // Array que rellena el filtro Check.
var checkWeb = document.getElementById("checkWeb");
var checkEmail = document.getElementById("checkEmail");

/** Filtra los Check dependiendo de su valor.
 * @Description Recoge los valores de los elementos check, y genera un array con los centros que cumplen los check marcados.
 */
function filtroCheck() {
    centrosFiltroCheck = [];

    let busca = "";

    if (checkEmail.checked == true && checkWeb.checked == true) {
        busca = "ambos";
    } else {
        if (checkEmail.checked == true) {
            busca = "email";
        } else if (checkWeb.checked == true) {
            busca = "web";
        } else {
            busca = "nada";
        }
    }

    // Comprueba "busca" y dependiendo de su valor, rellena el array "centrosFiltroCheck"
    dbCultura.forEach(element => {
        if (busca == "ambos") { // Si marcamos ambos check
            if (
                element["properties"]["web"] != null &&
                element["properties"]["email"] != null
            ) {
                centrosFiltroCheck.push([
                    element["properties"]["nombre"],
                    element["geometry"]["coordinates"][1],
                    element["geometry"]["coordinates"][0]
                ]);
            }
        } else if (busca == "email" || busca == "web") { // Si marcamos uno de los check
            if (element["properties"][busca] != null) {
                centrosFiltroCheck.push([
                    element["properties"]["nombre"],
                    element["geometry"]["coordinates"][1],
                    element["geometry"]["coordinates"][0]
                ]);
            }
        }
    });

}

// --------------- Listas Dependientes -------------------
var lista1 = document.getElementById("filtroSelect");
var lista2 = document.getElementById("filtroSelectDependiente");
var centrosFiltroDrop = []; // Array que rellena el filtro DropDown.
var listaSiglas = extraeSiglas(); // El primer dropdown
var listaDepCentros = []; // El segundo dropdown

/** Extrae las siglas de dbCultura y añade las categorías.
 * @description Extrae cada una de las siglas del json dado, independientemente de su longitud, tiene que cumplir la característica
 * de que pase la expresión regular. Además añade al final las categorías escritas manualmente.
 */
function extraeSiglas() {
    let siglas = [];
    let expresionReg = new RegExp("^[A-Z][A-Z][A-Z]*"); // Solo permite Strings que empiecen por 3 letras mayúsculas consecutivas.

    // Utiliza la expresión regular para permitir extraer los strings objetivos:
    dbCultura.forEach(element => {
        if (expresionReg.test(element["properties"]["nombre"])) {
            let txtSiglas = element["properties"]["nombre"].substring(
                0,
                element["properties"]["nombre"].indexOf(" ")
            ); // Consigue las siglas independientemente del taaño de caracteres.

            if (siglas.includes(txtSiglas)) {
                //nada
            } else if (txtSiglas != "") { // Este lo añado porque hay un caso en el que me devuelve un "".
                siglas.push(txtSiglas);
            }
        }
    });
    siglas.sort(); // Lo ordeno para que se vea mejor el dropdown.

    // --- Añado los tipos de centros también
    let centrosAdd = ["Academia", "Archivo", "Auditorio", "Biblioteca", "Casa", "Centro", "Escuela", "Espacio",
        "Guarderia", "Ludoteca", "Museo", "Parque", "Preescolar", "Sala", "Teatro", "OTROS"];

    centrosAdd.forEach(element => {
        siglas.push(element)
    }); // --- Añado OTROS para los que no tienen categoría.

    return siglas;
}

/** Crea la primera lista para el filtro.
 * @description Crea el primer dropdown recogiendo los datos del array recogido de "extraeSiglas".
 */
function doDropdown1() {
    // --------- Rellenamos el primer dropdown ------

    listaSiglas.forEach(element => {
        var option = document.createElement("option");
        option.setAttribute("value", element);
        option.appendChild(document.createTextNode(element));
        lista1.appendChild(option);
    });
}

/** Crea la segunda lista dependiente de la primera.
 * @description Esta lista permanece oculta con el atributo "hidden",
 * si en la primera lista se marca la opción "OTROS", este atributo cambia y despliega la lista de
 * elementos que no tienen categoría. "Utiliza el array de siglas".
 */
function doDropdown2() {
    // Añadimos el evento para que devuelva el valor al pinchar alguna opción y salir del foco:
    lista1.addEventListener("focusout", function () {
        inputCodigoPostal.disabled = false;
        checkEmail.disabled = false;
        checkWeb.disabled = false;
        var seleccionado = document.getElementById("filtroSelect").value;

        if (seleccionado == "OTROS") {
            lista2.removeAttribute("hidden");
            makeDependiente();
        } else {
            lista2.setAttribute("hidden", "hidden");
        }
    });

    /** Crea el segundo dropdown dependiente del primero.
     * @description Si el valor del primer dropdown es "OTROS", se ejecuta esta función
     * que crea el segundo dropdown.
     */
    function makeDependiente() {
        inputCodigoPostal.disabled = true;
        checkEmail.disabled = true;
        checkWeb.disabled = true;
        // Mientras el segundo dropdown tenga hijos, se eliminan. "Se limpia la lista".
        while (lista2.hasChildNodes()) {
            lista2.removeChild(lista2.firstChild);
        }

        dbCultura.forEach(element => {
            if (
                listaSiglas.includes(
                    element["properties"]["nombre"].substring(
                        0,
                        element["properties"]["nombre"].indexOf(" ")
                    )
                )
            ) {
            } else {
                let txtNombres = element["properties"]["nombre"];

                if (listaDepCentros.includes(txtNombres)) {
                    //nada
                } else if (txtNombres != "") {
                    listaDepCentros.push(txtNombres);
                }
            }
        });

        listaDepCentros.sort(); // Ordeno la lista.

        // Crea el elemento option con los datos para el dropdown
        listaDepCentros.forEach(element => {
            var option = document.createElement("option");
            option.setAttribute("value", element);
            option.appendChild(document.createTextNode(element));
            lista2.appendChild(option);
        });
    }
}

/** Filtra los datos recogidos de los dropdown.
 * @description Función que recoge los valores obtenidos de los dropdown y filtra los datos de "dbCultura"
 * y rellena "centrosFiltroDrop" con los datos objetivo.
 */
function filtroDropdown() {
    centrosFiltroDrop = []; // Se vacía el array.

    /* Si el segundo dropdown tiene el atributo hidden solo se centra en recoger lo que
    concidan con el valor del primer dropdown.*/
    if (lista2.getAttribute("hidden")) {

        //setNuevaClase(checkEmail,'form-control');
        //setNuevaClase(checkWeb, 'form-control');

        dbCultura.forEach(element => {
            if (
                element["properties"]["nombre"].substring(
                    0,
                    element["properties"]["nombre"].indexOf(" ")
                ) == lista1.value
            ) {
                centrosFiltroDrop.push([
                    element["properties"]["nombre"],
                    element["geometry"]["coordinates"][1],
                    element["geometry"]["coordinates"][0]
                ]);
            }
        });
    } else {

        dbCultura.forEach(element => {
            if (element["properties"]["nombre"] == lista2.value) {
                centrosFiltroDrop.push([
                    element["properties"]["nombre"],
                    element["geometry"]["coordinates"][1],
                    element["geometry"]["coordinates"][0]
                ]);
            }
        });
    }
}


/** Compara los arrays creados por los filtros, y coloca las marcas de los objetos que coincidan en todos ellos.
 * @description Recoge los arrays creados por los filtros y los compara entre sí para crear las marcas únicamente de
 * los datos que se encuentren en los 3 filtros. "Un filtro de filtros."
 */
function comparaFiltros() {
    marcas = [];
    //Ejecutamos los métodos
    filtrarcodigoPostal();
    filtroDropdown();
    filtroCheck();

    // Comprueba que los arrays devueltos por los filtros tengan información, para actuar en consecuencia:
    if (centrosFiltroCheck.length > 0) {
        for (let c = 0; c < centrosFiltroDrop.length; c++) {
            for (let j = 0; j < centrosFiltroCheck.length; j++) {
                if (centrosFiltroDrop[c][0].includes(centrosFiltroCheck[j][0]))
                    marcas.push(centrosFiltroCheck[j]);
            }
        }
    }
    if (centrosFiltroPostal.length > 0) {
        for (let p = 0; p < centrosFiltroDrop.length; p++) {
            for (let i = 0; i < centrosFiltroPostal.length; i++) {
                if (centrosFiltroDrop[p][0].includes(centrosFiltroPostal[i][0])) {
                    marcas.push(centrosFiltroPostal[i]);
                }
            }
        }
        if (centrosFiltroCheck.length > 0) {
            if (marcas.length > 0) {
                for (let h = 0; h < marcas.length; h++) {
                    for (let k = 0; k < centrosFiltroCheck.length; k++) {
                        let control = String(marcas[h][0].includes(centrosFiltroCheck[k][0]));
                        if (control == 'false') {
                            marcas.splice(k, 1);
                        } // Si hemos terminado, sale del bucle.
                        if (!marcas[h])
                            return
                    }
                }
            }
        }
    }


    if (centrosFiltroCheck.length == 0 && centrosFiltroPostal.length == 0) {
        centrosFiltroDrop.forEach(element => marcas.push(element));
    }
}