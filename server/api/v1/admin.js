const express = require('express');
const routerAdmin = express.Router();

const database = require('../../database/DB_admins.js');

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

routerAdmin.get('/insert/:DNI/:NOMBRE/:APELLIDOS/:AULA_ASIGNADA/:DIRECCION/:TELEFONO', async (req, res) => {
    try {
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

module.exports = routerAdmin;