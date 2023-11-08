CREATE TABLE AULAS (
    Num_aula INT PRIMARY KEY,
    Capacidad INT NOT NULL
);

CREATE TABLE PROFESORES (
    ID_profesor INT PRIMARY KEY,
    Nombre VARCHAR(20) NOT NULL,
    Apellido1 VARCHAR(50) NOT NULL,
    Apellido2 VARCHAR(50) NOT NULL,
    NickName VARCHAR(20) NOT NULL UNIQUE,
    Password_hash VARCHAR(255) NOT NULL,
    Aula_asignada INT DEFAULT NULL,
    FOREIGN KEY (Aula_asignada) REFERENCES AULAS(Num_Aula) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_profesor) REFERENCES USUARIOS(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ALUMNOS (
    ID_alumno INT PRIMARY KEY,
    Nombre VARCHAR(20) NOT NULL,
    Apellido1 VARCHAR(50) NOT NULL,
    Apellido2 VARCHAR(50) NOT NULL,
    NickName VARCHAR(20),
    Curso INT DEFAULT NULL,
    ID_tutor INT DEFAULT NULL,
    Aula_asignada INT DEFAULT NULL,
    FOREIGN KEY (Aula_asignada) REFERENCES AULAS(Num_Aula) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_tutor) REFERENCES PROFESORES(ID_profesor) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_alumno) REFERENCES USUARIOS(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE PERFIL_ALUMNOS (
    ID_alumno INT PRIMARY KEY,
    FormatoPassword ENUM('TextAuth', 'ImageAuth') NOT NULL,
    Password_hash VARCHAR(255) NOT NULL,
    Metodos_iteracion_alumno 
    FOREIGN KEY (ID_admin) REFERENCES USUARIOS(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ITERACCION_ALUMNOS (
    
);

CREATE TABLE FORMATOS (
    Tipo_formato VARCHAR(20) PRIMARY KEY;
);

CREATE TABLE METODOS_INTERACCION(

);

CREATE TABLE ADMINISTRADORES (
    ID_admin INT PRIMARY KEY,
    Nombre VARCHAR(20) NOT NULL,
    Apellido1 VARCHAR(50) NOT NULL,
    Apellido2 VARCHAR(50) NOT NULL,
    NickName VARCHAR(20) NOT NULL UNIQUE,
    Password_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (ID_admin) REFERENCES USUARIOS(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE USUARIOS (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Tipo_usuario ENUM('Alumno', 'Profesor', 'Administrador') NOT NULL
);

CREATE TABLE PLANTILLATAREA (
    ID_Plantilla INT AUTO_INCREMENT PRIMARY KEY;
    Nombre VARCHAR(20) NOT NULL;
    Descripcion VARCHAR(100) NOT NULL;
    Dificultad INT NOT NULL;
);

CREATE TABLE TOKENS (
    ID_usuario INT,
    Token VARCHAR(512) PRIMARY KEY NOT NULL,
    Expiration_date TIMESTAMP,
    FOREIGN KEY (ID_usuario) REFERENCES USUARIOS(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Crear un disparador para insertar automáticamente en la tabla usuarios cuando se añade un profesor
DELIMITER //
CREATE TRIGGER Profesor_insert_trigger
AFTER INSERT ON PROFESORES
FOR EACH ROW
BEGIN
    INSERT INTO USUARIOS (Tipo_usuario) VALUES ('Profesor');
END;
//
DELIMITER;

-- Crear un disparador para insertar automáticamente en la tabla usuarios cuando se añade un alumno
DELIMITER //
CREATE TRIGGER Alumno_insert_trigger
AFTER INSERT ON ALUMNOS
FOR EACH ROW
BEGIN
    INSERT INTO USUARIOS (Tipo_usuario) VALUES ('Alumno');
END;
//
DELIMITER;

-- Crear un disparador para insertar automáticamente en la tabla usuarios cua   ndo se añade un Administrador
DELIMITER //
CREATE TRIGGER Administrador_insert_trigger
AFTER INSERT ON ADMINISTRADOR
FOR EACH ROW
BEGIN
    INSERT INTO USUARIOS (Tipo_usuario) VALUES ('Administrador');
END;
//
DELIMITER;

--IMPORTANTE --> Los delimiters cambian los ";" por "//" y viceversa

DELIMITER //

CREATE PROCEDURE InsertarAlumno(IN Nombre_param VARCHAR(20), IN Apellidos_param1 VARCHAR(50), IN Apellidos_param2 VARCHAR(50), IN Curso_param INT, OUT last_id_param INT)
BEGIN
    -- Inserción en la tabla USUARIOS
    INSERT INTO USUARIOS (Tipo_usuario)
    VALUES ('Alumno');

    -- Obtener el ID del último registro insertado
    SET last_id_param = LAST_INSERT_ID();

    -- Inserción en la tabla ALUMNOS
    INSERT INTO ALUMNOS (ID_alumno, Nombre, Apellido1, Apellido2, NickName, Curso)
    VALUES (last_id_param, Nombre_param, Apellidos_param1, Apellidos_param2, CONCAT(Nombre_param, SUBSTRING(Apellidos_param1, 1, 1), SUBSTRING(Apellidos_param2, 1, 1)), Curso_param);
END //

DELIMITER ;


DELIMITER //

CREATE PROCEDURE InsertarProfesor(IN Nombre_param VARCHAR(20), IN Apellidos_param1 VARCHAR(50), IN Apellidos_param2 VARCHAR(50), IN Nickname VARCHAR(20), IN Password_param VARCHAR(255))
BEGIN
    DECLARE last_id INT;

    -- Inserción en la tabla USUARIOS
    INSERT INTO USUARIOS (Tipo_usuario)
    VALUES ('Profesor');

    SET last_id = LAST_INSERT_ID();

    -- Inserción en la tabla PROFESORES
    INSERT INTO PROFESORES (ID_profesor, Nombre, Apellido1, Apellido2, NickName, Password_hash)
    VALUES (last_id, Nombre_param, Apellidos_param1, Apellidos_param2, Nickname, Password_param);

    RETURN last_id;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE InsertarAdministrador(IN Nombre_param VARCHAR(20), IN Apellidos_param1 VARCHAR(50), IN Apellidos_param2 VARCHAR(50), IN Nickname VARCHAR(20), IN Password_param VARCHAR(255))
BEGIN
    DECLARE last_id INT;

    -- Inserción en la tabla USUARIOS
    INSERT INTO USUARIOS (Tipo_usuario)
    VALUES ('Administrador');

    SET last_id = LAST_INSERT_ID();

    -- Inserción en la tabla ADMINISTRADORES
    INSERT INTO ADMINISTRADORES (ID_admin, Nombre, Apellido1, Apellido2, NickName, Password_hash)
    VALUES (last_id, Nombre_param, Apellidos_param1, Apellidos_param2, Nickname, Password_param);

END //

DELIMITER ;

/*
DELIMITER //
CREATE TRIGGER before_insert_alumno
BEFORE INSERT ON ALUMNOS
FOR EACH ROW
BEGIN
    DECLARE profesor_aula INT;

    -- Obtener el valor de la columna 'Aula_asignada' del tutor asociado al alumno
    SELECT Aula_asignada INTO profesor_aula
    FROM PROFESORES
    WHERE ID_profesor = NEW.ID_tutor;

    -- Verificar si 'Aula_asignada' es nula en el profesor
    IF profesor_aula IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede insertar el alumno, el tutor no tiene aula asignada, crack.';
    END IF;
END;
//
DELIMITER ;
--Este trigger se ejecutará antes de realizar una inserción en la tabla de ALUMNOS y verificará si el tutor asociado tiene la columna "Aula_asignada" no nula.
--Si la columna es nula, se generará un error y la inserción del alumno se detendrá.
--Asegúrate de ajustar el código según la estructura real de tus tablas y las relaciones entre ellas.
*/

INSERT INTO ALUMNOS (DNI, Nombre, Apellidos, Edad, Aula_asignada, Direccion, Num_Telf)
VALUES
('98765432D', 'Maria', 'López García', 18, 1, 'Calle Secundaria 456', 123456789);