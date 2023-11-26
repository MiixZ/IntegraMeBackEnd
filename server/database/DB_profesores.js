require('dotenv').config();
const baseDatos = require('./general.js');

async function conectar() {
  return await baseDatos.conectarBD();
}

async function TeacherData(nickname) {
  const connection = await conectar();

  const [rows, fields] = await connection.execute(
    'SELECT ID_profesor, Nombre, Apellido1, Apellido2, Aula_asignada FROM PROFESORES WHERE NickName = ?',
    [nickname]
  );

  const id = rows[0].ID_profesor;
  const name = rows[0].Nombre;
  const lastname1 = rows[0].Apellido1;
  const lastname2 = rows[0].Apellido2;
  const classroom = rows[0].Aula_asignada;

  return [id, name, lastname1, lastname2, classroom];
}

async function getPassword(nickname) {
  const connection = await conectar();

  const [rows, fields] = await connection.execute(
    'SELECT Password_hash FROM PROFESORES WHERE NickName = ? LIMIT 1',
    [nickname]
  );

  const password = rows[0].Password_hash;

  return password;
}

async function getTeachers() {
  const connection = await conectar();

  const [rows, fields] = await connection.execute(
    'SELECT * FROM PROFESORES'
  );

  const teachers = rows.map(result => result);

  return teachers;
}

async function getStudent(idStudent) {
  const connection = await conectar();

  const [rows, fields] = await connection.execute(
    'SELECT * FROM ALUMNOS WHERE ID_alumno = ?',
    [idStudent]
  );

  const student = rows.map(result => result);

  return student;
}

async function registPerfilStudent(idStudent, nickname, avatarId, idSet, passwordFormat, password){
  const connection = await conectar();

  await connection.execute(
    'INSERT INTO PERFIL_ALUMOS (ID_alumno, NickName, Avatar_id, ID_set, FormatoPassword, Password_hash) VALUES (?, ?, ?, ?, ?, ?)',
    [idStudent, nickname, avatarId, idSet, passwordFormat, password]
  );
}

async function registStudentFormats (idStudent, contentAdaptationFormats) {
  const connection = await conectar();

  for (let format of contentAdaptationFormats) {
    await connection.execute(
      'INSERT INTO FORMATOS_ALUMNOS (ID_alumno, Formato) VALUES (?, ?)',
      [idStudent, format]
    );
  }
}

async function registStudentInteractions (idStudent, interactionMethods) {
  const connection = await conectar();

  for (let interaction of interactionMethods) {
    await connection.execute(
      'INSERT INTO INTERACCION_ALUMNOS (ID_alumno, Interaccion) VALUES (?, ?)',
      [idStudent, interaction]
    );
  }
}

async function registContentProfile(idStudent, contentAdaptationFormats, interactionMethods) {
  await registStudentFormats(idStudent, contentAdaptationFormats);
  await registStudentInteractions(idStudent, interactionMethods);
}

module.exports = {
    TeacherData,
    getPassword,
    getTeachers,
    registPerfilStudent,
    getStudent,
    registContentProfile
};

