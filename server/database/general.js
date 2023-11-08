require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const schedule = require('node-schedule');

const jwt = require('jsonwebtoken');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true
});

async function conectarBD() {
    connection.connect((err) => {
        if(err) {
            console.error('Error conectando a la base de datos', err);
            return;
        }
        console.log('Conectado a la base de datos');
    });
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

async function CheckearToken(token, typeSecret) {
    VerificarToken(token).then(existe => {
        if (existe) {
            return new Promise((resolve, reject) => {
                jwt.verify(token, typeSecret, (error, decoded) => {
                    if (error || Date.now() > decoded.EXP) {
                        reject(error);
                    }
                    resolve(decoded);
                });
            });
        } else {
            return res.status(400).json('Token not found in the database');
        }
    }).catch(error => {
        console.error('An error has ocurred in VerificarToken call', error);
    });
}

async function VerificarToken(token) {
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

const job = schedule.scheduleJob('0 * * * *', cleanUpTokens);

module.exports = {
    conectarBD,
    desconectarBD,
    connection,
    encrypt,
    compare,
    cleanUpTokens,
    getImage,
    checkearToken: CheckearToken
};