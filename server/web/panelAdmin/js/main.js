// VARIABLES
const BASE_IP = 'http://34.175.9.11';
const V_API = '/api/v1';
const BASE_PORT = ':6969';
const USER = '/admins';
const PETICION_TOKEN = BASE_IP + BASE_PORT + V_API + '/CheckToken';
let TOKEN = 'none';

const data = {

}

var xhr = new XMLHttpRequest();
xhr.open("POST", PETICION_TOKEN, true);
xhr.setRequestHeader("Authorization", "Bearer " + TOKEN);

xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
        console.log(xhr.responseText);
    }
};

xhr.onload = function () {
    if (xhr.status === 200) {
      // La solicitud fue exitosa, puedes manejar la respuesta aquí
        console.log(xhr.responseText);
    } else {
      // La solicitud falló, manejar el error aquí
        console.error("Error en la solicitud. Estado:", xhr.status);
    }
};

xhr.onerror = function () {
    // Manejar errores de red o de otra índole
    console.error("Error de red al realizar la solicitud");
};

xhr.send(data);