const general = require('../../../database/general.js');
const database = require('../../../database/DB_alumnos.js');
const { encrypt, compare, checkearToken } = require('../../../database/general.js');

const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET_STUDENT;
const secret_teacher = process.env.JWT_SECRET_TEACHER;

async function getIdentityCardsAll(req, res) {          // Probar.
    // Obtener tarjetas de identidad del alumno.
    let ids = [];
    let nicknames = [];

    try {
        [ids, nicknames, avatars] = await database.getIdentityCards();
    } catch (error) {
        return res.status(500).json({ error: 'Error getting identity cards.' });
    }

    // Enviar respuesta al cliente
    /**
     * El json tendría que tener este formato:
     * Se devuelve una lista []:{"userId": 2,"nickname": "asd","avatar": {"id": id_imagen,"altDescription": "descripción textual"}
    */
    const response = [];

    for (let i = 0; i < ids.length; i++) {

        try {
            imageContent = await general.getImageContent(avatars[i]);     // [0] es el id del alumno. [1] es el nickname.
        } catch (error) {
            return res.status(500).json({ error: 'Error getting ' + nicknames[i] + ' avatar.' });
        }

        response.push({
            userId: ids[i],
            nickname: nicknames[i],
            avatar: imageContent
        });
    }

    res.json(response);
}

async function getIdentityCard(req, res) {          // Probar.
    // Obtener datos del cuerpo de la solicitud.
    const userId = req.params.userID;
    let id_Student = -1;
    let nickname = "";
    let avatar = "";

    // Obtener tarjetas de identidad del alumno.
    try {
        [id_Student, nickname, avatar] = await database.getIdentityCard(userId);
        imageContent = await general.getImageContent(avatar);
    } catch (error) {
        res.status(500).json({ error: 'Error getting identity card or avatar.' });
        return;
    }

    // Enviar respuesta al cliente
    const response = {
        userId: id_Student,        // Puede ser identityCard.id e identityCard.nickname.
        nickname: nickname,
        avatar: imageContent
    };

    res.json(response);
}


async function getAuthMethod(req, res) {
    /**
     * el json a devolver debería tener este formato:
     * {
     *      "type": "TextAuth" o "ImageAuth"
     *      (si es ImageAuth) "images": [{"id": X, "altDescription": "..."}, ...] # Lista de imágenes
     *      (si es ImageAuth) "steps": X
     * }
     */

    // Obtener datos del cuerpo de la solicitud.
    const userID = req.params.userID;

    // Obtener método de autenticación del alumno.
    try {
        perfilAlumno = await database.getProfileData(userID);
    } catch (error) {
        return res.status(404).json({ error: 'Error getting AuthMethod or Student Profile.' });
    }

    if (perfilAlumno.PasswordFormat === "TextAuth") {
        res.json({
            type: perfilAlumno.PasswordFormat
        });
    } else if (perfilAlumno.PasswordFormat === "ImageAuth" && perfilAlumno.ID_set) {
        try { 
            const imagesAndSteps = await database.getImagesAndSteps(perfilAlumno.ID_set);
            const steps = perfilAlumno.Steps;

            console.log(imagesAndSteps);

            const data = {
                type: perfilAlumno.PasswordFormat, 
                imageList: imagesAndSteps,
                steps: steps,
            }

            console.log(data);

            res.json(data);
        } catch (error) {
            return res.status(404).json({ error: 'Error getting images and steps.' });
        }
    } else {
        return res.status(404).json({ error: 'Auth is not Text or Image or authMethod' +
                                             ' has no set assigned.' });
    }
}

async function checkImagePassword(req, res) {
    const userID = req.params.userID;

    const imagePassword = req.body.password;

    console.log(imagePassword);

    try {
        perfilAlumno = await database.getProfileData(userID);
    } catch (error) {
        return res.status(404).json({ error: 'Error getting AuthMethod or Student Profile.' });
    }
    
    if (perfilAlumno.PasswordFormat === "ImageAuth" && perfilAlumno.ID_set) {
        splitPassword = perfilAlumno.Password.split(",");

        for (let i = 0; i < imagePassword.length; i++) {
            if (splitPassword[i] != imagePassword[i]) {
                return res.status(401).json({ error: 'Incorrect password.' });
            }
        }
        
        return res.status(200).json({ message: 'Correct password.' });
    }else{
        return res.status(404).json({ error: 'Incorret type of login'});
    
    }

}

