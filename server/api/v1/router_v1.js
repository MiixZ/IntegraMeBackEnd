const express = require('express');
const routerv1 = express.Router();

const database = require('../../database/general.js');
const routerProfesores = require('./profesores.js');
const routerAlumnos = require('./alumnos.js');
const routerAdmin = require('./admin.js');

routerv1.get('/', (req, res) => {
    res.json({ message: 'esta es la api principal de la versión 1. na que aserle' });
});

routerv1.use('/profesores', routerProfesores);
routerv1.use('/alumnos', routerAlumnos);
routerv1.use('/admin', routerAdmin);

module.exports = routerv1;