CREATE TABLE AULAS (
    Num_Aula INT PRIMARY_KEY;
    Capacidad INT NOT NULL;
    Edad INT NOT NULL;
);

CREATE TABLE PROFESORES (
    DNI VARCHAR(9) PRIMARY_KEY;
    Nombre VARCHAR(20) NOT NULL;
    Apellidos VARCHAR(50) NOT NULL;
    Aula_asignada INT NOT NULL;
    Direccion VARCHAR(50) NOT NULL;
    Num_Telf INT NOT NULL;
    FOREIGN KEY (Aula_asignada) REFERENCES AULAS(Num_Aula) ON DELETE CASCADE ON UPDATE CASCADE,
);

CREATE TABLE ALUMNOS (
    DNI VARCHAR(9) PRIMARY_KEY;
    ID_alumno INT;
    Nombre VARCHAR(20) NOT NULL;
    Apellidos VARCHAR(50) NOT NULL;
    Direccion VARCHAR(50) NOT NULL;
    Num_Telf INT NOT NULL;
);

CREATE TABLE ADMINISTRADOR (
    DNI VARCHAR(9) PRIMARY_KEY;
    Nombre VARCHAR(20) NOT NULL;
    Apellidos VARCHAR(50) NOT NULL;
    Direccion VARCHAR(50) NOT NULL;
    Num_Telf INT NOT NULL;
);

CREATE TABLE USUARIOS (
    ID INT AUTO_INCREMENT PRIMARY KEY;
    DNI_Usuario VARCHAR(9) NOT NULL;
    Tipo_usuario ENUM('Alumno', 'Profesor', 'Administrador') NOT NULL;,
    FOREIGN KEY (DNI_usuario) REFERENCES PROFESORES(DNI) ON DELETE CASCADE ON UPDATE CASCADE,   --ESTA MAAAAAAAAAAAAAL
    FOREIGN KEY (DNI_usuario) REFERENCES ADMINISTRADORES(DNI) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (DNI_usuario) REFERENCES ALUMNOS(DNI) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE PLANTILLATAREA (
    ID_Plantilla INT AUTO_INCREMENT PRIMARY KEY;
    Nombre VARCHAR(20) NOT NULL;
    Descripcion VARCHAR(100) NOT NULL;
    Dificultad INT NOT NULL;
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
    UPDATE ALUMNOS SET ID_alumno = LAST_INSERT_ID() WHERE DNI = NEW.DNI;
END;
//
DELIMITER;

-- Crear un disparador para insertar automáticamente en la tabla usuarios cuando se añade un Administrador
DELIMITER //
CREATE TRIGGER Administrador_insert_trigger
AFTER INSERT ON ADMINISTRADOR
FOR EACH ROW
BEGIN
    INSERT INTO USUARIOS (DNI_Usuario, Tipo_usuario) VALUES (NEW.DNI, 'Administrador');
END;
//
DELIMITER;