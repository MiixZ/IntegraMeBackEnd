const express = require('express');
const routerWeb = express.Router();

routerWeb.get('/', (req, res) => {
    res.json({ message: 'esta sería la web' });
});

module.exports = routerWeb;