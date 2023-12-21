const database = require('../../../database/DB_profesores.js');
const general = require('../../../database/general.js');
const { encrypt, compare, checkearToken } = require('../../../database/general.js');


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
        hash = await database.getPassword(nickname);
        [idTeacher, Name, lastname1, lastname2, classroom] = await database.TeacherData(nickname);
    } catch (error) {
        return res.status(500).json({ error: 'Could not get password or teacher data.' });
    }

    // Comprobar si la contraseña es correcta
    let correcta = false;
    try {
        correcta = await general.compare(password, hash);
    } catch (error) {
        return res.status(500).json({ error: 'Error comparing password.' });
    }

    if (correcta) {
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

async function registPerfilStudent(req, res) {  // SE HA PROBADO SIN IDSET, FALTA PROBAR CON IDSET
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    // Cogemos el id del estudiante del primer parámetro de la ruta.
    const idStudent = req.params.userID;

    try {
        token_decoded = await checkearToken(token, secret_teacher); 
    } catch (error) {
        return res.status(500).json({ error: 'Token has expired or you are not identified.' });
    }

    const { nickname, avatarId, idSet = null, passwordFormat, password, contentAdaptationFormats, interactionMethods} = req.body;

    if (!idStudent || !nickname || !avatarId || !passwordFormat || !password 
        || !contentAdaptationFormats || !interactionMethods) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Comprobar que el id del estudiante existe en la base de datos.
        const student = await database.getStudent(idStudent);

        if (student.length === 0) {
            return res.status(400).json({ error: 'Student with that id does not exist' });
        }
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

    try {
        // Comprobar que el id del avatar existe en la base de datos.
        const avatar = await general.getAvatar(avatarId);

        if (avatar.length === 0) {
            return res.status(400).json({ error: 'Avatar with that id does not exist.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Error while checking avatar.' });
    }

    // Si la autenticacion es por imagen hace falta el idSet.
    if (passwordFormat == 'ImageAuth' && !idSet) {
        return res.status(400).json({ error: 'SetId is required with Image Login.' });
    }

    try {
        const passwordHash = await encrypt(password);
        await database.registPerfilStudent(idStudent, nickname, avatarId, idSet, passwordFormat, passwordHash);
        await database.registContentProfile(idStudent, contentAdaptationFormats, interactionMethods);

        res.status(200).json({ message: 'Student profile registered.' });
    } catch (error) {
        return res.status(500).json({ error: 'Could not regist student profile.' });
    }
}

async function insertMenu(req, res) { //PROBAR-> SERA PARA EL PROFESOR QUE EL JERMU ES GILIPOLLAS
    // Obtener datos del cuerpo de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    const taskID = req.params.taskId;
    const classroomID = req.params.classroomId;
    const menuOptionID = req.params.menuOptionId;
    const amount = req.body.amount;

    try {
        decodedToken = await checkearToken(token, secret_teacher);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    try{
        await database.insertMenu(taskID, classroomID, menuOptionID, amount);
    }catch (error) {
        return res.status(500).json({ error: 'Error inserting menu. ' + error });
    }
}

module.exports = {
    getTeachers,
    login,
    registPerfilStudent,
    insertMenu
};