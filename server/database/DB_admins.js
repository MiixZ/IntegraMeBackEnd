require('dotenv').config();
const mysql = require('mysql2');
const baseDatos = require('./general.js');

const connection = baseDatos.connection;

async function InsertarProfesor(name, lastname1, lastname2, nickname, password) {
  return new Promise((resolve, reject) => {
    const lastId = connection.query('CALL InsertarProfesor(?, ?, ?, ?, ?)',
                    [name, lastname1, lastname2, nickname, password], (error, results, fields) => {
      if (error) {
        console.error('Error inserting teacher.', error);
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
        console.error('Error updating teacher class.', error);
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
        console.error('Error inserting admin.', error);
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}

async function InsertarAlumno(name, lastname1, lastname2, grade, tutor) {
  const sql = "CALL InsertarAlumno(?, ?, ?, ?, @idAlum); SELECT @idAlum;";
  const values = [name, lastname1, lastname2, grade];
  let idAlum = null;

  const insertarAlumno = new Promise((resolve, reject) => {
    connection.query(sql, values, (error, results, fields) => {
      if (error) {
        console.error('Error inserting student.', error);
        reject(error);
        return;
      }
      idAlum = results[1][0]['@idAlum']; // It is scary but it works
      resolve({ results, idAlum });
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
      new Promise((resolve, reject) => {
        connection.query('UPDATE ALUMNOS SET ID_tutor = ?, Aula_asignada = ? WHERE ID_alumno = ?',
                        [tutor, result[0].Aula_asignada, idAlum], (error, results, fields) => {
          if (error) {
            console.log('Error updating student.', error);
            reject(error);
            return;
          }
          resolve(results);
        });
      });
    }
  }
}

async function InsertarAula(numeroAula, capacidad) {
  return new Promise((resolve, reject) => {
    connection.query('INSERT INTO AULAS (Num_aula, Capacidad) VALUES (?, ?)',
                    [numeroAula, capacidad], (error, results, fields) => {
      if (error) {
        console.error('Error inserting class.', error);
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}

async function AdminData(nickname) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT Id_admin, Nombre, Apellido1, Apellido2 FROM ADMINISTRADORES WHERE NICKNAME = ?',
                [nickname] , (error, results, fields) => {
        if (error) {
            console.error('Error saving token.', error);
            reject(error);
            return;
        }
        resolve(results);
    });
  });
}

async function GetPassword(nickname) {
  return new Promise((resolve, reject) => {
    connection.query('Select Password_hash from ADMINISTRADORES where NICKNAME = ? limit 1',
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


module.exports = {
  InsertarAlumno,
  InsertarProfesor,
  GetPassword,
  AdminData,
  InsertarAdmin,
  ActualizarAulaProfesor,
  InsertarAula
};