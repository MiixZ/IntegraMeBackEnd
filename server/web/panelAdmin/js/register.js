document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;

    if (username === '' || password === '' || confirmPassword === '') {
        alert('Todos los campos son obligatorios.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    // Aquí podrías enviar los datos al servidor o guardarlos en localstorage
    console.log('Usuario registrado con éxito:', username);
});