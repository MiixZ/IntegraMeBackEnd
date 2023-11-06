require('dotenv').config();
const mysql = require('mysql2');
const baseDatos = require('./general.js');

const connection = baseDatos.connection;

async function obtenerProfesores() {
    return new Promise((resolve, reject) => {
        connection.query('select * from PROFESORES', (error, results, fields) => {
            if (error) {
                console.error('Error obteniendo profesores', error);
                reject(error);
                return;
            }
            resolve(results);
        });
    });
}

module.exports = {
    obtenerProfesores
};