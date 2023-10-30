CREATE TABLE AULAS (
    Num_aula INT PRIMARY KEY,
    Capacidad INT NOT NULL
);

CREATE TABLE PROFESORES (
    ID_profesor INT PRIMARY KEY,
    DNI VARCHAR(9) NOT NULL,
    Nombre VARCHAR(20) NOT NULL,
    Apellidos VARCHAR(50) NOT NULL,
    Password_hash VARCHAR(255) NOT NULL,
    Aula_asignada INT DEFAULT NULL,
    Direccion VARCHAR(50) NOT NULL,
    Num_telf INT NOT NULL,
    FOREIGN KEY (Aula_asignada) REFERENCES AULAS(Num_Aula) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ALUMNOS (
    ID_alumno INT PRIMARY KEY,
    DNI VARCHAR(9) NOT NULL,
    Nombre VARCHAR(20) NOT NULL,
    Apellidos VARCHAR(50) NOT NULL,
    Edad INT NOT NULL,
    ID_tutor INT DEFAULT NULL,
    Aula_asignada INT DEFAULT NULL,
    Direccion VARCHAR(50) NOT NULL,
    Num_telf INT NOT NULL,
    FOREIGN KEY (Aula_asignada) REFERENCES AULAS(Num_Aula) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_tutor) REFERENCES PROFESORES(ID_profesor) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ADMINISTRADORES (
    ID_admin INT PRIMARY KEY,
    DNI VARCHAR(9) NOT NULL,
    Nombre VARCHAR(20) NOT NULL,
    Apellidos VARCHAR(50) NOT NULL,
    Password_hash VARCHAR(255) NOT NULL,
    Direccion VARCHAR(50) NOT NULL,
    Num_telf INT NOT NULL
);

CREATE TABLE USUARIOS (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    DNI_Usuario VARCHAR(9) NOT NULL UNIQUE,
    Tipo_usuario ENUM('Alumno', 'Profesor', 'Administrador') NOT NULL
    --FOREIGN KEY (DNI_usuario) REFERENCES PROFESORES(DNI) ON DELETE CASCADE ON UPDATE CASCADE,
    --FOREIGN KEY (DNI_usuario) REFERENCES ADMINISTRADORES(DNI) ON DELETE CASCADE ON UPDATE CASCADE,
    --FOREIGN KEY (DNI_usuario) REFERENCES ALUMNOS(DNI) ON DELETE CASCADE ON UPDATE CASCADE
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
    INSERT INTO USUARIOS (DNI_Usuario, Tipo_usuario) VALUES (NEW.DNI, 'Profesor');
END;
//
DELIMITER;

-- Crear un disparador para insertar automáticamente en la tabla usuarios cuando se añade un alumno
DELIMITER //
CREATE TRIGGER Alumno_insert_trigger
AFTER INSERT ON ALUMNOS
FOR EACH ROW
BEGIN
    INSERT INTO USUARIOS (DNI_Usuario, Tipo_usuario) VALUES (NEW.DNI, 'Alumno');
END;
//
DELIMITER;

-- Crear un disparador para insertar automáticamente en la tabla usuarios cua   ndo se añade un Administrador
DELIMITER //
CREATE TRIGGER Administrador_insert_trigger
AFTER INSERT ON ADMINISTRADOR
FOR EACH ROW
BEGIN
    INSERT INTO USUARIOS (DNI_Usuario, Tipo_usuario) VALUES (NEW.DNI, 'Administrador');
END;
//
DELIMITER;


DELIMITER //

CREATE PROCEDURE ActualizarIDAlumno(IN DNI_param VARCHAR(9), IN nuevo_ID_alumno_param INT)
BEGIN
    -- Actualización en la tabla ALUMNOS
    UPDATE ALUMNOS SET ID_alumno = nuevo_ID_alumno_param WHERE DNI = DNI_param;
END //

DELIMITER ;

--IMPORTANTE --> Los delimiters cambian los ";" por "//" y viceversa

DELIMITER //

CREATE PROCEDURE InsertarAlumno(IN DNI_param VARCHAR(9), IN Nombre_param VARCHAR(20), IN Apellidos_param VARCHAR(50), IN Edad_param INT, IN Direccion_param VARCHAR(50), IN Num_Telf_param INT)
BEGIN
    DECLARE last_id INT;

    -- Inserción en la tabla USUARIOS
    INSERT INTO USUARIOS (DNI_Usuario, Tipo_usuario)
    VALUES (DNI_param, 'Alumno');

    SELECT ID INTO last_id FROM USUARIOS WHERE DNI_Usuario = DNI_param;

    -- Inserción en la tabla ALUMNOS
    INSERT INTO ALUMNOS (DNI, ID_alumno, Nombre, Apellidos, Edad, Direccion, Num_telf)
    VALUES (DNI_param, last_id, Nombre_param, Apellidos_param, Edad_param, Direccion_param, Num_Telf_param);
END //

DELIMITER ;


DELIMITER //

CREATE PROCEDURE InsertarProfesor(IN DNI_param VARCHAR(9), IN Nombre_param VARCHAR(20), IN Apellidos_param VARCHAR(50), IN Password_param VARCHAR(255), IN Direccion_param VARCHAR(50), IN Num_Telf_param INT)
BEGIN
    DECLARE last_id INT;

    -- Inserción en la tabla USUARIOS
    INSERT INTO USUARIOS (DNI_Usuario, Tipo_usuario)
    VALUES (DNI_param, 'Profesor');

    SELECT ID INTO last_id FROM USUARIOS WHERE DNI_Usuario = DNI_param;

    -- Inserción en la tabla PROFESORES
    INSERT INTO PROFESORES (DNI, ID_profesor, Nombre, Apellidos, Password_hash, Direccion, Num_telf)
    VALUES (DNI_param, last_id, Nombre_param, Apellidos_param, Password_param, Direccion_param, Num_Telf_param);
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE InsertarAdministrador(IN DNI_param VARCHAR(9), IN Nombre_param VARCHAR(20), IN Apellidos_param VARCHAR(50), IN Password_param VARCHAR(255), IN Direccion_param VARCHAR(50), IN Num_Telf_param INT)
BEGIN
    DECLARE last_id INT;

    -- Inserción en la tabla USUARIOS
    INSERT INTO USUARIOS (DNI_Usuario, Tipo_usuario)
    VALUES (DNI_param, 'Administrador');

    SELECT ID INTO last_id FROM USUARIOS WHERE DNI_Usuario = DNI_param;

    -- Inserción en la tabla ADMINISTRADORES
    INSERT INTO ADMINISTRADORES (DNI, ID_admin, Nombre, Apellidos, Password_hash, Direccion, Num_telf)
    VALUES (DNI_param, last_id, Nombre_param, Apellidos_param, Password_param, Direccion_param, Num_Telf_param);
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