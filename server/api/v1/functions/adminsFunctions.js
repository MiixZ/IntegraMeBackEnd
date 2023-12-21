const bodyParser = require('body-parser');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

// TODO: Hay que verificar el token en todas las funciones de inserción.

const database = require('../../../database/DB_admins.js');
const general = require('../../../database/general.js');
const database_students = require('../../../database/DB_alumnos.js');
const { encrypt, compare, checkearToken } = require('../../../database/general.js');

const jwt = require('jsonwebtoken');
const secret_admin = process.env.JWT_SECRET_ADMIN;

async function insertTeacher(req, res) {
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    try {
        await checkearToken(token, secret_admin);
    } catch (error) {
        return res.status(500).json({ error: 'Token has expired or you are not identified.' });
    }

    // Obtener datos del cuerpo de la solicitud.
    const { name, lastname1, lastname2, password, nickname, aula } = req.body;

    // Verificar si todos los campos necesarios están presentes.
    if (!name || !lastname1 || !lastname2 || !password || !nickname) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    let passwordHash = "";
    try {
        passwordHash = await encrypt(password);
    } catch (error) {
        return res.status(500).json({ error: 'Error encrypting password.' });
    }

    // Insertar profesor.
    let resultado = "";
    try {
        resultado = await database.InsertarProfesor(name, lastname1, lastname2, nickname, passwordHash);
    } catch (error) {
        return res.status(500).json({ error: 'Error inserting teacher.' + error });
    }

    if (aula) {
        // Actualizar aula del profesor.
        try {
            await database.ActualizarAulaProfesor(nickname, aula);
        } catch (error) {
            return res.status(500).json({ error: 'Error updating teacher classroom.' + error });
        }
    }

    // Enviar respuesta al cliente
    res.json({result : resultado});
}

async function insertClass(req, res) {
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];
    try {
        await checkearToken(token, secret_admin);
    } catch (error) {
        return res.status(500).json({ error: 'Error checking token.' + " " + error });
    }

    // Obtener datos del cuerpo de la solicitud
    const { NUMBER, CAPACITY } = req.body;
    // Verificar si todos los campos necesarios están presentes
    if (!NUMBER || !CAPACITY) {
        return res.status(400).json({ error: 'All fields are necessary.' });
    }

    // Insertar profesor
    let resultado = "";
    try {
        resultado = await database.InsertarAula(NUMBER, CAPACITY);
    } catch (error) {
        return res.status(500).json({ error: 'Error inserting class.', error });
    }

    // Enviar respuesta al cliente
    res.json({ result: resultado });
}

async function insertStudent(req, res) {
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    try {
        await checkearToken(token, secret_admin);
    } catch (error) {
        return res.status(500).json({ error: 'Error checking token.' + " " + error });
    }

    // Obtener datos del cuerpo de la solicitud
    const { name, lastname1, lastname2, grade, tutor } = req.body;

    // Verificar si todos los campos necesarios están presentes
    if (!name || !lastname1 || !lastname2 || !grade) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    let resultado = "";

    // Insertar alumno
    try {
        resultado = await database.InsertarAlumno(name, lastname1, lastname2, grade, tutor);
    } catch (error) {
        return res.status(500).json({ error: 'Error inserting student.' + error });
    }

    // Enviar respuesta al cliente
    res.json({result : resultado});
}

