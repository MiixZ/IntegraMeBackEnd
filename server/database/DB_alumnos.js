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
                    console.error('Error getting identity cards.', error);
                    reject(error);
                    return;
                }
                resolve(results);
            }
        );
    });
}

async function getInteraciones(idStudent) {
    return new Promise ((resolve, reject) => {
        connection.query(
            'SELECT Nom_interaccion FROM INTERACCION_ALUMNOS WHERE ID_alumno = ?',
            [idStudent], (error, results, fields) => {
                if (error) {
                    console.error('Error getting identity card.', error);
                    reject(error);
                    return;
                }
                resolve(results);
            }
        );
    });
}

async function getData(idStudent) {
    return new Promise ((resolve, reject) => {
        connection.query(
            'SELECT Nombre, Apellido1, Apellido2, NickName FROM ALUMNOS WHERE ID_alumno = ?',
            [idStudent], (error, results, fields) => {
                if (error) {
                    console.error('Error getting identity card.', error);
                    reject(error);
                    return;
                }
                resolve(results);
            }
        );
    });
}

async function getPerfil(idStudent) {
    return new Promise ((resolve, reject) => {
        connection.query(
            'SELECT Avatar_id FROM PERFIL_ALUMNOS WHERE ID_alumno = ?',
            [idStudent], (error, results, fields) => {
                if (error) {
                    console.error('Error getting identity card.', error);
                    reject(error);
                    return;
                }
                resolve(results);
            }
        );
    });
}

async function getPassword(id) {
    return new Promise((resolve, reject) => {
        connection.query('Select Password_hash from PERFIL_ALUMNOS where ID_alumno = ? limit 1',
                    [id] , (error, results, fields) => {
            if (error) {
                console.error('Error getting password', error);
                reject(error);
                return;
            }
            resolve(results);
        });
    });
}

async function studentData(id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT NickName FROM ALUMNOS WHERE ID_alumno = ?',
                  [id] , (error, results, fields) => {
          if (error) {
              console.error('Error guardando token', error);
              reject(error);
              return;
          }
          resolve(results);
      });
    });
}

module.exports = {
    getIdentityCard,
    getIdentityCards,
    getFormatos,
    getInteraciones,
    getData,
    getPerfil,
    getPassword,
    studentData
};
