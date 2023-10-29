const express = require('express');
const routerProfesores = express.Router();

const database = require('../../database/DB_profesores.js');

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

routerProfesores.get('/get', async (req, res) => {
    try {
        // Obtener profesores
        const profesores = await database.obtenerProfesores();

        // Enviar respuesta al cliente
        res.json(profesores);
    } catch (error) {
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
});



module.exports = routerProfesores;