require('dotenv').config();
const mysql = require('mysql2');
const baseDatos = require('./general.js');

const connection = baseDatos.connection;

async function getIdentityCards() {
    return new Promise ((resolve, reject) => {
        connection.query(
            'SELECT ID_alumno, NickName FROM ALUMNOS', (error, results, fields) => {
                if (error) {
                    console.error('Error obteniendo identity cards.', error);
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
                    console.error('Error getting identity card.', error);
                    reject(error);
                    return;
                }
                resolve(results);
            }
        );
    });
}

async function getAvatar(idStudent) {
    return new Promise ((resolve, reject) => {
        connection.query(
            'SELECT PA.Avatar_id, I.Descripcion ' +
            'FROM PERFIL_ALUMNOS AS PA ' +
            'INNER JOIN IMAGENES AS I ON PA.Avatar_id = I.ID_imagen ' +
            'WHERE PA.ID_alumno = ?',
            [idStudent], (error, results, fields) => {
                if (error) {
                    console.error('Error getting avatar.', error);
                    reject(error);
                    return;
                }
                resolve(results);
            }
        );
    });
}

async function getImagesAndSteps(idSet) {
    return new Promise ((resolve, reject) => {
        connection.query(
            'SELECT C.Steps, IS.ID_imagen, I.Descripcion ' +
            'FROM CONJUNTOS AS C ' +
            'INNER JOIN IMAGENES_SET AS IS ON C.ID_set = IS.ID_set ' +
            'INNER JOIN IMAGENES AS I ON IS.ID_imagen = I.ID_imagen ' +
            'WHERE C.ID_set = ?',
            [idSet], (error, results, fields) => {
                if (error) {
                    console.error('Error getting images and steps.', error);
                    reject(error);
                    return;
                }
                resolve(results);
            }
        );
    });
}

async function getAuthMethod(idStudent) {
    return new Promise ((resolve, reject) => {
        connection.query(
            'SELECT FormatoPassword, ID_set FROM PERFIL_ALUMNOS WHERE ID_alumno = ?',
            [idStudent], (error, results, fields) => {
                if (error) {
                    console.error('Error getting authentication method.', error);
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
                    console.error('Error getting format.', error);
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
                    console.error('Error getting interaction.', error);
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
                    console.error('Error getting data.', error);
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
                    console.error('Error getting perfil.', error);
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
              console.error('Error saving token', error);
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
    getImagesAndSteps,
    getAvatar,
    getFormatos,
    getInteraciones,
    getData,
    getPerfil,
    getPassword,
    getAuthMethod,
    studentData
};
