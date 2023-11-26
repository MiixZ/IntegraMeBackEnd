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
    return new Promise((resolve, reject) => {
        // La fecha de expiración (un día después de la fecha en la que se creó el token)
        connection.query('DELETE FROM TOKENS WHERE Expiration_date < ?',
            [currentDate],
            (error, results, fields) => {
                if (error) {
                    console.error('Error eliminado TOKENS', error);
                    reject(error);
                    return;
                }
                resolve(results);
            }
        );
    });
}

// Checker comportamiento de esta función con los errores. 
async function checkearToken(token, typeSecret) {
    existe =  await VerificarToken(token);
    if (existe) {
        console.log('Token exists on database');
        return new Promise((resolve, reject) => {
            jwt.verify(token, typeSecret, (error, decoded) => {
                if (error || Date.now() > decoded.EXP) {
                    console.log('fercha');
                    reject(error);
                }
                console.log('Token is valid, sending...');
                resolve(decoded);
            });
        });
    } else {
        throw new Error('Token not found in the database');
    }
};


async function VerificarToken(token) {              // Cambio en la tabla tokens?
    return new Promise((resolve, reject) => {
      connection.query('SELECT Token FROM TOKENS WHERE Token = ?',
                  [token], (error, results, fields) => {
          if (error) {
              console.error('Token does not exist', error);
              reject(error);
              return;
          }
          if (results.length === 0) {
              resolve(false);
          } else {
              resolve(true);
          }
      });
    });
}

async function getImage(idImage) {
    return new Promise ((resolve, reject) => {
        connection.query(
            'SELECT Img_path FROM IMAGENES WHERE ID_imagen = ?',
            [idImage], (error, results, fields) => {
                if (error) {
                    console.error('Error obteniendo tarjetas de identidad', error);
                    reject(error);
                    return;
                }
                resolve(results);
            }
        );
    });
}

async function insertarToken(id, token, fecha) {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO TOKENS (ID_usuario, Token, Expiration_date) VALUES (?,?,?)',
                  [id, token, fecha] , (error, results, fields) => {
          if (error) {
              console.error('Error guardando token', error);
              reject(error);
              return;
          }
          resolve(results);
      });
    });
}

async function getSetImages(idSet) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM SET_IMAGENES WHERE ID_set = ?',
        [idSet]
    );

    const setImages = rows.map(result => result);

    return setImages;
}

async function getAvatar(idUser) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM AVATARES WHERE ID_usuario = ? AND Tipo = "AVATAR"',
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
    getSetImages
};