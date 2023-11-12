const general = require('../../../database/general.js');

async function checkToken(req, res) {
    try {
        // Coge el token enviado en el header de la solicitud.
        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Token not sent' });
        }
        // Coge el token enviado en el header de la solicitud. Si no existe, devuelve un error.
        const token = req.headers.authorization.split(' ')[1];
        const payload = jwt.verify(token, secret_student);

        // Verifica si el token ha sido encryptado con el secret_admin. Si no, devuelve un error.
        general.VerificarToken(token).then(existe => {
            if (existe) {
                if (Date.now() > payload.EXP) {
                    cleanUpTokens();
                    return res.json({   validation: false,
                                        message: 'Token expired' });
                } else {
                    return res.json({   validation: true,
                                        message: 'Token correct' });
                }
            } else {
              res.status(401).json('Token not found in the database');
            }
          }).catch(error => {
            console.error('An error has ocurred in VerificarToken call', error);
        });
    } catch (error) {
        console.error('Token not sent or', error);
        res.status(401).json({ error: 'Error in the request' });
    }
}
// CAMBIAR EL IMG PATH
async function getImage(req, res) {
    try {
        const idImage = req.params.idImage;

        // Supongamos que el nombre de la imagen es el ID del estudiante
        const imagePath = `${imageRoute}/${idImage}.png`;

        res.sendFile(imagePath);
    } catch (error) {
        console.error('Error en la solicitud:', error);
        res.status(500).json({ error: 'Error en la solicitud' });
    }
}

module.exports = {
    checkToken,
    getImage
  };