window.sendPostRequest = function() {
  // URL de la API a la que quieres hacer la petición POST
const url = 'http://localhost:8080/api/v1/admins/insertClass';
const number = document.getElementById('number').value;
const capacity = document.getElementById('capacity').value;

// Los datos que quieres enviar en formato JSON
let data = {
    NUMBER: number,
    CAPACITY: capacity
};

let auth = 'Bearer ' + localStorage.getItem('token');

// Opciones de la petición
let options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'authorization': auth
    },
    body: JSON.stringify(data)
};

// Envía la petición
fetch(url, options)
    .then(response => response.json())
    .then(data => {
        const dataAsString = JSON.stringify(data.result);
        let dataSinComillas = dataAsString.replace(/"/g, '');
        localStorage.setItem('token', dataSinComillas) // Llama a editToken con los datos obtenidos
        // Enviamos a la página de inicio del panel de administración
        alert('Aula creada correctamente.');
    })
    .catch(error => console.error('Error:', error));
}