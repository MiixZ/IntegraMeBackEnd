require('dotenv').config();
const baseDatos = require('./general.js');

async function conectar() {
    return await baseDatos.conectarBD();
}

async function getIdentityCards() {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT ID_alumno, NickName FROM ALUMNOS'
    );

    const ids = rows.map(result => result.ID_alumno);
    const nicknames = rows.map(result => result.NickName);

    return [ids, nicknames];
}

async function getIdentityCard(idStudent) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT ID_alumno, NickName FROM ALUMNOS WHERE id_alumno = ?',
        [idStudent]
    );

    const id = rows[0].ID_alumno;
    const nickname = rows[0].NickName;

    return [id, nickname];
}

async function getAvatar(idStudent) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT PA.Avatar_id, I.Descripcion ' +
        'FROM PERFIL_ALUMNOS AS PA ' +
        'INNER JOIN IMAGENES AS I ON PA.Avatar_id = I.ID_imagen ' +
        'WHERE PA.ID_alumno = ?',
        [idStudent]
    );

    const avatarId = rows[0].Avatar_id;
    const altDescription = rows[0].Descripcion;

    return [avatarId, altDescription];
}

async function getImagesAndSteps(idSet) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT C.Steps, IS.ID_imagen, I.Descripcion ' +
        'FROM CONJUNTOS AS C ' +
        'INNER JOIN IMAGENES_SET AS IS ON C.ID_set = IS.ID_set ' +
        'INNER JOIN IMAGENES AS I ON IS.ID_imagen = I.ID_imagen ' +
        'WHERE C.ID_set = ?',
        [idSet], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting images and steps.', error);
            }
        }
    );

    const steps = rows[0].Steps;
    const images = rows.map(result => [result.ID_imagen, result.Descripcion]);
    
    return [steps, images];
}

async function getAuthMethod(idStudent) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT FormatoPassword, ID_set FROM PERFIL_ALUMNOS WHERE ID_alumno = ?',
        [idStudent], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting authentication method.', error);
            }
        }
    );

    const authMethod = rows[0].FormatoPassword;
    const idSet = rows[0].ID_set;
    
    return [authMethod, idSet];
}

async function getFormatos(idStudent) {
    const connection = await conectar();
    
    const [rows, fields] = await connection.execute(
        'SELECT Nom_formato FROM FORMATOS_ALUMNOS WHERE ID_alumno = ?',
        [idStudent], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting format.', error);
            }
        }
    );

    const formatos = rows.map(result => result.Nom_formato);

    return formatos;
}

async function getInteracciones(idStudent) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT Nom_interaccion FROM INTERACCION_ALUMNOS WHERE ID_alumno = ?',
        [idStudent], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting interaction.', error);
            }
        }
    );

    const interacciones = rows.map(result => result.Nom_interaccion);

    return interacciones;
}

async function getData(idStudent) {
    const connection = await conectar();

    const [row] = await connection.execute(
        'SELECT Nombre, Apellido1, Apellido2, NickName FROM ALUMNOS WHERE ID_alumno = ?',
        [idStudent], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting data.', error);
            }
        }
    );

    const data = {
        Name: row[0].Nombre,
        Lastname1: row[0].Apellido1,
        Lastname2: row[0].Apellido2,
        NickName: row[0].NickName
    };

    return data;
}

async function getPerfil(idStudent) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT Avatar_id FROM PERFIL_ALUMNOS WHERE ID_alumno = ?',
        [idStudent], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting perfil.', error);
            }
        }
    );

    const perfil = rows.map(result => result.Avatar_id);

    return perfil;
}

async function getPassword(id) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT Password_hash FROM PERFIL_ALUMNOS WHERE ID_alumno = ? LIMIT 1',
        [id], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting password.', error);
            }
        }
    );

    const password = rows.map(result => result.Password_hash);

    return password;
}

async function studentData(id) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT NickName FROM ALUMNOS WHERE ID_alumno = ?',
        [id], (error, results, fields) => {
            if (error) {
                throw new Error('Error saving token', error);
            }
        }
    );

    const data = rows.map(result => result.NickName);

    return data;
}

module.exports = {
    getIdentityCard,
    getIdentityCards,
    getImagesAndSteps,
    getAvatar,
    getFormatos,
    getInteracciones,
    getData,
    getPerfil,
    getPassword,
    getAuthMethod,
    studentData
};
