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

async function InsertarAlumno(name, lastname1, lastname2, grade, tutor) {
  const sql = "CALL InsertarAlumno(?, ?, ?, ?, @idAlum); SELECT @idAlum;";
  const values = [name, lastname1, lastname2, grade];

  const insertarAlumno = new Promise((resolve, reject) => {
    connection.query(sql, values, (error, results, fields) => {
      if (error) {
        console.error('Error insertando alumno', error);
        reject(error);
        return;
      }
      const idAlum = results[1][0]['@idAlum']; // get the returned value of idAlum
      console.log('idAlum: ', idAlum);
      resolve(idAlum);
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
      ActualizarAlumno(idAlum, tutor, result[0].Aula_asignada);
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

async function AdminData(nickname) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT Id_admin, Nombre, Apellido1, Apellido2 FROM ADMINISTRADORES WHERE NICKNAME = ?',
                [nickname] , (error, results, fields) => {
        if (error) {
            console.error('Error guardando token', error);
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