async function getProfileContent(req, res) {        // FUNCIONA
    // Obtener datos del cuerpo de la solicitud.
    const userID = req.params.userID;
    let arrayFormats = [];
    let arrayIteractions = [];
    let formatos, interacciones;

    // Obtener contenido del perfil del alumno.
    try {
        formatos = await database.getFormatos(userID);
        interacciones = await database.getInteracciones(userID);
    } catch (error) {
        return res.status(500).json({ error: 'Error getting formats or interactions.' });
    }

    for (let i = 0; i < formatos.length; i++) {
        arrayFormats.push(formatos[i].Nom_formato);
    }

    for (let i = 0; i < interacciones.length; i++) {
        arrayIteractions.push(interacciones[i].Nom_interaccion);
    }

    console.log(arrayFormats);

    // Enviar respuesta al cliente.
    if (arrayIteractions.length >= 1 && arrayFormats.length >= 1) {
        res.json({
            contentAdaptationFormats: arrayFormats,
            interactionMethods: arrayIteractions
        });
    } else {
        res.json({ result: 'This student does not have content associated' });
    }
}

/*async function getProfileContent(req, res) {
    try {
        // Obtener datos del cuerpo de la solicitud.
        const userID = req.params.userID;
        is_teacher = false;

        if (!req.headers.authorization) {
            return res.status(401).json({ error: 'Token not sent' });
        }

        const token = req.headers.authorization.split(' ')[1];
        decoded_token = null;

        try {
            decoded_token = await checkearToken(token, secret_teacher);
            is_teacher = true;
            console.log("Es profesor.");
        } catch (error) {
            console.log("No es profesor.");
            decoded_token = await checkearToken(token, secret);
        }

        if (is_teacher || decoded_token.idStudent == userID) {
            // Obtener contenido del perfil del alumno.
            const formatos = await database.getFormatos(userID);
            const arrayFormatos = formatos.map(formato => formato.Nom_formato);

            const iteraciones = await database.getInteraciones(userID);
            const arrayIteraciones = iteraciones.map(iteracion => iteracion.Nom_interaccion);

            if (arrayIteraciones.length >= 1 && arrayFormatos.length >= 1) {
                // Enviar respuesta al cliente.
                res.json({
                    contentAdaptationFormats: arrayFormatos,
                    interactionMethods: arrayIteraciones
                });
            } else {
                res.status(404).json({ error: 'Could not get student or there is no information.' });
            }
        } else {
            res.status(401).json({ error: 'The user do not have permissions'});
        }
    } catch {
        res.status(500).json({ error: 'Error in the request' });
    }
}*/

/**
 *     try {
        // Obtener datos del cuerpo de la solicitud.
        const userID = req.params.userID;
        is_teacher = false;

        const token = req.headers.authorization.split(' ')[1];

        await checkearToken(token, secret)
        .then(async (decoded) => {
            // Obtener contenido del perfil del alumno.
            const formatos = await database.getFormatos(userID);
            const arrayFormatos = formatos.map(formato => formato.Nom_formato);

            const iteraciones = await database.getInteraciones(userID);
            const arrayIteraciones = iteraciones.map(iteracion => iteracion.Nom_interaccion);

            if (arrayIteraciones.length >= 1 && arrayFormatos.length >= 1) {
                // Enviar respuesta al cliente.
                res.json({
                    contentAdaptationFormats: arrayFormatos,
                    interactionMethods: arrayIteraciones
                });
            } else {
                res.status(404).json({ error: 'Could not get student or there is no information.' });
            }
        }).catch((error) => {
            res.status(401).json({ error: 'Token has expired.' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error in the request' });
    }
 */

