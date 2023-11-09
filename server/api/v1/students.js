const express = require('express');
const StudentRouter = express.Router();

const general = require('../../database/general.js');
const database = require('../../database/DB_alumnos.js');

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET_STUDENT;

// FUNCIONA CORRECTAMENTE
/**
 * @api {get} /identityCards Devuelve las tarjetas de identidad de los alumnos.
 * @apiName identityCards
 * @apiGroup Students
 * 
 * @apiSuccess {json} Tarjeta identidad de todos los alumnos.
 * @apiError {String} Error en la solicitud.
 */
StudentRouter.get('/identityCards' , async (req, res) => {
    try {
        // Obtener tarjetas de identidad del alumno.
        const identityCards = await database.getIdentityCards();

        // Enviar respuesta al cliente
        /**
         * El json tendría que tener este formato:
         * Se devuelve una lista []:{"userId": 2,"nickname": "asd","avatar": {"id": id_imagen,"altDescription": "descripción textual"}
        */
        res.json(identityCards.map(identityCard => ({
            userId: identityCard.ID_alumno,
            nickname: identityCard.NickName,
            avatar: {   // Por ahora devolvemos imagen random. En el futuro, se devolverá la imagen del alumno.
                id: "0",
                altDescription: "A Bob Esponja icon."
            }
        })));
    } catch (error) {
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
});

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
StudentRouter.get('/:idStudent/identityCard' , async (req, res) => {
    try {
        // Obtener datos del cuerpo de la solicitud.
        const idStudent = req.params.idStudent;

        // Obtener tarjetas de identidad del alumno.
        const identityCard = await database.getIdentityCard(idStudent);
        if (identityCard.length >= 1) {
            // Enviar respuesta al cliente
            res.json({
                userId: identityCard[0].ID_alumno,
                nickname: identityCard[0].NickName,
                avatar: {   // Por ahora devolvemos imagen random. En el futuro, se devolverá la imagen del alumno.
                    id: "0",
                    altDescription: "A Bob Esponja icon."
                }
            });
        } else {
            res.status(404).json({ error: 'No se ha encontrado el alumno' });
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
});

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
StudentRouter.get('/:userID/authMethod' , async (req, res) => {
    try {
        // Obtener datos del cuerpo de la solicitud.
        const userID = req.params.userID;

        // Obtener método de autenticación del alumno.
        /**
         * el json a devolver debería tener este formato:
         * {
         *      "type": "TextAuth" o "ImageAuth"
         *      (si es ImageAuth) "images": [{"id": X, "altDescription": "..."}, ...] # Lista de imágenes
         *      (si es ImageAuth) "steps": X
         * }
         */

        // Aquí iría la query.
        // const authMethod = await database.getAuthMethod(userID);
        // if (authMethod.length >= 1) {
            // Estos datos deberían estar en PerfilAlumno (?)
            // Enviar respuesta al cliente. Por ahora, devolvemos un json random. En el futuro, se devolverá el método de autenticación del alumno.
            res.json({
                type: "ImageAuth", // authMethod[0].Tipo,
                images:
                [
                    {
                        id: 0,
                        altDescription: "A Bob Esponja icon."
                    },
                    {
                        id: 1,
                        altDescription: "A Patrick icon."
                    },
                    {
                        id: 2,
                        altDescription: "A Gary icon."
                    }
                ], // await database.getImages(userID),
                steps: 2 // authMethod[0].Pasos
            });
        /*
        } else {
            res.status(404).json({ error: 'No se ha encontrado el alumno.' });
        }
        */
    } catch (error) {
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
});

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
StudentRouter.get('/:userID/contentProfile' , async (req, res) => {
    try {
        // Obtener datos del cuerpo de la solicitud.
        const userID = req.params.userID;

        // Obtener contenido del perfil del alumno.
        const arrayFormatos = [];
        const arrayIteraciones = [];
        const formatos = await database.getFormatos(userID);
        const iteraciones = await database.getIteraciones(userID);

        for (let i = 0; i < formatos.length; i++){
           arrayFormatos.push(formatos[i].Nom_formato);
        }

        for (let i = 0; i < iteraciones.length; i++){
            arrayIteraciones.push(iteraciones[i].Nom_interaccion);
        }


        if (arrayIteraciones.length >= 1 && arrayFormatos.length >= 1) {
            // Enviar respuesta al cliente.
            res.json({
                contentAdaptationFormats: arrayFormatos,
                interactionMethods: arrayIteraciones
            });
        } else {
            res.status(404).json({ error: 'No se ha encontrado el alumno o no tiene información' });
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
});

StudentRouter.get('/:idImage/image', (req, res) => {
    const idImage = req.params.idImage;

    // Supongamos que el nombre de la imagen es el ID del estudiante
    const imagePath = `../../images/${idImage}.png`;

    res.sendFile(imagePath);
});

module.exports = StudentRouter;