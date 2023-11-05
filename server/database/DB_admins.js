require('dotenv').config();
const mysql = require('mysql2');
const baseDatos = require('./general.js');

const connection = baseDatos.connection;


async function InsertarProfesor(nombre, apellido1, apellido2, nickname, password){
  return new Promise((resolve, reject) => {
    const lastId = connection.query('CALL InsertarProfesor(?, ?, ?, ?, ?)',
                    [nombre, apellido1, apellido2, nickname, password], (error, results, fields) => {
      if (error) {
        console.error('Error insertando profesor', error);
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}

async function ActualizarAulaProfesor(nickname, aula) {
  return new Promise((resolve, reject) => {
    connection.query('UPDATE PROFESORES SET Aula_asignada = ? WHERE NICKNAME = ?',
                    [aula, nickname], (error, results, fields) => {
      if (error) {
        console.error('Error actualizando aula del profesor', error);
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}

async function InsertarAdmin(nombre, apellido1, apellido2, nickname, password) {
  return new Promise((resolve, reject) => {
    connection.query('CALL InsertarAdministrador(?, ?, ?, ?, ?)',
                    [nombre, apellido1, apellido2, nickname, password], (error, results, fields) => {
      if (error) {
        console.error('Error insertando admin', error);
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}

async function InsertarAlumno(nombre, apellido1, apellido2, curso, tutor) {
  const insertarAlumno = await new Promise((resolve, reject) => {
    connection.query('CALL InsertarAlumno(?, ?, ?, ?)',
                    [nombre, apellido1, apellido2, curso], (error, results, fields) => {
      if (error) {
        console.error('Error insertando alumno', error);
        reject(error);
        return;
      }
      resolve(results);
    });
  });

  // Cuando no existe el ID del profesor arriba, result[0].Aula_asignada es undefined aunque el alumno se inserta correctamente.
  if (tutor) {
    const result = await new Promise((resolve, reject) => {
      connection.query('SELECT Aula_asignada FROM PROFESORES WHERE ID_profesor = ?',
                      [tutor], (error, results, fields) => {
        if (error) {
          console.error('Error query, there no teacher with that ID', error);
          reject(error);
          return;
        }
        resolve(results);
      });
    });

    if (result.length > 0 && result[0].Aula_asignada != null) {
      actualizarAlumno(tutor, result[0].Aula_asignada);
    }
  }

  return insertarAlumno;
}

async function InsertarAula(numeroAula, capacidad) {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO AULAS (Num_aula, Capacidad) VALUES (?, ?)',
                    [numeroAula, capacidad], (error, results, fields) => {
      if (error) {
        console.error('Error insertando aula', error);
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}

async function ActualizarAlumno(id, idTutor, aulaAsignada) {
  return new Promise((resolve, reject) => {
    connection.query('UPDATE ALUMNOS SET ID_tutor = ?, Aula_asignada = ? WHERE ID = ?',
                    [idTutor, aulaAsignada, id], (error, results, fields) => {
      if (error) {
        console.error('Error actualizando alumno', error);
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}

async function DatosAdmin(nickname) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT Id_admin, Nombre, Apellido1, Apellido2 FROM ADMINISTRADORES WHERE NICKNAME = ?',
                [NICKNAME] , (error, results, fields) => {
        if (error) {
            console.error('Error guardando token', error);
            reject(error);
            return;
        }
        resolve(results);
    });
  });
}

async function GetPassword(Nickname) {
  return new Promise((resolve, reject) => {
    connection.query('Select Password_hash from ADMINISTRADORES where NICKNAME = ? limit 1',
                [Nickname] , (error, results, fields) => {
        if (error) {
            console.error('Error guardando token', error);
            reject(error);
            return;
        }
        resolve(results);
    });
  });
}

async function InsertarToken(id, token, fecha) {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO TOKENS (ID_usuario, Token, Expiration_date) VALUES (?,?,?)',
                [id, token, fecha] , (error, results, fields) => {
        if (error) {
            console.error('Error guardando token', error);
            reject(error);
            return;
        }
        resolve(results);
    });
  });
}

async function VerificarToken(token) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT Token FROM TOKENS WHERE Token = ?',
                [token], (error, results, fields) => {
        if (error) {
            console.error('Token does not exist', error);
            reject(error);
            return;
        }
        if (results.length === 0) {
            resolve(false);
        } else {
            resolve(true);
        }
    });
  });
}

module.exports = {
    InsertarAlumno,
    InsertarProfesor,
    InsertarToken,
    GetPassword,
    DatosAdmin,
    InsertarAdmin,
    ActualizarAulaProfesor,
    InsertarAula,
    VerificarToken
};