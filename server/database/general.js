const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const schedule = require('node-schedule');

const jwt = require('jsonwebtoken');

let connection;

async function conectarBD() {
    if (!connection) {
        try {
            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                multipleStatements: true
            });
            console.log('Connected to the database');
        } catch (error) {
            console.error('Error connecting to the database', error);
            throw error;
        }
    }

    console.log('Returning connection');
    return connection;
}

async function desconectarBD() {
    connection.end();
}

const encrypt = async (password) => {
    return await bcrypt.hash(password, 10);
}

const compare = async (password, hash) => {
    return await bcrypt.compare(password, hash);
}

// Define la función de limpieza de tokens
async function cleanUpTokens() {
    const currentDate = new Date();
    try {
        const connection = await conectarBD();
        const [results, fields] = await connection.execute(
            'DELETE FROM TOKENS WHERE Expiration_date < ?',
            [currentDate]
        );
        return results;
    } catch (error) {
        throw new Error('Error cleaning up tokens');
    }
}

// Checker comportamiento de esta función con los errores. 
async function checkearToken(token, typeSecret) {
    const connection = await conectarBD();

    const [rows] = await connection.execute('SELECT Token FROM TOKENS WHERE Token = ?',
                           [token]
    );

    if (rows.length > 0) {
        try {
            const decoded = jwt.verify(token, typeSecret);
            if (Date.now() > decoded.EXP) {
                throw new Error('Token expired');
            }

            return decoded;
        } catch (error) {
            throw new Error('Error verifying token');
        }
    } else {
        throw new Error('Token not found in the database');
    }
}


async function VerificarToken(token) {              // Cambio en la tabla tokens?
    const connection = await conectarBD();

    const [rows, fields] = connection.execute('SELECT Token FROM TOKENS WHERE Token = ?',
                           [token], (error, results, fields) => {
        if (error) {
            throw new Error('Error getting token');
        }
    });

    return rows[0];
}

async function getImage(idImage) {
    const connection = await conectarBD();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM IMAGENES WHERE ID_imagen = ?',
        [idImage]
    );

    const data = {
        id: rows[0].ID_imagen,
        imgDescription: rows[0].Descripcion,
        Type: rows[0].Tipo
    };

    return data;
}

async function insertarToken(id, token, fecha) {
    const connection = await conectarBD();

    const [rows, fields] = await connection.execute(
        'INSERT INTO TOKENS (ID_usuario, Token, Expiration_date) VALUES (?,?,?)',
        [id, token, fecha]
    );

    const resultado = rows[0];

    return resultado;
}

async function getSetImages(idSet) {
    const connection = await conectarBD();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM SET_IMAGENES WHERE ID_set = ?',
        [idSet]
    );

    const setImages = rows.map(result => result);

    return setImages;
}

async function getAvatar(idUser) {
    const connection = await conectarBD();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM IMAGENES WHERE ID_imagen = ? AND Tipo = "AVATAR"',
        [idUser]
    );

    const avatar = rows.map(result => result);

    return avatar;
}

const job = schedule.scheduleJob('0 * * * *', cleanUpTokens);

module.exports = {
    conectarBD,
    desconectarBD,
    connection,
    encrypt,
    compare,
    cleanUpTokens,
    getImage,
    checkearToken,
    VerificarToken,
    insertarToken,
    getSetImages,
    getAvatar
};