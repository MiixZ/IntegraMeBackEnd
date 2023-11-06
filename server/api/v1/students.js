const express = require('express');
const StudentRouter = express.Router();

const general = require('../../database/general.js');
const database = require('../../database/DB_alumnos.js');

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET_STUDENT;

const { encrypt, compare, cleanUpTokens, checkearToken } = require('../../database/general.js');



module.exports = StudentRouter;