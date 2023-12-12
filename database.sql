CREATE TABLE AULAS (
    Num_aula INT PRIMARY KEY,
    Capacidad INT NOT NULL
);

CREATE TABLE PROFESORES (   /*HA SIDO ACTUALIZADA, MEJOR BORRAR Y VOLVER A CREAR*/
    ID_profesor INT PRIMARY KEY,
    Nombre VARCHAR(20) NOT NULL,
    Apellido1 VARCHAR(50) NOT NULL,
    Apellido2 VARCHAR(50) NOT NULL,
    NickName VARCHAR(20) NOT NULL UNIQUE,
    Avatar_id INT(255) NOT NULL,
    Password_hash VARCHAR(255) NOT NULL,
    Aula_asignada INT DEFAULT NULL,
    FOREIGN KEY (Aula_asignada) REFERENCES AULAS(Num_Aula) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_profesor) REFERENCES USUARIOS(ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Avatar_id) REFERENCES IMAGENES(ID_imagen) ON DELETE CASCADE ON UPDATE CASCADE,
);

CREATE TABLE ALUMNOS (
    ID_alumno INT PRIMARY KEY,
    Nombre VARCHAR(20) NOT NULL,
    Apellido1 VARCHAR(50) NOT NULL,
    Apellido2 VARCHAR(50) NOT NULL,
    Curso INT DEFAULT NULL,
    ID_tutor INT DEFAULT NULL,
    Aula_asignada INT DEFAULT NULL,
    FOREIGN KEY (Aula_asignada) REFERENCES AULAS(Num_Aula) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_tutor) REFERENCES PROFESORES(ID_profesor) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_alumno) REFERENCES USUARIOS(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE PERFIL_ALUMNOS(
    ID_alumno INT PRIMARY KEY,
    NickName VARCHAR(20) NOT NULL,
    Avatar_id INT(255) NOT NULL,
    ID_set INT DEFAULT NULL,
    FormatoPassword ENUM('TextAuth', 'ImageAuth') NOT NULL,
    Password_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (ID_alumno) REFERENCES ALUMNOS(ID_alumno) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Avatar_id) REFERENCES IMAGENES(ID_imagen) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_set) REFERENCES CONJUNTOS(ID_set) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE INTERACCION_ALUMNOS (  
    ID_alumno INT NOT NULL,
    Nom_interaccion VARCHAR(20) NOT NULL,
    PRIMARY KEY (ID_alumno, Nom_interaccion),
    FOREIGN KEY (ID_alumno) REFERENCES PERFIL_ALUMNOS(ID_alumno) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Nom_interaccion) REFERENCES METODOS_INTERACCION(Tipo_interaccion) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE FORMATOS_ALUMNOS ( 
    ID_alumno INT NOT NULL,
    Nom_formato VARCHAR(20) NOT NULL,
    PRIMARY KEY (ID_alumno, Nom_formato),
    FOREIGN KEY (ID_alumno) REFERENCES PERFIL_ALUMNOS(ID_alumno) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Nom_formato) REFERENCES FORMATOS(Tipo_formato) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE FORMATOS (
    Tipo_formato VARCHAR(20) PRIMARY KEY,
    Descripcion VARCHAR(100) NOT NULL
);

CREATE TABLE METODOS_INTERACCION(
    Tipo_interaccion VARCHAR(20) PRIMARY KEY,
    Descripcion VARCHAR(100) NOT NULL
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
    ID_plantilla INT AUTO_INCREMENT PRIMARY KEY;
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

CREATE TABLE IMAGENES (
    ID_imagen INT AUTO_INCREMENT PRIMARY KEY,
    Descripcion VARCHAR(100) NOT NULL,
    Tipo VARCHAR(20) DEFAULT NULL
);

CREATE TABLE CONJUNTOS (
    ID_set INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR (20) NOT NULL,
    Steps INT NOT NULL,
    Descripcion VARCHAR(100) NOT NULL
);

CREATE TABLE IMAGENES_SET (
    ID_imagen INT NOT NULL,
    ID_set INT NOT NULL,
    PRIMARY KEY (ID_imagen, ID_set),
    FOREIGN KEY (ID_imagen) REFERENCES IMAGENES(ID_imagen) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_set) REFERENCES CONJUNTOS(ID_set) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE MATERIALES (
    ID_material INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(20) NOT NULL,
    Descripcion VARCHAR(100) NOT NULL,
    Foto_material INT NOT NULL,
    Foto_propiedades INT DEFAULT NULL,
    FOREIGN KEY (Foto_material) REFERENCES IMAGENES(ID_imagen) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Foto_propiedades) REFERENCES IMAGENES(ID_imagen) ON DELETE CASCADE ON UPDATE CASCADE
);

