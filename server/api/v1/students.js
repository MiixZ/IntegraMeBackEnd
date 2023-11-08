const express = require('express');
const StudentRouter = express.Router();

const general = require('../../database/general.js');
const database = require('../../database/DB_alumnos.js');

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET_STUDENT;

// FUNCIONA CORRECTAMENTE
/**
 * @api {post} /identityCards Devuelve las tarjetas de identidad de los alumnos.
 * @apiName identityCards
 * @apiGroup Students
 * 
 * @apiSuccess {json} Tarjeta identidad de todos los alumnos.
 * @apiError {String} Error en la solicitud.
 */
StudentRouter.post('/identityCards' , async (req, res) => {
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
StudentRouter.post('/:idStudent/identityCards' , async (req, res) => {
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
                    imageUrl: "0",
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

module.exports = StudentRouter;