// TODO: Hay que añadir la url a la tabla imagenes y devolver aquí según si es null o no.
async function getProfile(req, res) {           // Probar.
    // Coge el token enviado en el header de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    const userID = req.params.userID;

    // Verificamos token y lo decodificamos
    let decodedToken;
    let student = false;

    try {
        decodedToken = await checkearToken(token, secret_teacher);
    } catch (error) {
        try {
            decodedToken = await checkearToken(token, secret);
            student = true;
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    }

    if (student && decodedToken.idStudent != userID) {
        return res.status(401).json({ error: 'Invalid token for user.' });
    }

    // Obtener datos del cuerpo de la solicitud.
    dataStudent = {};
    studentProfile = {};
    imagen = {};

    try {
        dataStudent = await database.getData(userID);
        studentProfile = await database.getProfileData(userID);                // [avatarId, altDescription
        imagen = await general.getImageContent(studentProfile.Avatar_id);                   // [avatarId, altDescription
    } catch (error) {
        return res.status(404).json({ error: 'Could not get student data or avatar.' });
    }
    //const arrayProfile = await database.getProfile(userID); // para el avatar

    const arrayFormatos = [];
    const arrayInteracciones = [];
    const formatos = await database.getFormatos(userID);
    const interacciones = await database.getInteracciones(userID);
    
    for (let i = 0; i < formatos.length; i++) {
        arrayFormatos.push(formatos[i].Nom_formato);
    }

    for (let i = 0; i < interacciones.length; i++) {
        arrayInteracciones.push(interacciones[i].Nom_interaccion);
    }

    res.json({
        userId: userID,
        nickname: studentProfile.NickName,
        avatar: imagen,
        name: dataStudent.Name,
        surnames: dataStudent.Lastname1 + " " + dataStudent.Lastname2,
        contentProfile: {
            contentAdaptationFormats: arrayFormatos,
            interactionMethods: arrayInteracciones 
        },
    });
}

async function loginStudent(req, res) {             // Probar.
    // Obtener datos del cuerpo de la solicitud.
    let hash = "";
    let profileData = "";

    // Falta hacer diferentes logins dependientdo de si es texto o imagen

    const idStudent = req.body.userId;
    const password = req.body.password.password;         // password.password porque el body es {password: {password: "contraseña"}}

    console.log("idStudent: " + idStudent);
    console.log("password: " + password);

    // Verificar si todos los campos necesarios están presentes
    if (!idStudent || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        profileData = await database.getProfileData(idStudent);
    } catch (error) {
        return res.status(500).json({ error: 'Error getting student or password' });
    }

    if (profileData.PasswordFormat === "TextAuth") {
        return loginStudentText(req, res, profileData, password);
    }else if (profileData.PasswordFormat === "ImageAuth") {
        return loginStudentImage(req, res, profileData, password);
    }


   
}

async function loginStudentText (req, res, profileData, password) {
    let correcta = false;
    hash = profileData.Password;
    idStudent = profileData.Student_id;

    try {
        correcta = await compare(password, hash);
    } catch (error) {
        return res.status(500).json({ error: 'Error comparing password.' });
    }

    if (correcta) {
        const fecha = new Date(Date.now() + 24 * 60 * 60 * 1000); // Creamos una fecha de expiración del token (24 horas más al día actual)
        const token = jwt.sign({ idStudent, nickname: profileData.NickName, EXP: fecha}, secret); //{ expiresIn: '1h' });
        try {
            await general.insertarToken(idStudent, token, fecha);
            const respuesta = {
                userId : idStudent,
                token: token
            }
            res.status(200).json(respuesta);
        } catch {
            return res.status(500).json({ error: 'Error saving token' });
        }
    } else {
        return res.status(401).json({ error: 'Incorrect Credentials.' });
    }
}

async function loginStudentImage (req, res, profileData, password) {
    let correcta = true;
    idStudent = profileData.Student_id;

    try {
        splitPassword = perfilAlumno.Password.split(",");
        for (let i = 0; i < password.length; i++) {
            if (splitPassword[i] != password[i]) {
                correcta = false;
            }
        }
    } catch (error) {
        return res.status(500).json({ error: 'Error comparing password.' });
    }

    if (correcta) {
        const fecha = new Date(Date.now() + 24 * 60 * 60 * 1000); // Creamos una fecha de expiración del token (24 horas más al día actual)
        const token = jwt.sign({ idStudent, nickname: profileData.NickName, EXP: fecha}, secret); //{ expiresIn: '1h' });
        try {
            await general.insertarToken(idStudent, token, fecha);
            const respuesta = {
                userId : idStudent,
                token: token
            }
            res.status(200).json(respuesta);
        } catch {
            return res.status(500).json({ error: 'Error saving token' });
        }
    } else {
        return res.status(401).json({ error: 'Incorrect Credentials.' });
    }
}

async function getTasksCards(req, res) {             // Probar.
    // Obtener datos del cuerpo de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    // Verificamos token y lo decodificamos
    let decodedToken;
    let student = false;

    try {
        decodedToken = await checkearToken(token, secret_teacher);
    } catch (error) {
        try {
            decodedToken = await checkearToken(token, secret);
            student = true;
        } catch (error) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    }

    const userID = decodedToken.idStudent;

    if (!student) {
        return res.status(401).json({ error: 'Invalid token for user.' });
    }

    // Obtener tareas del alumno.
    let tasks = [];
    try {
        tasks = await database.getTasksCards(userID);
    } catch (error) {
        return res.status(500).json({ error: 'Error getting tasks.' });
    }

    // Enviar respuesta al cliente
    res.status(200).json(tasks);
}

async function updateTaskState (req, res) {
    // Obtener datos del cuerpo de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    const taskID = req.params.taskId;
    const numPaso = req.params.numPaso;

    // Estado al que se va a actualizar el paso.
    const state = req.body.isCompleted;

    try {
        decodedToken = await checkearToken(token, secret);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    try {
        task = await database.getTask(taskID);
    } catch (error) {
        return res.status(500).json({ error: 'Error getting task.' });
    }

    if (decodedToken.idStudent != task.Student || numPaso > task.Steps || numPaso < 1) {
        return res.status(401).json({ error: 'Invalid request.' });
    }

    try {
        await database.updateStep(taskID, state);
    } catch (error) {
        return res.status(500).json({ error: 'Error updating step.' + error });
    }

    return res.json({ result: 'Step updated.' });
}

async function getTaskModel (req, res) {
    // Obtener datos del cuerpo de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    const taskID = req.params.taskId;

    try {
        decodedToken = await checkearToken(token, secret);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    try {
        taskType = await database.getTaskType(taskID);


        console.log("taskType: " + taskType.type);

        switch (taskType.type) {
            case "MenuTask":
                return await getMenuTaskModel(req, res);
                break;
            case "MaterialTask":
                return await getMaterialTaskModel(req, res);
                break;
            case "GenericTask":
                return await getGenericTaskModel(req, res);
                break;
            default:
                return res.status(500).json({ error: 'Error that task type does not exit. ' + error });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Error getting task model or calling methods. ' + error });
    }
}

async function getMaterialTaskModel (req, res) {
    // Obtener datos del cuerpo de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    const taskID = req.params.taskId;

    try {
        decodedToken = await checkearToken(token, secret);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    let taskModel = {};

    try {
        taskModel = await database.getMaterialTaskModel(taskID);
    } catch (error) {
        return res.status(500).json({ error: 'Error getting task model. ' + error });
    }

    return res.json(taskModel);
}

async function getMaterialRequest(req, res) {
    // Obtener datos del cuerpo de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    const taskID = req.params.taskId;
    const resquestID = req.params.requestId;

    try {
        decodedToken = await checkearToken(token, secret);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    let materialRequest = {};

    try {
        materialRequest = await database.getMaterialRequest(taskID, resquestID);
    } catch (error) {
        return res.status(500).json({ error: 'Error getting material request. ' + error });
    }

    return res.json(materialRequest);
}

async function toggleDelivered(req, res) {
    // Obtener datos del cuerpo de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    const taskID = req.params.taskId;
    const resquestID = req.params.requestId;

    const isDelivered = req.body.isDelivered;

    try {
        decodedToken = await checkearToken(token, secret);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    let materialRequest = {};

    try {
        materialRequest = await database.toggleDelivered(taskID, resquestID, isDelivered);
    } catch (error) {
        return res.status(500).json({ error: 'Error toggling delivered. ' + error });
    }

    return res.json(materialRequest);
}

async function getGenericTaskModel(req, res) {
    // Obtener datos del cuerpo de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    const taskID = req.params.taskId;

    try {
        decodedToken = await checkearToken(token, secret);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    let taskModel = {};

    try {
        taskModel = await database.getGenericTaskModel(taskID);
    } catch (error) {
        return res.status(500).json({ error: 'Error getting task model. ' + error });
    }

    return res.json(taskModel);
}

async function getGenericTaskStep(req, res) {
    // Obtener datos del cuerpo de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    const taskID = req.params.taskId;
    const stepID = parseInt(req.params.stepId) +1 ;

    try {
        decodedToken = await checkearToken(token, secret);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    let taskStep = {};

    try {
        taskStep = await database.getGenericTaskStep(taskID, stepID);
    } catch (error) {
        return res.status(500).json({ error: 'Error getting task step. ' + error });
    }

    return res.json(taskStep);
}

async function toggleStepCompleted(req, res) {
    // Obtener datos del cuerpo de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }
    const token = req.headers.authorization.split(' ')[1];
    const taskID = req.params.taskId;
    const stepID = parseInt(req.params.stepId) +1;
    const isCompleted = req.body.isCompleted;

    console.log("isCompleted: " + isCompleted);

    try {
        decodedToken = await checkearToken(token, secret);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    let taskStep = {};

    try {
        taskStep = await database.toggleStepCompleted(taskID, stepID, isCompleted);
    } catch (error) {
        return res.status(500).json({ error: 'Error toggling step completed. ' + error });
    }

    return res.json(taskStep);
}

async function addGenericTaskStep(req, res) {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    const TaskId = req.params.taskId; // HAY QUE COMPROBAR SI EXISTE ESA TAREA

    try {
        decodedToken = await checkearToken(token, secret);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    const { StepName, Description, StepImage, StepAudio, StepVideo, StepText} = req.body;
    if (!StepName || !Description || !TaskId || !StepText || !StepImage || !StepVideo || !StepAudio) {
        return res.status(400).json({ error: 'Data not sent on body.' });
    }

    try {
        result = await database.addGenericStep(TaskId, Description, StepName, StepText, StepImage, StepVideo, StepAudio);
    } catch (error) {
        return res.status(500).json({ error: 'Error adding step. ' + error });
    }

    return res.json(result);
}

async function getMenuTaskModel(req, res) {
    // Obtener datos del cuerpo de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    const taskID = req.params.taskId;

    try {
        decodedToken = await checkearToken(token, secret);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    let taskModel = {};

    try {
        taskModel = await database.getMenuTaskModel(taskID);
    } catch (error) {
        return res.status(500).json({ error: 'Error getting task model. ' + error });
    }

    return res.json(taskModel);
}

async function getListClassrooms(req, res) {
    // Obtener datos del cuerpo de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    try {
        decodedToken = await checkearToken(token, secret);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    let listClassrooms = {};

    try {
        listClassrooms = await database.getListClassrooms();
    } catch (error) {
        return res.status(500).json({ error: 'Error getting classrooms list model. ' + error });
    }

    return res.json(listClassrooms);
}

async function getListMenuTasks(req, res) {
    // Obtener datos del cuerpo de la solicitud.
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    const taskID = req.params.taskId;

    const classroomID = req.params.classroomId;

    try {
        decodedToken = await checkearToken(token, secret);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    let menuOptions = {};

    try {
        menuOptions = await database.getListMenuTasks(taskID, classroomID);
    }catch (error) {
        return res.status(500).json({ error: 'Error getting menu options. ' + error });
    }

    return res.json(menuOptions);
}

async function updateAmountMenu(req, res) { //PROBAR
    if (!req.headers.authorization) {
        return res.status(401).json({ error: 'Token not sent' });
    }

    const token = req.headers.authorization.split(' ')[1];

    const taskID = req.params.taskId;
    const classroomID = req.params.classroomId;
    const menuOptionID = req.params.menuOptionId;
    const amount = req.body.amount;

    try {
        decodedToken = await checkearToken(token, secret);
    }catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    try{
        result = await database.updateAmountMenu(taskID, classroomID, menuOptionID, amount);
    }catch (error) {
        return res.status(500).json({ error: 'Error updating amount menu. ' + error });
    }

    console.log("result: " + result);

    return res.json(result);
}



module.exports = {
    getIdentityCardsAll,
    getIdentityCard,
    getAuthMethod,
    getProfileContent,
    getProfile,
    loginStudent,
    getProfile,
    getTasksCards,
    updateTaskState,
    getTaskModel,
    getMaterialRequest,
    toggleDelivered,
    getGenericTaskModel,
    getGenericTaskStep,
    toggleStepCompleted,
    getMaterialTaskModel,
    addGenericTaskStep,
    getMenuTaskModel,
    getListClassrooms,
    getListMenuTasks,
    updateAmountMenu,
    checkImagePassword
};