const general = require('../../../database/general.js');
const { encrypt, compare, checkearToken } = require('../../../database/general.js');
const jwt = require('jsonwebtoken');
const secret_student = process.env.JWT_SECRET_STUDENT;
const secret_admin = process.env.JWT_SECRET_ADMIN;

async function checkToken(req, res) {
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
                res.status(401).json('Token not found in the database');
            }
        }).catch(error => {
            console.error('An error has ocurred in VerificarToken call', error);
        });
    } catch (error) {
        console.error('Token not sent or ' + error);
        res.status(401).json({ error: 'Error in the request' });
    }
}

async function checkTokenAdmin(req, res) {
    try {
        // Coge el token enviado en el header de la solicitud.
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Token not sent' });
        }
        // Coge el token enviado en el header de la solicitud. Si no existe, devuelve un error.
        const token = req.headers.authorization.split(' ')[1];
        const payload = jwt.verify(token, secret_admin);

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
                res.status(401).json('Token not found in the database');
            }
        }).catch(error => {
            console.error('An error has ocurred in VerificarToken call', error);
        });
    } catch (error) {
        console.error('Token not sent or ' + error);
        res.status(401).json({ error: 'Error in the request' });
    }
}


async function generateHash(req, res) {
    const { id, password } = req.body;

    // Verificar si todos los campos necesarios están presentes
    if (!id || !password) {
        return res.status(400).json({ error: 'All fields are necessary.' });
    }

    const passwordHash = await encrypt(password);

    res.json(passwordHash);
}

async function getAvatars(req, res) {
    try {
        const avatars = await general.getAvatars();
        res.json({avatars : avatars});
    } catch (error) {
        console.error('An error has ocurred in getAvatars call', error);
    }
}

module.exports = {
    checkToken,
    checkTokenAdmin,
    generateHash,
    getAvatars
};