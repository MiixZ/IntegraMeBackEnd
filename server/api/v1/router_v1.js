const express = require('express');
const routerv1 = express.Router();

const generalFN = require('./functions/generalFunctions.js');
const studentsFN = require('./functions/studentsFunctions.js');
const teachersFN = require('./functions/teachersFunctions.js');
const adminFN = require('./functions/adminsFunctions.js');

const imageExtensions = ['png', 'jpg', 'jpeg', 'gif'];
//const path = require('path'); PARA LO DE LAS IMAGENES

const AuthRouter = require('./auth/auth.js');

// ------------------------- FUNCIONES GENERALES -----------------------------------------------

routerv1.get('/', (req, res) => {
    res.json({ message: 'esta es la api principal de la versión 1. na que aserle' });
});

routerv1.use('/auth', AuthRouter);

// Con esta secuencia conseguimos enviar una imagen que esté en la carpeta /images directamente con la url.
// Por ejemplo, a una imagen nuestra imagen.png se puede acceder con la url http://35.210.189.6:6969/api/v1/images/<idImagen>
routerv1.use('/images', express.static('images', { extensions : imageExtensions }));

// Middleware para servir archivos estáticos (por ejemplo, CSS, JavaScript). Por ahora no los devolvemos, tiene que ver con la web.
// app.use('/static', express.static('public'));

// ENDPOINTS NO AUTH
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
routerv1.post('/CheckToken', generalFN.checkToken);

// ------------------------- FUNCIONES DE ALUMNOS -------------------------------------

// FUNCIONA CORRECTAMENTE
/**
 * @api {get} /identityCards Devuelve las tarjetas de identidad de los alumnos.
 * @apiName identityCards
 * @apiGroup Students
 * 
 * @apiSuccess {json} Tarjeta identidad de todos los alumnos.
 * @apiError {String} Error en la solicitud.
 */
routerv1.get('/students/identityCards', studentsFN.getIdentityCardsAll);

// FUNCIONA CORRECTAMENTE
/**
 * @api {post} /:userID/identityCard Devuelve la tarjeta de identidad del alumno.
 * @apiName identityCard
 * @apiGroup Students
 * 
 * @apiParam {Number} userID Identificador del alumno.
 * 
 * @apiSuccess {json} Tarjeta identidad del alumno.
 * @apiError {String} No se ha encontrado el alumno.
 * @apiError {String} Error en la solicitud.
 */
routerv1.get('/students/:userID/identityCard', studentsFN.getIdentityCard);

// FUNCIONA CORRECTAMENTE
/**
 * @api {get} /:userID/authMethod Devuelve el método de autenticación del alumno.   A PROBAR
 * @apiName authMethod
 * @apiGroup Students
 * 
 * @apiParam {Number} userID Identificador del alumno.
 * 
 * @apiSuccess {json} Métodos de autenticación.
 * @apiError {String} No se ha encontrado el alumno.
 * @apiError {String} Error en la solicitud.
 */
routerv1.get('/students/:userID/authMethod', studentsFN.getAuthMethod);

// FUNCIONA CORRECTAMENTE
/**
 * @api {get} /:userID/contentProfile Devuelve el contenido del perfil del alumno.      A PROBAR
 * @apiName ProfileContent
 * @apiGroup Students
 * 
 * @apiParam {Number} userID Identificador del alumno.
 * 
 * @apiSuccess {json} Contenido del perfil del alumno.
 * @apiError {String} No se ha encontrado el alumno.
 * @apiError {String} Error en la solicitud.
 */
routerv1.get('/students/:userID/contentProfile', studentsFN.getProfileContent);

/**
 * @api {post} /students/signIn Logea al alumno.            A PROBAR
 * @apiName Inicio Sesión Alumno
 * @apiGroup Students
 * 
 * @apiSuccess {json} Token de inicio de sesión del alumno.
 * @apiError {String} No se ha encontrado el alumno.
 * @apiError {String} Error en la solicitud.
 */
routerv1.post('/students/login/', studentsFN.loginStudent);

// ------------------------- FUNCIONES DE PROFESORES -------------------------------------

/** 
 * @api {get} /teachers/get Devuelve un array con los profesores.       A PROBAR
 * @apiName GetTeachers
 * @apiGroup Teachers
 * 
 * @apiSuccess {json} Contenido con la lista de profesores.
 * @apiError {String} No se ha podido obtener los profesores.
 * @apiError {String} Error en la solicitud.
 */
routerv1.get('/teachers/get', teachersFN.getTeachers);

/**
 * @api {post} /teachers/signIn Logea al profesor.      A PROBAR
 * @apiName Inicio Sesión Profesor
 * @apiGroup Teachers
 * 
 * @apiSuccess {json} Token de inicio de sesión del profesor.
 * @apiError {String} No se ha encontrado el profesor.
 * @apiError {String} Error en la solicitud.
 */
routerv1.post('/teachers/signin/', teachersFN.login);

/** 
 *  Hace falta??
 */
routerv1.post('/generateHash/', generalFN.generateHash);


// ------------------------- FUNCIONES DE ADMIN -------------------------------------
routerv1.post('/admins/regist/', adminFN.registAdmin);
routerv1.post('/admins/login/', adminFN.loginAdmin);
routerv1.post('/admins/insertStudent/', adminFN.insertStudent);
routerv1.post('/admins/insertClass/', adminFN.insertClass);
routerv1.post('/admins/insertTeacher/', adminFN.insertTeacher);

module.exports = routerv1;