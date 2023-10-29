const express = require('express');

const bodyParser = require('body-parser');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

const routerAdmin = express.Router();

const database = require('../../database/DB_admins.js');
const { encrypt, compare } = require('../../database/general.js');

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

/*
routerAdmin.get('/insert/:DNI/:NOMBRE/:APELLIDOS/:AULA_ASIGNADA/:DIRECCION/:TELEFONO', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const payload = jwt.verify(token, secret);

        // Obtener parámetros
        const DNI = req.params.DNI;
        const NOMBRE = req.params.NOMBRE;
        const APELLIDOS = req.params.APELLIDOS;
        const AULA_ASIGNADA = req.params.AULA_ASIGNADA;
        const DIRECCION = req.params.DIRECCION;
        const TELEFONO = req.params.TELEFONO;

        // Insertar profesor
        const resultado = await database.InsertarProfesor(DNI, NOMBRE, APELLIDOS, AULA_ASIGNADA, DIRECCION, TELEFONO);

        // Enviar respuesta al cliente
        res.json(resultado);
    } catch (error) {
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
});*/

routerAdmin.post('/insertProf', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const payload = jwt.verify(token, secret);

        // Obtener datos del cuerpo de la solicitud
        const { DNI, NOMBRE, APELLIDOS, PASSWORD, AULA_ASIGNADA, DIRECCION, TELEFONO } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!DNI || !NOMBRE || !APELLIDOS || !PASSWORD || !AULA_ASIGNADA || !DIRECCION || !TELEFONO) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const passwordHash = await encrypt (PASSWORD);

        // Insertar profesor
        const resultado = await database.InsertarProfesor(DNI, NOMBRE, APELLIDOS, passwordHash, AULA_ASIGNADA, DIRECCION, TELEFONO);

        // Enviar respuesta al cliente
        res.json(resultado);
    } catch (error) {
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
});

routerAdmin.get('/insert/:DNI/:NOMBRE/:APELLIDOS/:EDAD/:AULA_ASIGNADA/:DIRECCION/:TELEFONO', async (req, res) => {
    try {
        // Obtener parámetros
        const DNI = req.params.DNI;
        const NOMBRE = req.params.NOMBRE;
        const APELLIDOS = req.params.APELLIDOS;
        const AULA_ASIGNADA = req.params.AULA_ASIGNADA;
        const DIRECCION = req.params.DIRECCION;
        const TELEFONO = req.params.TELEFONO;

        // Insertar profesor
        const resultado = await database.InsertarAlumno(DNI, NOMBRE, APELLIDOS, AULA_ASIGNADA, DIRECCION, TELEFONO);

        // Enviar respuesta al cliente
        res.json(resultado);
    } catch (error) {
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
});

routerAdmin.post('/sesionAdmin/', async (req, res) => {
    try{
        // Obtener datos del cuerpo de la solicitud
        const { DNI, PASSWORD } = req.body;

        const hash = await database.GetPassword(DNI);
        const admin_data = await database.DatosAdmin(DNI);

        if (await compare(PASSWORD, hash[0].Password_hash)) {
            const token = jwt.sign({ ID_ADMIN: admin_data[0].Id_admin , DNI, NOMBRE: admin_data[0].Nombre, APELLIDOS: admin_data[0].Apellidos}, 
                secret); //{ expiresIn: '1h' });
            const FECHA = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const resultado = await database.InsertarToken(admin_data[0].Id_admin, token, FECHA);
            res.status(200).json({ token });
        }else{
            res.status(401).json({ error: 'Credenciales incorrectas' });
        }
    }catch(error){
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
});

routerAdmin.post('/registAdmin/', async (req, res) => {
    try {
        //const token = req.headers.authorization.split(' ')[1];
        //const payload = jwt.verify(token, secret);

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