require('dotenv').config();
const mysql = require('mysql2');
const baseDatos = require('./general.js');

const connection = baseDatos.connection;

async function InsertarProfesor(DNI, NOMBRE, APELLIDOS, AULA_ASIGNADA, DIRECCION, TELEFONO) {
    return new Promise((resolve, reject) => {
      connection.query('CALL InsertarProfesor(?, ?, ?, ?, ?, ?)',
                      [DNI, NOMBRE, APELLIDOS, AULA_ASIGNADA, DIRECCION, TELEFONO], (error, results, fields) => {
        if(error) {
          console.error('Error insertando profesor', error);
          reject(error);
          return;
        }
        resolve(results);
      });
    });
}

async function InsertarAlumno(DNI, NOMBRE, APELLIDOS, EDAD, AULA_ASIGNADA, DIRECCION, TELEFONO) {
    return new Promise((resolve, reject) => {
      connection.query('CALL InsertarAlumno(?, ?, ?, ?, ?, ?, ?)',
                      [DNI, NOMBRE, APELLIDOS, EDAD, AULA_ASIGNADA, DIRECCION, TELEFONO], (error, results, fields) => {
        if(error) {
          console.error('Error insertando alumno', error);
          reject(error);
          return;
        }
        resolve(results);
      });
    });
}

module.exports = {
    InsertarAlumno,
    InsertarProfesor
};