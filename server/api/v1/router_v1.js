const express = require('express');
const routerv1 = express.Router();

const TeacherRouter = require('./teachers.js');
const AdminRouter = require('./admin.js');
const StudentRouter = require('./students.js');

routerv1.get('/', (req, res) => {
    res.json({ message: 'esta es la api principal de la versión 1. na que aserle' });
});

routerv1.use('/teachers', TeacherRouter);
routerv1.use('/students', StudentRouter);
routerv1.use('/admin', AdminRouter);

module.exports = routerv1;