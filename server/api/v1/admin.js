const express = require('express');

const bodyParser = require('body-parser');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

// TODO: Hay que verificar el token en todas las funciones de inserción.

const routerAdmin = express.Router();

const database = require('../../database/DB_admins.js');
const { encrypt, compare } = require('../../database/general.js');

const jwt = require('jsonwebtoken');
const secret_admin = process.env.JWT_SECRET_ADMIN;

async function checkearToken(token) {
    database.VerificarToken(token).then(existe => {
        if (existe) {
            return new Promise((resolve, reject) => {
                jwt.verify(token, secret_admin, (error, decoded) => {
                    if (error || Date.now() > decoded.EXP) {
                        reject(error);
                    }
                    resolve(decoded);
                });
            });
        } else {
            return res.status(400).json('Token not found in the database');
        }
    }).catch(error => {
        console.error('An error has ocurred in VerificarToken call', error);
    });
}

// TODO: Probar método rehecho para que funcione con el nuevo sistema de tokens.
/**
 * @api {post} /insertTeacher Inserta un profesor en la base de datos.
 * @apiName insertTeacher
 * @apiGroup admin
 *
 * @apiSuccess {String} Inserción exitosa.
 * @apiError {String} Todos los campos son obligatorios.
 * @apiError {String} Error en la solicitud.
 * @apiError {String} Token expirado.
 */
routerAdmin.post('/insertTeacher', async (req, res) => {
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    await checkearToken(token).then(decoded => {
        // Obtener datos del cuerpo de la solicitud.
        const { nombre, apellido1, apellido2, password, nickname, aula } = req.body;

        // Verificar si todos los campos necesarios están presentes.
        if (!nombre || !apellido1 || !apellido2 || !password || !nickname) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Encriptar contraseña.
        const passwordHash = encrypt (password);

        // Insertar profesor.
        const resultado = database.InsertarProfesor(nombre, apellido1, apellido2, nickname, passwordHash);

        if (aula) {
            // Actualizar aula del profesor.
            database.ActualizarAulaProfesor(nickname, aula);
        }
        // Enviar respuesta al cliente
        res.json(resultado);
    }).catch(error => {
        console.error('Error in the request:', error);
        res.status(500).json({ error: 'Token has expired or you are not identified.' });
    });
});

// FUNCIONA CORRECTAMENTE
/**
 * @api {post} /insertStudent Inserta un alumno en la base de datos.
 * @apiName insertStudent
 * @apiGroup admin
 * 
 * @apiSuccess {String} Inserción exitosa.
 * @apiError {String} Todos los campos son obligatorios.
 * @apiError {String} Error en la solicitud.
 */
routerAdmin.post('/insertStudent', async (req, res) => {
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    await checkearToken(token).then(decoded => { 
        // Obtener datos del cuerpo de la solicitud
        const { nombre, apellido1, apellido2, curso, tutor } = req.body;
        
        // Verificar si todos los campos necesarios están presentes
        if (!nombre || !apellido1 || !apellido2 || !curso || !tutor) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Insertar alumno
        const resultado = database.InsertarAlumno(nombre, apellido1, apellido2, curso, tutor);

        // Enviar respuesta al cliente
        res.json(resultado);
    }).catch(error => {
        console.error('Error in the request:', error);
        res.status(500).json({ error: 'Error in the request' });
    });
});



routerAdmin.post('/students/:userId/authMethod', (req, res) => {
    const userId = req.params.userId;
    // Aquí puedes hacer lo que necesites con el userId, como almacenarlo en una variable o en la base de datos.
    console.log(`User ID ${userId} received`);
    res.send(`User ID ${userId} received`);
});

module.exports = routerAdmin;

// FUNCIONA CORRECTAMENTE. TODO: Cambiar lógica de los get.
/**
 * @api {post} /sessionAdmin Inicia sesión como administrador y genera su token.
 * @apiName sessionAdmin
 * @apiGroup admin
 * 
 * @apiSuccess {String} Token generado, sesión exitosa.
 * @apiError {String} Credenciales incorrectas.
 * @apiError {String} Error en la solicitud.
 */
