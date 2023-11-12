const express = require('express');
const routerv1 = express.Router();

const generalFN = require('./functions/generalFunctions.js');
const studentsFN = require('./functions/studentsFunctions.js');
const teachersFN = require('./functions/teachersFunctions.js');

const AuthRouter = require('./auth/auth.js');

routerv1.get('/', (req, res) => {
    res.json({ message: 'esta es la api principal de la versión 1. na que aserle' });
});

routerv1.use('/auth', AuthRouter);

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
 * @api {post} /:idStudent/identityCard Devuelve la tarjeta de identidad del alumno.
 * @apiName identityCard
 * @apiGroup Students
 * 
 * @apiSuccess {json} Tarjeta identidad del alumno.
 * @apiError {String} No se ha encontrado el alumno.
 * @apiError {String} Error en la solicitud.
 */
routerv1.get('/students/:idStudent/identityCard', studentsFN.getIdentityCard);

// FUNCIONA CORRECTAMENTE
/**
 * @api {get} /:userID/authMethod Devuelve el método de autenticación del alumno.
 * @apiName authMethod
 * @apiGroup Students
 * 
 * @apiSuccess {json} Métodos de autenticación.
 * @apiError {String} No se ha encontrado el alumno.
 * @apiError {String} Error en la solicitud.
 */
routerv1.get('/students/:userID/authMethod', studentsFN.getAuthMethod);

// FUNCIONA CORRECTAMENTE
/**
 * @api {get} /:userID/contentProfile Devuelve el contenido del perfil del alumno.
 * @apiName ProfileContent
 * @apiGroup Students
 * 
 * @apiSuccess {json} Contenido del perfil del alumno.
 * @apiError {String} No se ha encontrado el alumno.
 * @apiError {String} Error en la solicitud.
 */
routerv1.get('/students/:userID/contentProfile', studentsFN.getProfileContent);


routerv1.get('/:idImage/image', generalFN.getImage);

routerv1.get('/teachers/get', teachersFN.getTeachers);

routerv1.post('/teachers/login/',teachersFN.login);

routerv1.get('/students/:userID/profile', studentsFN.getProfile);

module.exports = routerv1;