const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '34.175.9.11',
    port: 33060,
    user: 'root',
    password: 'integrame',
    database: 'INTEGRAME'
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

async function obtenerProfesores() {
    return new Promise((resolve, reject) => {
        connection.query('select * from PROFESORES', (error, results, fields) => {
            if(error) {
                console.error('Error obteniendo profesores', error);
                reject(error);
                return;
            }
            resolve(results);
        });
    });
}

module.exports = {
    conectarBD,
    desconectarBD,
    obtenerProfesores
};