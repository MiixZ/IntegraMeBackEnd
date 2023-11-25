const database = require('../../../database/DB_profesores.js');
const general = require('../../../database/general.js');

const jwt = require('jsonwebtoken');
const secret_teacher = process.env.JWT_SECRET_TEACHER;

async function getTeachers(req, res) {
    let profesores = [];

    // Obtener profesores
    try {
        profesores = await database.getTeachers();
    } catch (error) {
        return res.status(500).json({ error: 'Could not get teachers.' });
    }

    // Enviar respuesta al cliente
    res.json(profesores);
}

async function login(req, res) {                // Probar.
    // Obtener datos del cuerpo de la solicitud.
    const { nickname, password } = req.body;

    // Verificar si todos los campos necesarios están presentes
    if (!nickname || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    let hash = '';
    let idTeacher = '', Name = '', lastname1 = '', lastname2 = '', classroom = '';

    try {
        hash = await database.GetPassword(nickname);
        [idTeacher, Name, lastname1, lastname2, classroom] = await database.TeacherData(nickname);
    } catch (error) {
        return res.status(500).json({ error: 'Could not get password or teacher data.' });
    }

    if (await general.compare(password, hash[0].Password_hash)) {
        const fecha = new Date(Date.now() + 24 * 60 * 60 * 1000); // Creamos una fecha de expiración del token (24 horas más al día actual)
        const token = jwt.sign({ idTeacher: idTeacher, nickname, EXP: fecha}, secret_teacher);
        try {
            await general.insertarToken(idTeacher, token, fecha);
            res.status(200).json({ token });
        } catch {
            reject(error);
            return;
        }
    } else {
        res.status(401).json({ error: 'Incorrect Credentials.' });
    }
}

async function registPerfilStudent(req, res) {
    const { idStudent, avatarId, idSet, PasswordFormat, Password } = req.body;
}

module.exports = {
    getTeachers,
    login
};