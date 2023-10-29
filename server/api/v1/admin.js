const express = require('express');
const routerAdmin = express.Router();

const database = require('../../database/general.js');

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;


module.exports = routerAdmin;