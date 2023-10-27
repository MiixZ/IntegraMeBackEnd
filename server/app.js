'use strict';

const database = require('./database.js');
const express = require('express');
const mysql = require('mysql2');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

const connection = mysql.createConnection({
       host: '34.175.9.11',
       port: 33060,
       user: 'root',
       password: 'integrame',
       database: 'INTEGRAME'
});

// App
const app = express();
app.get('/', async (req, res) => {
    try {
      // Conectar a la base de datos
      await database.conectarBD();
  
      // Obtener profesores
      const profesores = await database.obtenerProfesores();
  
      // Enviar respuesta al cliente
      res.send('todo ok');
    } catch (error) {
      console.error('Error en la solicitud:', error);
      res.status(500).json({ error: 'Error en la solicitud' });
    } finally {
      // Desconectar de la base de datos después de cada solicitud
      await database.desconectarBD();
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});       