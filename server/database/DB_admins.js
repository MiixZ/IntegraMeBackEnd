require('dotenv').config();
const mysql = require('mysql2');
const baseDatos = require('./general.js');

const connection = baseDatos.connection;

async function InsertarProfesor(DNI, NOMBRE, APELLIDOS, PASSWORD, DIRECCION, TELEFONO) {
  return new Promise((resolve, reject) => {
    connection.query('CALL InsertarProfesor(?, ?, ?, ?, ?, ?)',
                    [DNI, NOMBRE, APELLIDOS, PASSWORD, DIRECCION, TELEFONO], (error, results, fields) => {
      if (error) {
        console.error('Error insertando profesor', error);
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}

async function InsertarAdmin(DNI, NOMBRE, APELLIDOS, PASSWORD, DIRECCION, TELEFONO) {
  return new Promise((resolve, reject) => {
    connection.query('CALL InsertarAdministrador(?, ?, ?, ?, ?, ?)',
                    [DNI, NOMBRE, APELLIDOS, PASSWORD, DIRECCION, TELEFONO], (error, results, fields) => {
      if (error) {
        console.error('Error insertando admin', error);
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}

async function InsertarAlumno(DNI, NOMBRE, APELLIDOS, EDAD, TUTOR, DIRECCION, TELEFONO) {
  const result = await new Promise((resolve, reject) => {
    connection.query('SELECT Aula_asignada FROM PROFESORES WHERE ID_profesor = ?',
                    [TUTOR], (error, results, fields) => {
      if (error) {
        console.error('Error insertando alumno', error);
        reject(error);
        return;
      }
      resolve(results);
      });
    });

  if (result[0].Aula_asignada != null) {
    connection.query('CALL InsertarAlumno(?, ?, ?, ?, ?, ?, ?)',
                    [DNI, NOMBRE, APELLIDOS, EDAD, TUTOR, result[0].Aula_asignada, DIRECCION, TELEFONO], (error, results, fields) => {
      if (error) {
        console.error('Error insertando alumno', error);
        reject(error);
        return;
      }
      resolve(results);
    });
  }
}

async function DatosAdmin(DNI) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT Id_admin, Nombre, Apellidos FROM ADMINISTRADORES WHERE DNI = ?',
                [DNI] , (error, results, fields) => {
        if(error) {
            console.error('Error guardando token', error);
            reject(error);
            return;
        }
        resolve(results);
    });
  });
}

async function GetPassword(DNI) {
  return new Promise((resolve, reject) => {
    connection.query('Select Password_hash from ADMINISTRADORES where DNI = ? limit 1',
                [DNI] , (error, results, fields) => {
        if(error) {
            console.error('Error guardando token', error);
            reject(error);
            return;
        }
        resolve(results);
    });
  });
}

async function InsertarToken(ID, TOKEN, FECHA) {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO TOKENS (ID_usuario, Token, Expiration_date) VALUES (?,?,?)',
                [ID, TOKEN, FECHA] , (error, results, fields) => {
        if(error) {
            console.error('Error guardando token', error);
            reject(error);
            return;
        }
        resolve(results);
    });
  });
}

module.exports = {
    InsertarAlumno,
    InsertarProfesor,
    InsertarToken,
    GetPassword,
    DatosAdmin,
    InsertarAdmin
};