routerAdmin.post('/sessionAdmin/', async (req, res) => {
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    await checkearToken(token).then(decoded => {
        // Obtener datos del cuerpo de la solicitud.
        const { nickname, password } = req.body;

        const hash = database.GetPassword(nickname);

        if (hash.length > 0 && compare(password, hash[0].Password_hash)) {
            const fecha = new Date(Date.now() + 24 * 60 * 60 * 1000); // Creamos una fecha de expiración del token (24 horas más al día actual)
            const token = jwt.sign({ idAdmin: adminData[0].Id_admin, nickname, EXP: fecha}, secret_admin); //{ expiresIn: '1h' });

            const resultado = database.InsertarToken(admin_data[0].Id_admin, token, fecha);
            res.status(200).json({ token });
        } else {
            res.status(401).json({ error: 'Incorrect Credentials.' });
        }
    }).catch(error => {
        console.error('Error in the request:', error);
        res.status(500).json({ error: 'Token has expired or you are not identified.' });
    });
});

// MÉTODO PARA REGISTRAR UN ADMINISTRADOR, NO FORMARÁ PARTE DE LA APLICACIÓN. FUNCIONA CORRECTAMENTE
/**
 * @api {post} /registAdmin Registra un administrador en la base de datos.
 * @apiName registAdmin
 * @apiGroup admin
 * 
 * @apiSuccess {String} Inserción exitosa.
 * @apiError {String} Todos los campos son obligatorios.
 * @apiError {String} Error en la solicitud.
 * @apiError {String} Token expirado.
 */
routerAdmin.post('/registAdmin/', async (req, res) => {
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    await checkearToken(token).then(decoded => {
        // Obtener datos del cuerpo de la solicitud
        const { DNI, NAME, APELLIDO1, APELLIDO2, PASSWORD } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!DNI || !NAME || !APELLIDO1 || !APELLIDO2 || !PASSWORD) {
            return res.status(400).json({error: 'All fields are necessary.'});
        }

        const passwordHash = encrypt (PASSWORD);

        // Insertar profesor
        const resultado = database.InsertarAdmin(DNI, NAME, APELLIDO1, APELLIDO2, passwordHash);

        // Enviar respuesta al cliente
        res.json(resultado);
    }).catch(error => {
        console.error('Error in the request:', error);
        res.status(500).json({ error: 'Token has expired or you are not identified.' });
    });
});

// FUNCIONA CORRECTAMENTE.
/**
 * @api {get} /registClass Registra una clase en la base de datos.
 * @apiName registClass
 * @apiGroup admin
 * 
 * @apiSuccess {String} Inserción exitosa.
 * @apiError {String} Todos los campos son obligatorios.
 * @apiError {String} Error en la solicitud.
 */
routerAdmin.post('/registClass/', async (req, res) => {
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    await checkearToken(token).then(decoded => {
        // Obtener datos del cuerpo de la solicitud
        const { NUMERO, CAPACIDAD } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!NUMERO || !CAPACIDAD) {
            return res.status(400).json({ error: 'All fields are necessary.' });
        }

        // Insertar profesor
        const resultado = database.InsertarAula(NUMERO, CAPACIDAD);

        // Enviar respuesta al cliente
        res.json(resultado);
    }).catch(error => {
        console.error('Error in the request:', error);
        res.status(500).json({ error: 'Token has expired or you are not identified.' });
    });
});

/**
 * @api {post} /updateClassTeacher Actualiza la clase del profesor.
 * @apiName updateClassTeacher
 * @apiGroup admin
 * 
 * @apiSuccess {String} Actualizacion exitosa.
 * @apiError {String} Nickname is required.
 * @apiError {String} Error en la solicitud.
 */
routerAdmin.post('/updateClassTeacher', async (req, res) => {
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    await checkearToken(token).then(decoded => {
        // Obtener datos del cuerpo de la solicitud
        const { Nickname, Aula } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!Nickname) {
            return res.status(400).json({ error: 'Nickname is required.' });
        }

        // Actualizar aula del profesor
        const resultado = database.ActualizarAulaProfesor(Nickname, Aula);

        // Enviar respuesta al cliente
        res.json(resultado);
    }).catch(error => {
        console.error('Error in the request:', error);
        res.status(500).json({ error: 'Token has expired or you are not identified.' });
    });
});

// TODO: Probar método. Puede que sobre.
/**
 * @api {post} /CheckToken Comprueba si el token es válido.
 * @apiName CheckToken
 * @apiGroup admin
 * 
 * @apiSuccess {String} Token correcto.
 * @apiError {String} Error en la solicitud.
 * @apiError {String} Token expirado.
 */
routerAdmin.post('/CheckToken', async (req, res) => {
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
              res.status(400).json('Token not found in the database');
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