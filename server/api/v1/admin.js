const express = require('express');

const bodyParser = require('body-parser');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

const routerAdmin = express.Router();

const database = require('../../database/DB_admins.js');
const { encrypt, compare } = require('../../database/general.js');

const jwt = require('jsonwebtoken');
const secret_admin = process.env.JWT_SECRET_ADMIN;

// FUNCIONA CORRECTAMENTE
routerAdmin.post('/insertTeacher', async (req, res) => {
    try {
        // Coge el token enviado en el header de la solicitud
        const token = req.headers.authorization.split(' ')[1];

        // Verifica si el token ha sido encryptado con el secret_admin
        const payload = jwt.verify(token, secret_admin);

        if (Date.now() > payload.EXP) {
            return res.status(401).json({ error: 'Token expired' });
        }

        // Obtener datos del cuerpo de la solicitud
        const { nombre, apellido1, apellido2, password, nickname, aula } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!nombre || !apellido1 || !apellido2 || !password || !nickname) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Encryptar contraseña
        const passwordHash = await encrypt (password);

        // Insertar profesor
        const resultado = await database.InsertarProfesor(nombre, apellido1, apellido2, nickname, passwordHash);

        if (aula) {
            // Actualizar aula del profesor
            await database.ActualizarAulaProfesor(nickname, aula);
        }
        // Enviar respuesta al cliente
        res.json(resultado);
    } catch (error) {
        console.error('Error in the request:', error);
        res.status(500).json({ error: 'Error in the request' });
    }
});

// FUNCIONA CORRECTAMENTE
routerAdmin.post('/insertStudent', async (req, res) => {
    try {
        // Coge el token enviado en el header de la solicitud
        const token = req.headers.authorization.split(' ')[1];
        // Verifica si el token ha sido encryptado con el secret_admin
        const payload = jwt.verify(token, secret_admin);

        // Obtener datos del cuerpo de la solicitud
        const { nombre, apellido1, apellido2, nickname, tutor } = req.body;
        
        // Verificar si todos los campos necesarios están presentes
        if (!nombre || !apellido1 || !apellido2 || !nickname || !tutor) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // Insertar alumno
        const resultado = await database.InsertarAlumno(nombre, apellido1, apellido2, curso, tutor);

        // Enviar respuesta al cliente
        res.json(resultado);

    } catch (error) {
        console.error('Error in the request:', error);
        res.status(500).json({ error: 'Error in the request' });
    }
});

// FUNCIONA CORRECTAMENTE
routerAdmin.post('/sessionAdmin/', async (req, res) => {
    try {
        // Obtener datos del cuerpo de la solicitud
        const { nickname, password } = req.body;

        const hash = await database.GetPassword(nickname);
        const admin_data = await database.DatosAdmin(nickname);

        if (await compare(PASSWORD, hash[0].Password_hash)) {
            const fecha = new Date(Date.now() + 24 * 60 * 60 * 1000); // Creamos una fecha de expiración del token (24 horas más al día actual)
            const token = jwt.sign({ idAdmin: adminData[0].Id_admin, nickname, EXP: fecha}, secret_admin); //{ expiresIn: '1h' });
            
            const resultado = await database.InsertarToken(admin_data[0].Id_admin, token, fecha);
            res.status(200).json({ token });
        } else {
            res.status(401).json({ error: 'Incorrect Credentials.' });
        }
    } catch(error) {
        console.error('Error in the request:', error);
        res.status(500).json({ error: 'Error in the request.' });
    }
});

// MÉTODO PARA REGISTRAR UN ADMINISTRADOR, NO FORMARÁ PARTE DE LA APLICACIÓN. FUNCIONA CORRECTAMENTE
routerAdmin.post('/registAdmin/', async (req, res) => {
    try {
        // Obtener datos del cuerpo de la solicitud
        const { DNI, NAME, APELLIDO1, APELLIDO2, PASSWORD } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!DNI || !NAME || !APELLIDO1 || !APELLIDO2 || !PASSWORD) {
            return res.status(400).json({error: 'All fields are necessary.'});
        }

        const passwordHash = await encrypt (PASSWORD);

        // Insertar profesor
        const resultado = await database.InsertarAdmin(DNI, NAME, APELLIDO1, APELLIDO2, passwordHash);

        // Enviar respuesta al cliente
        res.json(resultado);
    } catch (error) {
        console.error('Error in the request:', error);
        res.status(500).json({ error: 'Error in the request' });
    }
});

// METODO PARA REGISTRAR UN ADMINISTRADOR, NO FORMARÁ PARTE DE LA APLICACIÓN. FUNCIONA CORRECTAMENTE
routerAdmin.post('/registClass/', async (req, res) => {
    try {
        // Obtener datos del cuerpo de la solicitud
        const { NUMERO, CAPACIDAD } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!NUMERO || !CAPACIDAD) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        
        // Insertar profesor
        const resultado = await database.InsertarAula(NUMERO, CAPACIDAD);

        // Enviar respuesta al cliente
        res.json(resultado);
    } catch (error) {
        console.error('Error in the request:', error);
        res.status(500).json({ error: 'Error in the request' });
    }
});

routerAdmin.put('/updateClassTeacher', async (req, res) => {
    try {
        const { id } = req.params;
        const { Nickname } = req.body;

        if (!Nickname) {
            return res.status(400).json({ error: 'Nickname is ' });
        }

        const resultado = await database.ActualizarAulaProfesor(id, DNI_PROFESOR);

        res.json(resultado);
    } catch (error) {
        console.error('Error in the request:', error);
        res.status(500).json({ error: 'Error in the request' });
    }
});

// TODO: Probar método. 
routerAdmin.put('/CheckToken', async (req, res) => {
    try {
        // Coge el token enviado en el header de la solicitud. Si no existe, devuelve un error.
        const token = req.headers.authorization.split(' ')[1];
        const payload = jwt.verify(token, secret_admin);

        // Verifica si el token ha sido encryptado con el secret_admin. Si no, devuelve un error.
        database.VerificarToken(token).then(existe => {
            if (existe) {
                if (Date.now() > payload.EXP) {
                    cleanUpTokens();
                    return res.json({   validation: false,
                                        message: 'Token expired' });
                } else {
                    return res.json({   validation: true,
                                        message: 'Token correct' });
                }
            } else {
              console.log('Token not found in the database');
            }
          }).catch(error => {
            console.error('An error has ocurred in VerificarToken call', error);
        });
    } catch (error) {
        console.error('Token not sent or', error);
        res.status(500).json({ error: 'Error in the request' });
    }
});

module.exports = routerAdmin;