const general = require('../../../database/general.js');
const database = require('../../../database/DB_alumnos.js');
const { encrypt, compare, checkearToken } = require('../../../database/general.js');

const jwt = require('jsonwebtoken');
const { format } = require('mysql2');
const secret = process.env.JWT_SECRET_STUDENT;
const secret_teacher = process.env.JWT_SECRET_TEACHER;

async function getIdentityCardsAll(req, res) {
    try {
        // Obtener tarjetas de identidad del alumno.
        const identityCards = await database.getIdentityCards();

        // Enviar respuesta al cliente
        /**
         * El json tendría que tener este formato:
         * Se devuelve una lista []:{"userId": 2,"nickname": "asd","avatar": {"id": id_imagen,"altDescription": "descripción textual"}
        */
        const response = [];
        for (let i = 0; i < identityCards.length; i++) {
            const identityCard = identityCards[i];
            const avatar = await database.getAvatar(identityCard.ID_alumno);
            response.push({
                userId: identityCard.ID_alumno,
                nickname: identityCard.NickName,
                avatar: {
                    id: avatar[0].id,
                    altDescription: avatar[0].altDescription
                }
            });
        }
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Request error' });
    }
}

async function getIdentityCard(req, res) {
    try {
        // Obtener datos del cuerpo de la solicitud.
        const idStudent = req.params.idStudent;

        // Obtener tarjetas de identidad del alumno.
        const identityCard = await database.getIdentityCard(idStudent);
        const avatar = await database.getAvatar(idStudent);
        if (identityCard.length >= 1 && avatar.length >= 1) {
            // Enviar respuesta al cliente
            res.json({
                userId: identityCard[0].ID_alumno,
                nickname: identityCard[0].NickName,
                avatar: {
                    id: avatar[0].id,
                    altDescription: avatar[0].altDescription
                }
            });
        } else {
            res.status(404).json({ error: 'Could not find student or avatar.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Request error' });
    }
}

// TODO: Probar.
async function getAuthMethod(req, res) {
    /**
     * el json a devolver debería tener este formato:
     * {
     *      "type": "TextAuth" o "ImageAuth"
     *      (si es ImageAuth) "images": [{"id": X, "altDescription": "..."}, ...] # Lista de imágenes
     *      (si es ImageAuth) "steps": X
     * }
     */

    // Obtener datos del cuerpo de la solicitud.
    const userID = req.params.userID;

    // Obtener método de autenticación del alumno.
    try {
        const [formatoPassword, ID_set] = await database.getAuthMethod(userID);
    } catch (error) {
        res.status(404).json({ error: 'Error getting AuthMethod.' });
        return;
    }


    if (formatoPassword === "TextAuth") {
        res.json({
            type: formatoPassword
        });
    } else if (formatoPassword === "ImageAuth" && ID_set) {
        try { 
            const imagesAndSteps = await database.getImagesAndSteps(ID_set);
            const steps = imagesAndSteps.steps;
            const images = imagesAndSteps.images.map(image => ({
                id: image.id,
                altDescription: image.altDescription
            }));

            res.json({
                type: formatoPassword,
                images: images,
                steps: steps
            });
        } catch (error) {
            res.status(404).json({ error: 'Error getting images and steps.' });
            return;
        }
    } else {
        res.status(404).json({ error: 'Auth is not Text or Image or authMethod' +
        ' has no set assigned.' });
    }
}

async function getProfileContent(req, res) {
    try {
        // Obtener datos del cuerpo de la solicitud.
        const userID = req.params.userID;

        // Obtener contenido del perfil del alumno.
        const formatos = await database.getFormatos(userID);
        const iteraciones = await database.getInteracciones(userID);

        if (formatos.length >= 1 && iteraciones.length >= 1) {
            // Enviar respuesta al cliente.
            res.json({
                contentAdaptationFormats: formatos,
                interactionMethods: iteraciones
            });
        } else {
            res.status(404).json({ error: 'There is not information of this student.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error on request.' });
    }
}

/*async function getProfileContent(req, res) {
    try {
        // Obtener datos del cuerpo de la solicitud.
        const userID = req.params.userID;
        is_teacher = false;

        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Token not sent' });
        }

        const token = req.headers.authorization.split(' ')[1];
        decoded_token = null;

        try {
            decoded_token = await checkearToken(token, secret_teacher);
            is_teacher = true;
            console.log("Es profesor.");
        } catch (error) {
            console.log("No es profesor.");     // TODO: Probar con token de alumno.
            decoded_token = await checkearToken(token, secret);
        }

        if (is_teacher || decoded_token.idStudent == userID) {
            // Obtener contenido del perfil del alumno.
            const formatos = await database.getFormatos(userID);
            const arrayFormatos = formatos.map(formato => formato.Nom_formato);

            const iteraciones = await database.getInteraciones(userID);
            const arrayIteraciones = iteraciones.map(iteracion => iteracion.Nom_interaccion);

            if (arrayIteraciones.length >= 1 && arrayFormatos.length >= 1) {
                // Enviar respuesta al cliente.
                res.json({
                    contentAdaptationFormats: arrayFormatos,
                    interactionMethods: arrayIteraciones
                });
            } else {
                res.status(404).json({ error: 'Could not get student or there is no information.' });
            }
        } else {
            res.status(401).json({ error: 'The user do not have permissions'});
        }
    } catch {
        res.status(500).json({ error: 'Error in the request' });
    }
}*/

/**
 *     try {
        // Obtener datos del cuerpo de la solicitud.
        const userID = req.params.userID;
        is_teacher = false;

        const token = req.headers.authorization.split(' ')[1];

        await checkearToken(token, secret)
        .then(async (decoded) => {
            // Obtener contenido del perfil del alumno.
            const formatos = await database.getFormatos(userID);
            const arrayFormatos = formatos.map(formato => formato.Nom_formato);

            const iteraciones = await database.getInteraciones(userID);
            const arrayIteraciones = iteraciones.map(iteracion => iteracion.Nom_interaccion);

            if (arrayIteraciones.length >= 1 && arrayFormatos.length >= 1) {
                // Enviar respuesta al cliente.
                res.json({
                    contentAdaptationFormats: arrayFormatos,
                    interactionMethods: arrayIteraciones
                });
            } else {
                res.status(404).json({ error: 'Could not get student or there is no information.' });
            }
        }).catch((error) => {
            res.status(401).json({ error: 'Token has expired.' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error in the request' });
    }
 */


async function getProfile(req, res) {
    try {
        // Coge el token enviado en el header de la solicitud.
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Token not sent' });
        }

        const token = req.headers.authorization.split(' ')[1];

        // Obtener datos del cuerpo de la solicitud.
        const userID = req.params.userID;

        const arrayData = await database.getData(userID);
        //const arrayProfile = await database.getProfile(userID); // para el avatar

        const arrayFormatos = [];
        const arrayIteraciones = [];
        const formatos = await database.getFormatos(userID);
        const iteraciones = await database.getInteraciones(userID);

        for (let i = 0; i < formatos.length; i++) {
           arrayFormatos.push(formatos[i].Nom_formato);
        }

        for (let i = 0; i < iteraciones.length; i++) {
            arrayIteraciones.push(iteraciones[i].Nom_interaccion);
        }

        //Verificamos token y lo decodificamos

        try {
            const decodedToken = await checkearToken(token, secret);
            if (decodedToken.idStudent != userID) {
                return res.status(401).json({ error: 'Invalid token' });
            }
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({
            type: "StudentProfile",
            contentProfile: {
                contentAdaptationFormats: arrayFormatos,
                interactionMethods: arrayIteraciones
            },
            interactionMethods: arrayIteraciones,
            name: arrayData[0].Nombre,
            surnames: arrayData[0].Apellido1 + " " + arrayData[0].Apellido2,
            nickname: arrayData[0].NickName,
            avatar: {   // Por ahora devolvemos imagen random. En el futuro, se devolverá la imagen del alumno.
                id: "1",
                altDescription: "A Bob Esponja icon."
            },
        });

    } catch (error) {
        res.status(500).json({ error: 'Request error' });
    }
}


async function loginStudent(req, res) {
    try {
        // Obtener datos del cuerpo de la solicitud.
        const { idStudent, password } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!idStudent || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const hash = await database.getPassword(idStudent);
        const studentData = await database.studentData(idStudent);

        if (hash.length > 0 && await compare(password, hash[0].Password_hash)) {
            const fecha = new Date(Date.now() + 24 * 60 * 60 * 1000); // Creamos una fecha de expiración del token (24 horas más al día actual)
            const token = jwt.sign({ idStudent, nickname: studentData[0].NickName, EXP: fecha}, secret); //{ expiresIn: '1h' });
            try {
                await general.insertarToken(idStudent, token, fecha);
                res.status(200).json({ token });
            } catch {
                reject(error);
                return;
            }
        } else {
            res.status(401).json({ error: 'Incorrect Credentials.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Request error' });
    }
}


module.exports = {
    getIdentityCardsAll,
    getIdentityCard,
    getAuthMethod,
    getProfileContent,
    getProfile,
    loginStudent
};
