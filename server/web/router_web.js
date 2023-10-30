const express = require('express');
const routerWeb = express.Router();

routerWeb.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registro</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
    
        form {
          max-width: 400px;
          margin: auto;
        }
    
        label {
          display: block;
          margin-bottom: 8px;
        }
    
        input {
          width: 100%;
          padding: 8px;
          margin-bottom: 16px;
          box-sizing: border-box;
        }
    
        button {
          background-color: #4CAF50;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
    
        button:hover {
          background-color: #45a049;
        }
      </style>
    </head>
    <body>
    
      <h2>Registro</h2>
    
      <!-- Formulario para registrar profesor -->
      <form id="profesorForm">
        <h3>Registrar Profesor</h3>
        <label for="profesorNombre">Nombre:</label>
        <input type="text" id="profesorNombre" name="profesorNombre" required>
    
        <label for="profesorMateria">Materia:</label>
        <input type="text" id="profesorMateria" name="profesorMateria" required>
    
        <button type="button" onclick="registrarProfesor()">Registrar Profesor</button>
      </form>
    
      <!-- Formulario para registrar alumno -->
      <form id="alumnoForm">
        <h3>Registrar Alumno</h3>
        <label for="alumnoNombre">Nombre:</label>
        <input type="text" id="alumnoNombre" name="alumnoNombre" required>
    
        <label for="alumnoEdad">Edad:</label>
        <input type="number" id="alumnoEdad" name="alumnoEdad" required>
    
        <button type="button" onclick="registrarAlumno()">Registrar Alumno</button>
      </form>
    
      <!-- Formulario para registrar aula -->
      <form id="aulaForm">
        <h3>Registrar Aula</h3>
        <label for="aulaNumero">Número de Aula:</label>
        <input type="text" id="aulaNumero" name="aulaNumero" required>
    
        <label for="aulaCapacidad">Capacidad:</label>
        <input type="number" id="aulaCapacidad" name="aulaCapacidad" required>
    
        <button type="button" onclick="registrarAula()">Registrar Aula</button>
      </form>
    
      <script>
        function registrarProfesor() {
          const nombre = document.getElementById('profesorNombre').value;
          const materia = document.getElementById('profesorMateria').value;
        }
    
        function registrarAlumno() {
          const nombre = document.getElementById('alumnoNombre').value;
          const edad = document.getElementById('alumnoEdad').value;
        }
    
        function registrarAula() {
          const numero = document.getElementById('aulaNumero').value;
          const capacidad = document.getElementById('aulaCapacidad').value;
        }
      </script>
    
    </body>
    </html>        
    `);
});

module.exports = routerWeb;