async function loginAdmin(req, res) {
    // Obtener datos del cuerpo de la solicitud.
    const { nickname, password } = req.body;

    // Verificar si todos los campos necesarios están presentes
    if (!nickname || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    let hash = "";
    let adminData = "";

    try {
        hash = await database.GetPassword(nickname);
        adminData = await database.AdminData(nickname);
    } catch (error) {
        return res.status(500).json({ error: 'Error getting password or admin data.', error });
    }

    let comparacion = "";

    try {
        comparacion = await compare(password, hash);
    } catch (error) {
        return res.status(500).json({ error: 'Error comparing passwords.' });
    }

    if (comparacion) {
        const fecha = new Date(Date.now() + 24 * 60 * 60 * 1000); // Creamos una fecha de expiración del token (24 horas más al día actual)
        const token = jwt.sign({ idAdmin: adminData.Id_admin, nickname, EXP: fecha}, secret_admin); //{ expiresIn: '1h' });

        try {
            await general.insertarToken(adminData.Id_admin, token, fecha);
        } catch (error) {
            return res.status(500).json({ error: 'Error saving token', error });
        }

        res.status(200).json({ token });
    } else {
        return res.status(401).json({ error: 'Incorrect Credentials.' });
    }
}

async function registAdmin(req, res) {
    // Obtener datos del cuerpo de la solicitud
    const { name, lastname1, lastname2, nickname, password } = req.body;

    // Verificar si todos los campos necesarios están presentes
    if (!name || !lastname1 || !lastname2 || !password || !nickname) {
        return res.status(400).json({ error: 'All fields are necessary.' });
    }

    let passwordHash = "";

    try {
        passwordHash = await encrypt(password);
    } catch (error) {
        return res.status(500).json({ error: 'Error encrypting password.' });
    }

    // Insertar administrador.
    let resultado = "";
    try {
        resultado = await database.InsertarAdmin(name, lastname1, lastname2, nickname, passwordHash);
    } catch (error) {
        return res.status(500).json({ error: 'Error inserting admin.', error });
    }

    // Enviar respuesta al cliente.
    res.json({ result: resultado });
}

async function updateClassTeacher(req, res) {
    try {
        // Coge el token enviado en el header de la solicitud.
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Token not sent' });
        }

        const token = req.headers.authorization.split(' ')[1];

        await checkearToken(token, secret_admin);

        // Obtener datos del cuerpo de la solicitud
        const { nickname, aula } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!nickname) {
            return res.status(400).json({ error: 'Nickname is required.' });
        }

        // Actualizar aula del profesor
        const resultado = database.ActualizarAulaProfesor(nickname, aula);

        // Enviar respuesta al cliente
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Token has expired or you are not identified.' });
    }
}

async function registPerfilStudent(req, res) {  // SE HA PROBADO SIN IDSET, FALTA PROBAR CON IDSET
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    // Cogemos el id del estudiante del primer parámetro de la ruta.
    console.log("hola")
    try {
        token_decoded = await checkearToken(token, secret_admin); 
    } catch (error) {
        return res.status(500).json({ error: 'Token has expired or you are not identified.' });
    }

    const { name, nickname, avatarId, idSet = null, passwordFormat, password, contentAdaptationFormats, interactionMethods} = req.body;

    if (!name || !nickname || !avatarId || !passwordFormat || !password
        || !contentAdaptationFormats || !interactionMethods) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    lastname1 = name.split(' ')[1];
    lastname2 = name.split(' ')[2];

    console.log("apellido 1" + lastname1);
    console.log("apellido 2" + lastname2);

    idStudent = 0;

    try {
        console.log("buscando id")
        idStudent = await database_students.getIdStudentByLastnames(lastname1, lastname2);
        // Comprobar que el id del estudiante existe en la base de datos.
        console.log("idStudent " + idStudent)
    } catch (error) {
        return res.status(500).json({ error: 'Error while checking student.' });
    }

    if (idSet) {
        try {
            // Comprobar que el id del setImagenes existe en la base de datos.
            const setImages = await general.getSetImages(idSet);

            if (setImages.length === 0) {
                return res.status(400).json({ error: 'Set with that id does not exist.' });
            }
        } catch (error) {
            return res.status(500).json({ error: 'Error while checking setImages.' });
        }
    }

    // Si la autenticacion es por imagen hace falta el idSet.
    if (passwordFormat == 'ImageAuth' && !idSet) {
        return res.status(400).json({ error: 'SetId is required with Image Login.' });
    }

    try {
        const passwordHash = await encrypt(password);
        await database.registPerfilStudent(idStudent, nickname, avatarId, idSet, passwordFormat, passwordHash);
        await database.registContentProfile(idStudent, contentAdaptationFormats, interactionMethods);

        res.status(200).json({ result: result });
    } catch (error) {
        return res.status(500).json({ error: 'Could not regist student profile.' });
    }
}

module.exports = {
    insertTeacher,
    insertStudent,
    registPerfilStudent,
    loginAdmin,
    insertClass,
    updateClassTeacher,
    registAdmin
};