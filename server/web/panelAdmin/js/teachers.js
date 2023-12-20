window.sendPostRequest = function() {
  // URL de la API a la que quieres hacer la petición POST
  const url = 'http://34.175.9.11:6969/api/v1/admins/insertTeacher';
  const nombre = document.getElementById('nombret').value;
  const apellido1 = document.getElementById('apellido1t').value;
  const apellido2 = document.getElementById('apellido2t').value;
  const nickname = document.getElementById('nicknamet').value;
  const password = document.getElementById('password').value;
  
  // Los datos que quieres enviar en formato JSON
  let data = {
      name: nombre,
      lastname1: apellido1,
      lastname2: apellido2,
      nickname: nickname,
      password: password
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
          alert('Profesor creado correctamente.');
      })
      .catch(error => console.error('Error:', error));
  }