const general = require('../../../database/general.js');
const database = require('../../../database/DB_alumnos.js');
const { encrypt, compare, checkearToken } = require('../../../database/general.js');

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET_STUDENT;

async function getIdentityCardsAll(req, res) {
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
}

async function getIdentityCard(req, res) {
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
}

async function getAuthMethod(req, res) {
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
}

async function getProfileContent(req, res) {
    try {
        // Obtener datos del cuerpo de la solicitud.
        const userID = req.params.userID;

        // Obtener contenido del perfil del alumno.
        const arrayFormatos = [];
        const arrayIteraciones = [];
        const formatos = await database.getFormatos(userID);
        const iteraciones = await database.getInteraciones(userID);

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
}

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

        for (let i = 0; i < formatos.length; i++){
           arrayFormatos.push(formatos[i].Nom_formato);
        }

        for (let i = 0; i < iteraciones.length; i++){
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
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
}

// VERSION DE PRUEBA
async function loginStudent(req, res) {
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

        await general.insertarToken(idStudent, token, fecha);
        res.status(200).json({ token });
    } else {
        res.status(401).json({ error: 'Incorrect Credentials.' });
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
