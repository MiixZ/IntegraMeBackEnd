const path = require('path');
const express = require('express');
const routerWeb = express.Router();

routerWeb.use(express.static(path.join(__dirname, '/panelAdmin')));

routerWeb.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/panelAdmin', 'index.html'));
});

module.exports = routerWeb;