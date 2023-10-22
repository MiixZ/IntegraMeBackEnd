import express from 'express';

//import { createServer } from 'http';

const app = express();
app.use(express.json());

app.listen(8080, () => {
    console.log('Server escuchando en puerto 8080');
});