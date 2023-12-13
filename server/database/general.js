const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const schedule = require('node-schedule');
const ip = '34.175.9.11';

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

// TODO: Si la url de imagen, video o audio es null, se devuelve el endpoint local.

async function getImageContent(idImage) {
    const connection = await conectarBD();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM IMAGENES WHERE ID_imagen = ?',
        [idImage], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting image. ' + error);
            }
        }
    );

    if (rows.length === 0) {
        throw new Error('There is no image with that id.');
    }

    // Si la url de la imagen es null, se devuelve el endpoint local.

    const data = {
        type: "RemoteImage",
        id: rows[0].ID_imagen,
    };

    if (rows[0].Imagen_url) {
        data.imageUrl = rows[0].Imagen_url;
    } else {
        data.imageUrl = 'http://' + ip + ':6969/api/v1/images/' + rows[0].ID_imagen;
    }

    data.altDescription = rows[0].Descripcion;

    return data;
}

async function getAudio(idAudio) {
    const connection = await conectarBD();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM AUDIOS WHERE ID_audio = ?',
        [idAudio], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting audio. ' + error);
            }
        }
    );

    if (rows.length === 0) {
        throw new Error('There is no audio with that id.');
    }

    const data = {
        type: "AudioContent",
        id: rows[0].ID_audio,
    };

    if (rows[0].Audio_url) {
        data.audioUrl = rows[0].Audio_url;
    } else {
        data.audioUrl = 'http://' + ip + ':6969/api/v1/audios/' + rows[0].ID_audio;
    }

    return data;
}

async function getVideo(idVideo) {
    const connection = await conectarBD();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM VIDEOS WHERE ID_video = ?',
        [idVideo], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting video. ' + error);
            }
        }
    );

    if (rows.length === 0) {
        throw new Error('There is no video with that id.');
    }

    const data = {
        type: "VideoContent",
        id: rows[0].ID_video,
    };

    if (rows[0].Video_url) {
        data.videoUrl = rows[0].Video_url;
    } else {
        data.videoUrl = 'http://' + ip + ':6969/api/v1/videos/' + rows[0].ID_video;
    }

    return data;
}

async function getMaterial(idMaterial) {
    const connection = await conectarBD();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM MATERIALES WHERE ID_material = ?',
        [idMaterial]
    );

    fotoMaterial = await getImageContent(rows[0].Foto_material);

    data = {
        displayName: rows[0].Nombre,
        displayImage: fotoMaterial,
    };

    if (rows[0].Propiedad) {
        fotoPropiedad = await getImageContent(rows[0].Foto_propiedades);

        propiedad = {
            displayName: rows[0].Propiedad,
            displayImage: fotoPropiedad
        };

        data.property = propiedad;
    }

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
    getAvatar,
    getImageContent,
    getAudio,
    getVideo,
    getMaterial
};