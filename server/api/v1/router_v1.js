const express = require('express');
const routerv1 = express.Router();

const TeacherRouter = require('./teachers.js');
const AdminRouter = require('./admin.js');
const StudentRouter = require('./students.js');

const secret = process.env.JWT_SECRET;

routerv1.get('/', (req, res) => {
    res.json({ message: 'esta es la api principal de la versión 1. na que aserle' });
});

routerv1.use('/teachers', TeacherRouter);
routerv1.use('/students', StudentRouter);
routerv1.use('/admin', AdminRouter);

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
routerv1.post('/CheckToken', async (req, res) => {
    try {
        // Coge el token enviado en el header de la solicitud.
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Token not sent' });
        }
        // Coge el token enviado en el header de la solicitud. Si no existe, devuelve un error.
        const token = req.headers.authorization.split(' ')[1];
        const payload = jwt.verify(token, secret);

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

module.exports = routerv1;