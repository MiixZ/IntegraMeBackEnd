'use strict';

const express = require('express');
const mysql = require('mysql2');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

const rtWeb = require('./web/router_web.js');
const rtApi = require('./api/router_api.js');

// App
const app = express();

app.use('/', rtWeb);

app.use('/api', rtApi);

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});       