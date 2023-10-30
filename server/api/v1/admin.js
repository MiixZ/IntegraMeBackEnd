const express = require('express');

const bodyParser = require('body-parser');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

const routerAdmin = express.Router();

const database = require('../../database/DB_admins.js');
const { encrypt, compare } = require('../../database/general.js');

const jwt = require('jsonwebtoken');
const secret_admin = process.env.JWT_SECRET_ADMIN;

routerAdmin.post('/insertProf', async (req, res) => {
    try {
        // Coge el token enviado en el header de la solicitud
        const token = req.headers.authorization.split(' ')[1];    
         
        // Verifica si el token ha sido encryptado con el secret_admin
        const payload = jwt.verify(token, secret_admin);

        if (Date.now() > payload.EXP) {
            return res.status(401).json({ error: 'Token expirado' });
        }

        // Obtener datos del cuerpo de la solicitud
        const { DNI, NOMBRE, APELLIDOS, PASSWORD, DIRECCION, TELEFONO } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!DNI || !NOMBRE || !APELLIDOS || !PASSWORD || !DIRECCION || !TELEFONO) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // Encryptar contraseña
        const passwordHash = await encrypt (PASSWORD);

        // Insertar profesor
        const resultado = await database.InsertarProfesor(DNI, NOMBRE, APELLIDOS, passwordHash, DIRECCION, TELEFONO);

        // Enviar respuesta al cliente
        res.json(resultado);
    } catch (error) {
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
});

routerAdmin.post('/insertAlum', async (req, res) => {
    try {
        // Coge el token enviado en el header de la solicitud
        const token = req.headers.authorization.split(' ')[1];
        // Verifica si el token ha sido encryptado con el secret_admin
        const payload = jwt.verify(token, secret_admin);

        if (Date.now() > payload.EXP) {
            return res.status(401).json({ error: 'Token expirado' });
        }

        // Obtener datos del cuerpo de la solicitud
        const { DNI, NOMBRE, APELLIDOS, EDAD, TUTOR, DIRECCION, TELEFONO } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!DNI || !NOMBRE || !APELLIDOS || !EDAD || !TUTOR || !DIRECCION || !TELEFONO) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // Insertar alumno
        const resultado = await database.InsertarAlumno(DNI, NOMBRE, APELLIDOS, EDAD, TUTOR, DIRECCION, TELEFONO);

        // Enviar respuesta al cliente
        res.json(resultado);

    } catch (error) {
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
});

routerAdmin.post('/sesionAdmin/', async (req, res) => {
    try {
        // Obtener datos del cuerpo de la solicitud
        const { DNI, PASSWORD } = req.body;

        const hash = await database.GetPassword(DNI);
        const admin_data = await database.DatosAdmin(DNI);

        if (await compare(PASSWORD, hash[0].Password_hash)) {
            const FECHA = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const token = jwt.sign({ ID_ADMIN: admin_data[0].Id_admin , DNI, NOMBRE: admin_data[0].Nombre, APELLIDOS: admin_data[0].Apellidos, EXP: FECHA}, 
                secret_admin); //{ expiresIn: '1h' });
            // Creamos una fecha de expiración del token (24 horas más al día actual)
            const resultado = await database.InsertarToken(admin_data[0].Id_admin, token, FECHA);
            res.status(200).json({ token });
        } else {
            res.status(401).json({ error: 'Credenciales incorrectas' });
        }
    } catch(error) {
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
});


// METODO PARA REGISTRAR UN ADMINISTRADOR, NO FORMARÁ PARTE DE LA APLICACIÓN
routerAdmin.post('/registAdmin/', async (req, res) => {
    try {
        // Obtener datos del cuerpo de la solicitud
        const { DNI, NOMBRE, APELLIDOS, PASSWORD, DIRECCION, TELEFONO } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!DNI || !NOMBRE || !APELLIDOS || !PASSWORD || !DIRECCION || !TELEFONO) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const passwordHash = await encrypt (PASSWORD);

        // Insertar profesor
        const resultado = await database.InsertarAdmin(DNI, NOMBRE, APELLIDOS, passwordHash, DIRECCION, TELEFONO);

        // Enviar respuesta al cliente
        res.json(resultado);
    } catch (error) {
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
});

module.exports = routerAdmin;