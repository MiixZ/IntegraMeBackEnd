require('dotenv').config();
const mysql = require('mysql2');
const baseDatos = require('./general.js');

async function conectar() {
  return await baseDatos.conectarBD();
}

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
  const connection = await conectar();

  // Primero comprobamos si existe el nickname.
  const [rows, fields] = await connection.execute('SELECT NickName FROM ADMINISTRADORES WHERE NickName = ?',
                          [nickname]
  );

  if (rows.length > 0) {
    throw new Error('Admin with that nickname already exists');
  }

  const OK = connection.execute('CALL InsertarAdministrador(?, ?, ?, ?, ?)',
                         [nombre, apellido1, apellido2, nickname, password]
  );

  return "Admin inserted";
}

async function InsertarAlumno(name, lastname1, lastname2, grade, tutor) {
  const connection = await conectar();

  const [results, fields2] = await connection.execute('CALL InsertarAlumno(?, ?, ?, ?, @idAlum); SELECT @idAlum;',
                             [name, lastname1, lastname2, grade]
  );

  let idAlum = results[1][0]['@idAlum']; // It is scary but it works

  // Cuando no existe el ID del profesor arriba, result[0].Aula_asignada es undefined aunque el alumno se inserta correctamente.
  if (tutor) {
    const [result, fields] = await connection.execute('SELECT Aula_asignada FROM PROFESORES WHERE ID_profesor = ?',
                             [tutor]
    );

    if (result.length > 0 && result[0].Aula_asignada != null) {
      await connection.execute('UPDATE ALUMNOS SET ID_tutor = ?, Aula_asignada = ? WHERE ID_alumno = ?',
            [tutor, result[0].Aula_asignada, idAlum]
      );
    }
  }

  return "Student inserted";
}

async function InsertarAula(numeroAula, capacidad) {
  const connection = await conectar();

  const [results, fields] = await connection.execute(
    'INSERT INTO AULAS (Num_aula, Capacidad) VALUES (?, ?)',
    [numeroAula, capacidad]
  );

  return "Classroom inserted";
}

async function AdminData(nickname) {
  const connection = await conectar();

  const [rows, fields] = await connection.execute(
    'SELECT Id_admin, Nombre, Apellido1, Apellido2 FROM ADMINISTRADORES WHERE NICKNAME = ?',
    [nickname]
  );

  if (rows.length === 0) {
    throw new Error('No admin with that nickname found');
  }

  const adminData = {
    Id_admin: rows[0].Id_admin,
    Name: rows[0].Nombre,
    Lastname1: rows[0].Apellido1,
    Lastname2: rows[0].Apellido2
  };

  return adminData;
}

async function GetPassword(nickname) {
  const connection = await conectar();

  const [rows, fields] = await connection.execute(
      'SELECT Password_hash FROM ADMINISTRADORES WHERE NICKNAME = ? LIMIT 1',
      [nickname]
  );

  if (rows.length === 0) {
      throw new Error('No password found for that nickname');
  }

  const password = rows[0].Password_hash;

  return password;
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