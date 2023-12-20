window.sendPostRequest = function() {
    // URL de la API a la que quieres hacer la petición POST
    const url = 'http://localhost:8080/api/v1/admins/login';
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Los datos que quieres enviar en formato JSON
    let data = {
        nickname: username,
        password: password
    };

    // Opciones de la petición
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    // Envía la petición
    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            const dataAsString = JSON.stringify(data.token);
            let dataSinComillas = dataAsString.replace(/"/g, '');
            localStorage.setItem('token', dataSinComillas) // Llama a editToken con los datos obtenidos
            // Enviamos a la página de inicio del panel de administración
            window.location.href = 'index.html';
        })
        .catch(error => console.error('Error:', error));
}