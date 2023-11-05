require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const schedule = require('node-schedule');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
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

const job = schedule.scheduleJob('0 * * * *', cleanUpTokens);

module.exports = {
    conectarBD,
    desconectarBD,
    connection,
    encrypt,
    compare,
    cleanUpTokens
};