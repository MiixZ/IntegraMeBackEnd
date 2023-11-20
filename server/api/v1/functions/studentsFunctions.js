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
        res.status(500).json({ error: 'Request error' });
    }
}

async function getIdentityCard(req, res) {              // A CAMBIAR AVATAR.
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
            res.status(404).json({ error: 'Could not find student' });
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

    // Estos datos deberían estar en PerfilAlumno
    // Enviar respuesta al cliente.
    try {
        // Obtener datos del cuerpo de la solicitud.
        const userID = req.params.userID;

        // Obtener método de autenticación del alumno.
        const authMethod = await database.getAuthMethod(userID);
        if (authMethod.length >= 1) {
            // Obtener todas las imágenes
            const tipo_autenticacion = authMethod[0].FormatoPassword;
            
            if (tipo_autenticacion == "TextAuth" ) {
                res.json({
                    type: authMethod[0].FormatoPassword
                });
            } else if (tipo_autenticacion == "ImageAuth" && authMethod[0].ID_set != null) {
                const images = await database.getImagesAndSteps(authMethod[0].ID_set);
                const steps = images.length > 0 ? images[0].Steps : 0;
                res.json({
                    type: authMethod[0].FormatoPassword,
                    images: images.map(image => ({
                        id: image.ID_imagen,
                        altDescription: image.Descripcion
                    })),
                    steps: steps
                });
            } else {
                res.status(404).json({ error: 'Auth is not Text or Image or authMethod' +
                ' has no set assigned.' });
            }
        } else {
            res.status(404).json({ error: 'Error getting AuthMethod.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Request error' });
    }
}

async function getProfileContent(req, res) {
    try {
        // Obtener datos del cuerpo de la solicitud.
        const userID = req.params.userID;

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
    } catch (error) {
        res.status(500).json({ error: 'Request error' });
    }
}

/*      MISMA QUE ARRIBA???
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
*/

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
    //getProfile,
    loginStudent
};
