const database = require('../../../database/DB_profesores.js');
const general = require('../../../database/general.js');

const jwt = require('jsonwebtoken');
const secret_teacher = process.env.JWT_SECRET_TEACHER;


async function getTeachers(req, res) {
    try {
        // Obtener profesores
        const profesores = await database.obtenerProfesores();

        // Enviar respuesta al cliente
        res.json(profesores);
    } catch (error) {
        res.status(500).json({ error: 'Request error' });
    }
}

async function login(req, res) {
    try {
        // Obtener datos del cuerpo de la solicitud.
        const { nickname, password } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!nickname || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const hash = await database.GetPassword(nickname);
        const teacherData = await database.TeacherData(nickname);

        if (hash.length > 0 && await general.compare(password, hash[0].Password_hash)) {
            const fecha = new Date(Date.now() + 24 * 60 * 60 * 1000); // Creamos una fecha de expiración del token (24 horas más al día actual)
            const token = jwt.sign({ idTeacher: teacherData[0].ID_profesor, nickname, EXP: fecha}, secret_teacher);
            try {
                await general.insertarToken(teacherData[0].ID_profesor, token, fecha);
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
    getTeachers,
    login
};