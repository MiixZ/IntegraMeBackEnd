// Este router será para autenticar a los usuarios.

const express = require('express');
const LoginRouter = express.Router();

const database = require('../../database/general.js');

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;


module.exports = LoginRouter;