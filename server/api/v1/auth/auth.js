const express = require('express');
const AuthRouter = express.Router();

const general = require('../../../database/general.js');
//const upload = multer({ dest: 'uploads/' });

const studentsFN = require('../functions/studentsFunctions.js');
const adminsFN = require('../functions/adminsFunctions.js');
const teachersFN = require('../functions/teachersFunctions.js');
const generalFN = require('../functions/generalFunctions.js');

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

/**
 * @api {get} /getProfile Devuelve el perfil del usuario.
 * @apiName Get Profile
 * @apiGroup students && teachers
 * 
 * @apiSuccess {String} El perfil del usuario.
 * @apiError {String} Error en la solicitud.
 * @apiError {String} Token expirado.
 */
AuthRouter.get('/students/:userID/profile', studentsFN.getProfile);

/**
 * @api {get} /registProfileStudent Registra el perfil del alumno.
 * @apiName Insert Profile
 * @apiGroup students && teachers
 * 
 * @apiSuccess {String} El perfil del alumno.
 * @apiError {String} Error en la solicitud.
 * @apiError {String} Token expirado.
 */
AuthRouter.post('/teachers/:userID/RegistProfileStudent', teachersFN.registPerfilStudent);

/**
 * @api {get} /getTaskCards Devuelve las tareas del alumno.
 * @apiName get tasks
 * @apiGroup students
 * 
 * @apiSuccess {String} Devuelve las tareas del alumno.
 * @apiError {String} Error en la solicitud.
 * @apiError {String} Token expirado.
 */
AuthRouter.get('/students/taskCards', studentsFN.getTasksCards);

/**
 * @api {post} /updateState Actualiza el estado de la tarea.
 * @apiName update state
 * @apiGroup students
 * 
 * @apiSuccess {String} Se ha completado la tarea.
 * @apiError {String} Error en la solicitud.
 * @apiError {String} Token expirado.
 */
AuthRouter.post('/students/tasks/general/:taskId/:numPaso/state', studentsFN.updateTaskState);

/**
 * @api {get} /getMaterialTaskModel Devuelve los datos principales de la tarea.
 * @apiName get MaterialTaskModel
 * @apiGroup Students
 * @apiParam {Number} taskId Identificador de la tarea.
 * 
 * @apiSuccess {String} Se devuelve la información de la tarea.
 * @apiError {String} Error en la solicitud.
 * @apiError {String} Token expirado.
 */
AuthRouter.get('/students/tasks/material/:taskId', studentsFN.getMaterialTaskModel);

/**
 * @api {get} /getMaterialRequest Devuelve una petición de material de la tarea.
 * @apiName get MaterialRequest
 * @apiGroup Students
 * @apiParam {Number} taskId Identificador de la tarea.
 * @apiParam {Number} requestId Identificador de la petición.
 * 
 * @apiSuccess {String} Se devuelve la información de la petición.
 * @apiError {String} Error en la solicitud.
 * @apiError {String} Token expirado.
 */
AuthRouter.get('/students/tasks/material/:taskId/:requestId', studentsFN.getMaterialRequest);

/**
 * @api {post} /toggleDelivered Cambia el estado de la petición de material.
 * @apiName toggle Delivered
 * @apiGroup Students
 * @apiParam {Number} taskId Identificador de la tarea.
 * @apiParam {Number} requestId Identificador de la petición.
 * 
 * @apiSuccess {String} Se cambia el estado de la petición.
 * @apiError {String} Error en la solicitud.
 * @apiError {String} Token expirado.
 */
AuthRouter.post('/students/tasks/material/:taskId/:requestId/delivered', studentsFN.toggleDelivered);

AuthRouter.get('/students/tasks/generic/:taskId', studentsFN.getGenericTaskModel);

AuthRouter.get('/students/tasks/generic/:taskId/:stepId', studentsFN.getGenericTaskStep);

AuthRouter.post('/students/tasks/generic/:taskId/addStep', studentsFN.addGenericTaskStep);

AuthRouter.post('/students/tasks/generic/:taskId/:stepId/completed', studentsFN.toggleStepCompleted);

AuthRouter.get('/students/tasks/:taskId', studentsFN.getTaskModel);

// ENDPOINTS DE MENUS
AuthRouter.get('/students/getClassrooms', studentsFN.getListClassrooms);

AuthRouter.get('/students/menuTasks/:taskId', studentsFN.getMenuTaskModel);

AuthRouter.get('/students/menuTasks/:taskId/classroom/:classroomId', studentsFN.getListMenuTasks);

AuthRouter.post('/students/menuTasks/info', studentsFN.insertMenu);  //PARA CREARLA PERO LO USA EL PROFESOR JERMU GILIPOLLAS

AuthRouter.post('/students/menuTasks/amount', studentFN.updateAmountMenu); //PARA ACTUALIZAR LA CANTIDAD DE UN MENU

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