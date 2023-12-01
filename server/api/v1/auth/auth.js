const express = require('express');
const AuthRouter = express.Router();

const general = require('../../../database/general.js');
//const upload = multer({ dest: 'uploads/' });

const studentsFN = require('../functions/studentsFunctions.js');
const adminsFN = require('../functions/adminsFunctions.js');
const teachersFN = require('../functions/teachersFunctions.js');
const generalFN = require('../functions/generalFunctions.js');

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
AuthRouter.post('/insertTeacher', adminsFN.insertTeacher);

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
AuthRouter.post('/login/admin', adminsFN.loginAdmin);

// FUNCIONA CORRECTAMENTE.
/**
 * @api {post} /registClass Registra una clase en la base de datos.
 * @apiName registClass
 * @apiGroup admin
 * 
 * @apiSuccess {String} Inserción exitosa.
 * @apiError {String} Todos los campos son obligatorios.
 * @apiError {String} Error en la solicitud.
 */
AuthRouter.post('/registClass/', adminsFN.insertClass);

// FUNCIONA CORRECTAMENTE.
/**
 * @api {post} /insertStudent Registra un alumno en la base de datos.
 * @apiName insert Student
 * @apiGroup admin
 * 
 * @apiSuccess {String} Inserción exitosa.
 * @apiError {String} Todos los campos son obligatorios.
 * @apiError {String} Error en la solicitud.
 */
AuthRouter.post('/admins/insertStudent/', adminsFN.insertStudent);


/**
 * @api {post} /updateClassTeacher Actualiza la clase del profesor.
 * @apiName updateClassTeacher
 * @apiGroup admin
 * 
 * @apiSuccess {String} Actualizacion exitosa.
 * @apiError {String} Nickname is required.
 * @apiError {String} Error en la solicitud.
 */
AuthRouter.post('/updateClassTeacher', adminsFN.updateClassTeacher);

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
AuthRouter.post('/CheckToken', generalFN.checkToken);

AuthRouter.get('/students/:userID/profile', studentsFN.getProfile);

AuthRouter.post('/teachers/:userID/RegistProfileStudent', teachersFN.registPerfilStudent);

// TODO: PROBAR ENDPOINT
AuthRouter.get('/students/:userID/tasks/cards', studentsFN.getTasksCards);

// TODO: PROBAR ENDPOINT
AuthRouter.post('/auth/students/tasks/general/:taskId/:numPaso/state', studentsFN.updateTaskState);

 /*
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
});*/

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