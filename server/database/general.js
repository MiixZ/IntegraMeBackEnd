require('dotenv').config();
const mysql = require('mysql2');

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
    connection
};