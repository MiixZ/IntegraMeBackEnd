const express = require('express');
const routerv1 = express.Router();

const database = require('../../database.js');

routerv1.get('/', (req, res) => {
    res.json({ message: 'esta es la api principal de la versión 1. na que aserle' });
});

routerv1.get('/profesores', async (req, res) => {
    try {
        // Conectar a la base de datos
        await database.conectarBD();

        // Obtener profesores
        const profesores = await database.obtenerProfesores();

        // Enviar respuesta al cliente
        res.json(profesores);
    } catch (error) {
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    } finally {
        // Desconectar de la base de datos después de cada solicitud
        await database.desconectarBD();
    }
});

module.exports = routerv1;