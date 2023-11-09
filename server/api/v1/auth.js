const express = require('express');
const AuthRouter = express.Router();

const general = require('../../database/general.js');
//const upload = multer({ dest: 'uploads/' });

const jwt = require('jsonwebtoken');
const secret_student = process.env.JWT_SECRET_STUDENT;
const secret_teacher = process.env.JWT_SECRET_TEACHER;



AuthRouter.use('/studentLogin', require('./login/studentLogin.js'));

// TODO: Probar método. Puede que sobre.
/**
 * @api {post} /CheckToken Comprueba si el token es válido.
 * @apiName CheckToken
 * @apiGroup any
 * 
 * @apiSuccess {String} Token correcto.
 * @apiError {String} Error en la solicitud.
 * @apiError {String} Token expirado.
 */
AuthRouter.post('/CheckToken', async (req, res) => {
    try {
        // Coge el token enviado en el header de la solicitud.
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Token not sent' });
        }
        // Coge el token enviado en el header de la solicitud. Si no existe, devuelve un error.
        const token = req.headers.authorization.split(' ')[1];
        const payload = jwt.verify(token, secret_student);

        // Verifica si el token ha sido encryptado con el secret_admin. Si no, devuelve un error.
        general.VerificarToken(token).then(existe => {
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

AuthRouter.post('/register/studentProfile', async (req, res) => {
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    await checkearToken(token, secret_teacher).then(decoded => {
        // Obtener datos del cuerpo de la solicitud.
        const { id, avatarId, setId, format, password} = req.body;

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

/*
AuthRouter.post('/uploadPhoto', async (req, res) => {
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    await checkearToken(token, secret_teacher).then(decoded => {
        // Obtener datos del cuerpo de la solicitud.
        const { id, avatarId, setId, format, password} = req.body;

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
});*/


module.exports = AuthRouter;