document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Aquí iría el código para autenticar al usuario con el nombre de usuario y la contraseña proporcionados.
    // Esto podría implicar enviar una solicitud a un servidor y recibir una respuesta, 
    // luego manejar esa respuesta para determinar si el inicio de sesión fue exitoso o no.

    // Por ejemplo:
    fetch('/api/authenticate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // El inicio de sesión fue exitoso. Redirigir al usuario a la página principal.
            window.location.href = '/';
        } else {
            // El inicio de sesión falló. Mostrar un mensaje de error.
            document.getElementById('error-message').textContent = 'Nombre de usuario o contraseña incorrectos.';
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
});