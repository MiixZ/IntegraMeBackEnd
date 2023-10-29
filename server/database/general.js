require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

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
    console.log('password:', password);
    console.log('hash:', hash);
    return await bcrypt.compare(password, hash);
}


/** GESTIÓN DE TOKENS
 * 
const currentDate = new Date();

connection.query(
    'DELETE FROM Tokens WHERE expiration_date < ?',
    [currentDate],
    (error, results) => {
        // ... manejar el resultado y cerrar la conexión
    }
);
 */

module.exports = {
    conectarBD,
    desconectarBD,
    connection,
    encrypt,
    compare
};