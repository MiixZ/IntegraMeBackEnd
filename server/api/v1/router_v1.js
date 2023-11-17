const express = require('express');
const routerv1 = express.Router();

const generalFN = require('./functions/generalFunctions.js');
const studentsFN = require('./functions/studentsFunctions.js');
const teachersFN = require('./functions/teachersFunctions.js');
//const path = require('path'); PARA LO DE LAS IMAGENES

const AuthRouter = require('./auth/auth.js');

routerv1.get('/', (req, res) => {
    res.json({ message: 'esta es la api principal de la versión 1. na que aserle' });
});

routerv1.use('/auth', AuthRouter);



// Con esta secuencia conseguimos enviar una imagen que esté en la carpeta /images directamente con la url.
// Por ejemplo, a una imagen nuestra imagen.png se puede acceder con la url http://34.175.9.11:30000/api/v1/images/imagen.png
routerv1.use('/images', express.static('images', { extensions : ['png', 'jpg', 'jpeg', 'gif'] }));

/*
// Este método no sería necesario con el middleware anterior.
app.get('/images/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, 'images', imageName);
  
    // Verifica si el archivo existe
    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      res.status(404).send('Imagen no encontrada');
    }
  });
*/

// Middleware para servir archivos estáticos (por ejemplo, CSS, JavaScript). Por ahora no los devolvemos. (?)
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

routerv1.post('/generateHash/',generalFN.generateHash);

routerv1.post('/students/login/',studentsFN.loginStudent);

module.exports = routerv1;