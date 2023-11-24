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

    const hash = await database.GetPassword(nickname);
    const adminData = await database.AdminData(nickname);

    if (hash.length > 0 && await compare(password, hash[0].Password_hash)) {
        const fecha = new Date(Date.now() + 24 * 60 * 60 * 1000); // Creamos una fecha de expiración del token (24 horas más al día actual)
        const token = jwt.sign({ idAdmin: adminData[0].Id_admin, nickname, EXP: fecha}, secret_admin); //{ expiresIn: '1h' });

        const resultado = await general.insertarToken(adminData[0].Id_admin, token, fecha);
        res.status(200).json({ token });
    } else {
        res.status(401).json({ error: 'Incorrect Credentials.' });
    }
}

async function registAdmin(req, res) {
    try {
        // Obtener datos del cuerpo de la solicitud
        const { name, lastname1, lastname2, nickname, password } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!name || !lastname1 || !lastname2 || !password || !nickname) {
            return res.status(400).json({ error: 'All fields are necessary.' });
        }

        const passwordHash = await encrypt(password);

        // Insertar administrador.
        const resultado = database.InsertarAdmin(name, lastname1, lastname2, nickname, passwordHash);

        // Enviar respuesta al cliente
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Token has expired or you are not identified.' });
    }
}

async function insertClass(req, res) {
    try {
        // Coge el token enviado en el header de la solicitud.
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Token not sent' });
        }

        const token = req.headers.authorization.split(' ')[1];

        await checkearToken(token, secret_admin);

        // Obtener datos del cuerpo de la solicitud
        const { NUMBER, CAPACITY } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!NUMBER || !CAPACITY) {
            return res.status(400).json({ error: 'All fields are necessary.' });
        }

        // Insertar profesor
        const resultado = await database.InsertarAula(NUMBER, CAPACITY);

        // Enviar respuesta al cliente
        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Token has expired or you are not identified.' });
    }
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