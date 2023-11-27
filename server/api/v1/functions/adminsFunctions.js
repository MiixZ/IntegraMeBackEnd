const bodyParser = require('body-parser');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

// TODO: Hay que verificar el token en todas las funciones de inserción.

const database = require('../../../database/DB_admins.js');
const general = require('../../../database/general.js');
const { encrypt, compare, checkearToken } = require('../../../database/general.js');

const jwt = require('jsonwebtoken');
const secret_admin = process.env.JWT_SECRET_ADMIN;

async function insertTeacher(req, res) {
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    await checkearToken(token, secret_admin)
        .then(async (decoded) => {
            // Obtener datos del cuerpo de la solicitud.
            const { name, lastname1, lastname2, password, nickname, aula } = req.body;

            // Verificar si todos los campos necesarios están presentes.
            if (!name || !lastname1 || !lastname2 || !password || !nickname) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Encriptar contraseña.
            const passwordHash = await encrypt(password);

            // Insertar profesor.
            const resultado = await database.InsertarProfesor(name, lastname1, lastname2, nickname, passwordHash);

            if (aula) {
                // Actualizar aula del profesor.
                await database.ActualizarAulaProfesor(nickname, aula);
            }
            // Enviar respuesta al cliente
            res.json(resultado);
        })
        .catch((error) => {
            res.status(500).json({ error: 'Token has expired or you are not identified.' });
        });
}

async function insertStudent(req, res) {
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    await checkearToken(token, secret_admin)
        .then(async (decoded) => {
            // Obtener datos del cuerpo de la solicitud
            const { name, lastname1, lastname2, grade, tutor } = req.body;

            // Verificar si todos los campos necesarios están presentes
            if (!name || !lastname1 || !lastname2 || !grade) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Insertar alumno
            const resultado = await database.InsertarAlumno(name, lastname1, lastname2, grade, tutor);

            // Enviar respuesta al cliente
            res.json(resultado);
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error in the request' });
        });
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

    console.log ("token checked");

    // Obtener datos del cuerpo de la solicitud
    const { NUMBER, CAPACITY } = req.body;

    // Verificar si todos los campos necesarios están presentes
    if (!NUMBER || !CAPACITY) {
        return res.status(400).json({ error: 'All fields are necessary.' });
    }

    // Insertar profesor
    let resultado = "";
    try {
        console.log ("inserting class");
        resultado = await database.InsertarAula(NUMBER, CAPACITY);
    } catch (error) {
        return res.status(500).json({ error: 'Error inserting class.', error });
    }

    // Enviar respuesta al cliente
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


module.exports = {
    insertTeacher,
    insertStudent,
    loginAdmin,
    insertClass,
    updateClassTeacher,
    registAdmin
};