/*
Campo "Propiedad"
*/
ALTER TABLE MATERIALES
ADD Propiedad VARCHAR(255) DEFAULT NULL;
/*-----------------------------*/

CREATE TABLE TAREA (
    ID_tarea INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(20) NOT NULL,
    Descripcion VARCHAR(100) NOT NULL,
    Dificultad INT NOT NULL,
    Estado ENUM('Completed', 'Pending', 'Failed') DEFAULT 'Pending',
    COLUMN Steps INT DEFAULT NULL,
    Img_tarea INT NOT NULL,
    ID_alumno INT NOT NULL,
    Supervisor INT NOT NULL,
    Tipo_tarea ENUM('GenericTask', 'MenuTask', 'MaterialTask') NOT NULL,
    Steps INT DEFAULT NULL,
    Recompensa VARCHAR(255),    -- Campo para la recompensa (Si es texto es normal, si es imagen el la id de la imagen...)
    Recompensa_tipo ENUM('String', 'Imagenes', 'Videos', 'Audios'),
    FOREIGN KEY (Img_tarea) REFERENCES IMAGENES(ID_imagen) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Supervisor) REFERENCES PROFESORES(ID_profesor) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_alumno) REFERENCES ALUMNOS(ID_alumno) ON DELETE CASCADE ON UPDATE CASCADE
);

/*
Intermediario entre material y tarea (para tarea de tipo material)
*/
CREATE TABLE MATERIALES_TAREA (     /*HAY QUE CREARLE SU PROCEDURE AUTOINCREMENTAL, ESCRIBIR BIEN LOS CAMPOS Y VLVER A CREARLA*/
    Num_peticion INT NOT NULL,
    ID_material INT NOT NULL,
    ID_tarea INT NOT NULL,
    Cantidad INT,
    Esta_entregado BOOLEAN,
    Imagen_peticion INT NOT NULL FOREIGN KEY REFERENCES IMAGENES(ID_imagen) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (num_peticion, ID_tarea),
    FOREIGN KEY (ID_material) REFERENCES MATERIALES(ID_material) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_tarea) REFERENCES TAREA(ID_tarea) ON DELETE CASCADE ON UPDATE CASCADE
);

/*--------------------------------------*/

CREATE TABLE PASO_GENERAL (
    ID_tarea INT NOT NULL,
    ID_paso INT NOT NULL,
    Nombre VARCHAR(20) NOT NULL,
    Descripcion VARCHAR(100) NOT NULL,
    Imagen_tarea INT NOT NULL,
    Audio_tarea INT NOT NULL,
    Video_tarea INT NOT NULL,
    Texto_tarea VARCHAR(100) NOT NULL,
    Estado ENUM('true', 'false') DEFAULT 'false',
    FOREIGN KEY (ID_tarea) REFERENCES TAREA(ID_tarea) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (ID_Tarea, ID_paso),
    FOREIGN KEY (Imagen_tarea) REFERENCES IMAGENES(ID_imagen) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Audio_tarea) REFERENCES AUDIOS(ID_audio) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Video_tarea) REFERENCES VIDEOS(ID_video) ON DELETE CASCADE ON UPDATE CASCADE
);

/*
Agregado este alter para que funcione la agregación de pasos
*/
ALTER TABLE PASO_GENERAL
ADD INDEX idx_ID_paso (ID_paso);
/*--------------------------------------*/

CREATE TABLE VIDEOS (
    ID_video INT AUTO_INCREMENT PRIMARY KEY,
    Descripcion VARCHAR(100) NOT NULL,
    Tipo VARCHAR(20) DEFAULT NULL
);

CREATE TABLE AUDIOS (
    ID_audio INT AUTO_INCREMENT PRIMARY KEY,
    Descripcion VARCHAR(100) NOT NULL,
    Tipo VARCHAR(20) DEFAULT NULL
);

/* Agregar url */

ALTER TABLE IMAGENES
ADD imageUrl VARCHAR(255);

ALTER TABLE VIDEO
ADD videoUrl VARCHAR(255);

ALTER TABLE AUDIO
ADD audioUrl VARCHAR(255);

/*
AGREGADO A PARTIR DE AQUÍ
*/

