
require('dotenv').config();
const mysql = require('mysql2');
const baseDatos = require('./general.js');

const connection = baseDatos.connection;

async function getIdentityCards() {
    return new Promise ((resolve, reject) => {
        connection.query(
            'SELECT ID_alumno, NickName FROM ALUMNOS', (error, results, fields) => {
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

async function getIdentityCard(idStudent) {
    return new Promise ((resolve, reject) => {
        connection.query(
            'SELECT ID_alumno, NickName FROM ALUMNOS WHERE id_alumno = ?',
            [idStudent], (error, results, fields) => {
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

async function getFormatos(idStudent) {
    return new Promise ((resolve, reject) => {
        connection.query(
            'SELECT Nom_formato FROM FORMATOS_ALUMNOS WHERE ID_alumno = ?',
            [idStudent], (error, results, fields) => {
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

async function getIteraciones(idStudent) {
    return new Promise ((resolve, reject) => {
        connection.query(
            'SELECT Nom_interaccion FROM ITERACCION_ALUMNOS WHERE ID_alumno = ?',
            [idStudent], (error, results, fields) => {
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

module.exports = {
    getIdentityCard,
    getIdentityCards,
    getFormatos,
    getIteraciones
};
