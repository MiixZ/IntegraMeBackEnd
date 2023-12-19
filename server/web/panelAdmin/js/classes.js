import * as main from './main.js';

const CLASSES_URL = main.BASE_IP + main.BASE_PORT + main.V_API + main.USER + '/insertClass';

export function handleSubmit(event) {
  event.preventDefault();

  var number = document.getElementsByName('number')[0].value;
  var capacity = document.getElementsByName('capacity')[0].value;

  if (number && capacity) {
    // Crear el objeto de datos a enviar
    var data = { 
      number: number, 
      capacity: capacity 
    };

    // Enviar la petición HTTP POST
    fetch('../../../api/v1/admins/insertClass', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
        // Agrega el token como Bearer en la cabecera Authorization
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      alert('Aula registrada correctamente.');
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Error al registrar el aula.');
    });
  } else {
    alert('Por favor, completa todos los campos del formulario.');
  }
}

window.handleSubmit = handleSubmit;