const express = require('express');
const routerApi = express.Router();

// Routers para las versiones.
const routerV1 = require('./v1/router_v1.js');

routerApi.get('/', (req, res) => {
    res.json({ message: 'esta es la api principal. na que aserle' });
});

routerApi.use('/v1', routerV1);

module.exports = routerApi;