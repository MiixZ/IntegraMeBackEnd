// URL de la API a la que quieres hacer la petición POST
let url = 'http://localhost:8080/api/v1/checkTokenAdmin';

// Datos que quieres enviar en formato JSON
let data = {

};

// Opciones de la petición.
const auth = 'Bearer ' + localStorage.getItem('token');

let opciones = {
    method: 'POST', // Método de la petición
    headers: {
        'content-type': 'application/json', // Tipo de contenido que se enviará
        authorization: auth // Token de autenticación
    },
    body: JSON.stringify(data), // Convertimos los datos a una cadena JSON
};

function bloquearBotones() {
    document.getElementById('registrar').style.display = 'none';
}

function desbloquearBotones() {
    document.getElementById('registrar').style.display = '';
}

// Hacemos la petición.
fetch(url, opciones)
    .then(response => {
        if (response.ok) {
            let success = document.getElementById('success-message');
            success.innerHTML = 'Está autorizado.';
            success.style.display = 'block';
            success.style.color = 'green';

            desbloquearBotones();
        } else {
            // Si no se ha podido realizar la petición, cargamos el error
            let error_message = document.getElementById('error-message');
            error_message.innerHTML = 'No está autorizado. Por favor, inicie sesión.';
            error_message.style.display = 'block';
            error_message.style.color = 'red';

            bloquearBotones();
        }
    })