CREATE TABLE IMAGENES_PASO (    /*HAY QUE CREARLE SU PROCEDURE AUTOINCREMENTAL*/
    ID_paso INT NOT NULL,
    ID_imagen INT NOT NULL,
    PRIMARY KEY (ID_paso, ID_imagen),
    FOREIGN KEY (ID_paso) REFERENCES PASO_GENERAL(ID_paso) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_imagen) REFERENCES IMAGENES(ID_imagen) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE VIDEOS_PASO (
    ID_paso INT NOT NULL,
    ID_video INT NOT NULL,
    PRIMARY KEY (ID_paso, ID_video),
    FOREIGN KEY (ID_paso) REFERENCES PASO_GENERAL(ID_paso) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_video) REFERENCES VIDEOS(ID_video) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE AUDIOS_PASO (
    ID_paso INT NOT NULL,
    ID_audio INT NOT NULL,
    PRIMARY KEY (ID_paso, ID_audio),
    FOREIGN KEY (ID_paso) REFERENCES PASO_GENERAL(ID_paso) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_audio) REFERENCES AUDIOS(ID_audio) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE PROFESORES_TAREA (
    ID_profesor INT NOT NULL,
    ID_tarea INT NOT NULL,
    PRIMARY KEY (ID_profesor, ID_tarea),
    FOREIGN KEY (ID_profesor) REFERENCES PROFESORES(ID_profesor) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ID_Tarea) REFERENCES TAREA(ID_tarea) ON DELETE CASCADE ON UPDATE CASCADE
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
CREATE PROCEDURE InsertPaso(IN Nombre VARCHAR(20), IN Descripcion VARCHAR(100), IN Imagen_tarea INT, IN Audio_tarea INT, IN Video_tarea INT, IN Texto_tarea VARCHAR(100), IN ID_tarea INT)
BEGIN
    DECLARE paso_id INT;

    SELECT COALESCE(MAX(ID_paso), 0) + 1 INTO paso_id FROM PASO_GENERAL WHERE ID_tarea = ID_tarea;

    INSERT INTO PASO_GENERAL(ID_tarea, ID_paso, Nombre, Descripcion, Imagen_tarea, Audio_tarea, Video_tarea, Texto_tarea, Estado)
    VALUES (ID_tarea, paso_id, Nombre, Descripcion, Imagen_tarea, Audio_tarea, Video_tarea, Texto_tarea, 'false');
END//
DELIMITER ;


DELIMITER //
CREATE PROCEDURE InsertarAlumno(IN Nombre_param VARCHAR(20), IN Apellidos_param1 VARCHAR(50), IN Apellidos_param2 VARCHAR(50), IN Curso_param INT, OUT last_id_param INT)
BEGIN
    -- Inserción en la tabla USUARIOS
    INSERT INTO USUARIOS (Tipo_usuario)
    VALUES ('Alumno');

    -- Obtener el ID del último registro insertado
    SET last_id_param = LAST_INSERT_ID();

    -- Inserción en la tabla ALUMNOS
    INSERT INTO ALUMNOS (ID_alumno, Nombre, Apellido1, Apellido2, Curso)
    VALUES (last_id_param, Nombre_param, Apellidos_param1, Apellidos_param2, Curso_param);
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
VALUES ('98765432D', 'Maria', 'López García', 18, 1, 'Calle Secundaria 456', 123456789);

INSERT INTO FORMATOS_ALUMNOS(ID_alumno, Nom_formato)
VALUES 
(6, 'Text'),
(6, 'Image');

INSERT INTO PERFIL_ALUMNOS (ID_alumno, Avatar_id, FormatoPassword, Password_hash)
VALUES (6, 1, 'TextAuth', '$2b$10$tiSJ79Iy/Moga5gsTQFmcuuHdky8RB5.5Uk75aeb5rQvcQs5Xdd5e');

INSERT INTO IMAGENES (ID_imagen, Descripcion, Img_path, Tipo) 
VALUES (1, 'Bob Esponja', '1', 'AVATAR');

INSERT INTO TAREA(Nombre, Descripcion, Dificultad, Img_tarea, ID_alumno, Supervisor, Tipo_tabla)
VALUES ('Hacer cama', 'La tarea consiste en hacer la cama', 1, 1, 5, 8, 'GenericTask');

ALTER TABLE PROFESORES
ADD COLUMN Avatar_id INT(255),
ADD FOREIGN KEY (Avatar_id) REFERENCES IMAGENES(ID_imagen) ON DELETE CASCADE ON UPDATE CASCADE;