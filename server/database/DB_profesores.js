require('dotenv').config();
const mysql = require('mysql2');
const baseDatos = require('./general.js');

const connection = baseDatos.connection;

async function TeacherData(nickname) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT ID_profesor, Nombre, Apellido1, Apellido2, Aula_asiganada FROM PROFESORES WHERE NickName = ?',
                [nickname] , (error, results, fields) => {
        if (error) {
            console.error('Error searching teacher data', error);
            reject(error);
            return;
        }
        resolve(results);
    });
  });
}

async function GetPassword(nickname) {
  return new Promise((resolve, reject) => {
    connection.query('Select Password_hash from PROFESORES where NickName = ? limit 1',
                [nickname] , (error, results, fields) => {
        if (error) {
            console.error('Error getting password', error);
            reject(error);
            return;
        }
        resolve(results);
    });
  });
}

async function obtenerProfesores() {
  return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM PROFESORES', (error, results, fields) => {
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
    TeacherData,
    GetPassword,
    obtenerProfesores
};

