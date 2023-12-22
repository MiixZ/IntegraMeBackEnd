const url_avatares = 'http://34.175.9.11:6969/api/v1/admins/getAvatars/';

let options_avatares = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    }
};

// Enviamos la petición get para coger los avatares con URL:
fetch(url_avatares, options_avatares)
    .then(response => response.json())
    .then(data => {
        avatares = data.avatars;

        // Cogemos el div donde se van a mostrar los avatares
        let div_avatares = document.getElementById('avatares');
        // Le damos un display flex para que se muestren en columna.

        // Creamos un div para cada avatar
        for (let i = 0; i < avatares.length; i++) {
            let div_avatar = document.createElement('div');
            div_avatar.setAttribute('class', 'col-2');
            div_avatar.setAttribute('id', 'avatar' + i);
            div_avatar.innerHTML = "ID del avatar: " + avatares[i].id;

            // Le damos formato al texto centrándolo y dándole un tamaño de 12px. Tambien centramos el texto verticalmente.
            div_avatar.style.display = 'flex';
            div_avatar.style.alignItems = 'center';
            div_avatar.style.textAlign = 'center';
            div_avatar.style.fontSize = '12px';

            // Creamos la imagen
            let img_avatar = document.createElement('img');

            if (avatares[i].imageUrl == null) {
                img_avatar.setAttribute('src', 'http://34.175.9.11:6969/api/v1/images/' + avatares[i].id);
            } else {
                img_avatar.setAttribute('src', avatares[i].imageUrl);
            }
            img_avatar.setAttribute('class', 'img-fluid');
            img_avatar.setAttribute('onclick', 'selectAvatar(' + i + ')');

            // Le damos un tamaño de 300x300 y un margen de 10px
            img_avatar.setAttribute('width', '100');
            img_avatar.setAttribute('height', '100');
            img_avatar.style.margin = '10px';

            // Añadimos la imagen al div
            div_avatar.appendChild(img_avatar);

            // Añadimos el div al div de los avatares
            div_avatares.appendChild(div_avatar);
        }
    })
    .catch(error => console.error('Error:', error));

window.sendPostRequest = function() {
    // URL de la API a la que quieres hacer la petición POST
    const url = 'http://34.175.9.11:6969/api/v1/admins/insertStudent';
    const nombre = document.getElementById('nombre').value;
    const apellido1 = document.getElementById('apellido1').value;
    const apellido2 = document.getElementById('apellido2').value;
    const curso = document.getElementById('grado').value;
    const tutor = document.getElementById('tutor').value;

    // Los datos que quieres enviar en formato JSON
    let data = {
        name: nombre,
        lastname1: apellido1,
        lastname2: apellido2,
        grade: curso,
        tutor: tutor
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
            alert('Estudiante creado correctamente.');
        })
        .catch(error => console.error('Error:', error));
}

window.sendPerfil = function() {
    // URL de la API a la que quieres hacer la petición POST
    const url = 'http://34.175.9.11:6969/api/v1/auth/admins/registProfileStudent';
    const nombre_completo = document.getElementById('nombrecompleto').value;
    const nickname = document.getElementById('nickname').value;
    const avatar = document.getElementById('avatar').value;
    const formato = document.getElementById('formato').value;
    const password = document.getElementById('password').value;
    const Formatos_Adaptacion = document.getElementById('Formatos_Adaptacion').value;
    const interaction = document.getElementById('interaction').value;

    // Los datos que quieres enviar en formato JSON
    let data = {
        name: nombre_completo,
        nickname: nickname,
        avatarId: avatar,
        passwordFormat: formato,
        password: password,
        contentAdaptationFormats: Formatos_Adaptacion,
        interactionMethods: interaction
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
            alert('Estudiante creado correctamente.');
        })
        .catch(error => console.error('Error:', error));
}