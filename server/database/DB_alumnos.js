require('dotenv').config();
const database = require('./general.js');

async function conectar() {
    return await database.conectarBD();
}

async function getIdentityCards() {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT ID_alumno, NickName, Avatar_id FROM PERFIL_ALUMNOS'
    );

    const ids = rows.map(result => result.ID_alumno);
    const nicknames = rows.map(result => result.NickName);
    const avatars = rows.map(result => result.Avatar_id);

    return [ids, nicknames, avatars];
}

async function getIdentityCard(idStudent) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT ID_alumno, NickName, Avatar_id FROM PERFIL_ALUMNOS WHERE ID_alumno = ?',
        [idStudent]
    );

    const id = rows[0].ID_alumno;
    const nickname = rows[0].NickName;
    const avatar = rows[0].Avatar_id;

    return [id, nickname, avatar];
}

async function getAvatar(idStudent) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT PA.Avatar_id, I.Descripcion ' +
        'FROM PERFIL_ALUMNOS AS PA ' +
        'INNER JOIN IMAGENES AS I ON PA.Avatar_id = I.ID_imagen ' +
        'WHERE PA.ID_alumno = ?',
        [idStudent]
    );

    const avatarId = rows[0].Avatar_id;
    const altDescription = rows[0].Descripcion;

    return [avatarId, altDescription];
}

async function getImagesAndSteps(idSet) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM IMAGENES_SET WHERE ID_set = ?',
        [idSet], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting images set.', error);
            }
        }
    );

    for(let row of rows){
        try{
            row.imageList = await database.getImageContent(row.ID_imagen);
        }catch{
            throw new Error('Error getting image content.', error);
        }
    }

    const data = rows.map(row => row.imageList);

    return data;
}

async function getAuthMethod(idStudent) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT FormatoPassword, ID_set FROM PERFIL_ALUMNOS WHERE ID_alumno = ?',
        [idStudent], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting authentication method.', error);
            }
        }
    );

    const authMethod = rows[0].FormatoPassword;
    const idSet = rows[0].ID_set;
    
    return [authMethod, idSet];
}

async function getFormatos(idStudent) {
    const connection = await conectar();
    
    const [rows, fields] = await connection.execute(
        'SELECT Nom_formato FROM FORMATOS_ALUMNOS WHERE ID_alumno = ?',
        [idStudent], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting format.', error);
            }
        }
    );

    return rows;
}

async function getInteracciones(idStudent) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT Nom_interaccion FROM INTERACCION_ALUMNOS WHERE ID_alumno = ?',
        [idStudent], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting interaction.', error);
            }
        }
    );

    return rows;
}

async function getData(idStudent) {
    const connection = await conectar();

    const [row] = await connection.execute(
        'SELECT Nombre, Apellido1, Apellido2 FROM ALUMNOS WHERE ID_alumno = ?',
        [idStudent], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting data.', error);
            }
        }
    );

    const data = {
        Name: row[0].Nombre,
        Lastname1: row[0].Apellido1,
        Lastname2: row[0].Apellido2
    };

    return data;
}

async function getPerfil(idStudent) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT Avatar_id FROM PERFIL_ALUMNOS WHERE ID_alumno = ?',
        [idStudent], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting perfil.', error);
            }
        }
    );

    if (rows.length === 0) {
        throw new Error('There is no perfil for this student');
    }

    const perfil = rows.map(result => result.Avatar_id);

    return perfil;
}

async function getPassword(id) {
    const connection = await conectar();

    const [row] = await connection.execute(
        'SELECT Password_hash FROM PERFIL_ALUMNOS WHERE ID_alumno = ? LIMIT 1',
        [id], (error, results, fields) => {
            if (error) {
                if (error.state === 'ER_BAD_FIELD_ERROR')


                throw new Error('Error getting password.', error);
            }
        }
    );

    if (row.length === 0) {
        throw new Error('This student does not have a password on perfil');
    }

    const password = row[0].Password_hash;

    return password;
}

async function getProfileData(id) {
    const connection = await conectar();

    const [row] = await connection.execute(
        'SELECT * FROM PERFIL_ALUMNOS WHERE ID_alumno = ? LIMIT 1',
        [id], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting profile data.', error);
            }
        }
    );

    if (row.length === 0) {
        throw new Error('There is no student with that id');
    }

    const data = {
        Student_id: row[0].ID_alumno,
        Avatar_id: row[0].Avatar_id,
        ID_set: row[0].ID_set,
        PasswordFormat: row[0].FormatoPassword,
        Password: row[0].Password_hash,
        NickName: row[0].NickName,
        Steps: row[0].Steps
    };

    return data;
}

async function getIdStudentByLastnames(lastname1, lastname2) {
    const connection = await conectar();

    const [row] = await connection.execute(
        'SELECT ID_alumno FROM ALUMNOS WHERE Apellido1 = ? AND Apellido2 = ? LIMIT 1',
        [lastname1, lastname2]
    );

    if (row.length === 0) {
        throw new Error('There is no student with that lastnames');
    }

    const id = row[0].ID_alumno;

    return id;
}

async function studentData(id) {
    const connection = await conectar();

    const [row] = await connection.execute(
        'SELECT * FROM ALUMNOS WHERE ID_alumno = ? LIMIT 1',
        [id], (error, results, fields) => {
            if (error) {
                throw new Error('Error saving token', error);
            }
        }
    );

    if (row.length === 0) {
        throw new Error('There is no student with that id');
    }

    const data = row[0].NickName;

    return data;
}

async function getTasksCards(idStudent) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM TAREA WHERE ID_alumno = ?',
        [idStudent], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting tasks.', error);
            }
        }
    );

    if (rows.length === 0) {
        throw new Error('There are no tasks for this student');
    }

    const data = [];

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        displayImagen = await database.getImageContent(row.Img_tarea);

        data.push({
            taskId: row.ID_tarea,
            taskState: row.Estado,
            displayName: row.Nombre,
            displayImage: displayImagen,
            taskType: row.Tipo_tarea
        });
    }

    return data;
}

async function getTask(idTask) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM TAREA WHERE ID_tarea = ?',
        [idTask], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting tasks.', error);
            }
        }
    );

    if (rows.length === 0) {
        throw new Error('There is no task with that id');
    }

    const data = {
        taskId: rows[0].ID_tarea,
        taskState: rows[0].Estado,
        displayName: rows[0].Nombre,
        displayImage: rows[0].Img_tarea,
        taskType: rows[0].Tipo_tarea,
        Student: rows[0].ID_alumno
    };

    return data;
}

async function getStudentFromTaks(idTask) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT ID_alumno FROM TAREA WHERE ID_tarea = ?',
        [idTask], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting tasks.', error);
            }
        }
    );

    if (rows.length === 0) {
        throw new Error('There is no student with that task');
    }

    const student = rows[0].ID_alumno;

    return student;
}

async function updateStep(idTask, state) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'UPDATE TAREA SET Estado = ? WHERE ID_tarea = ?',
        [state, idTask], (error, results, fields) => {
            if (error) {
                throw new Error('Error updating step.' + error);
            }
        }
    );

    return "OK";
}

// ---------------------------------------------- TASKS ----------------------------------------------

async function getMaterialTaskModel(idTask) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM TAREA WHERE ID_tarea = ?',
        [idTask], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting material task.', error);
            }
        }
    );

    if (rows.length === 0) {
        throw new Error('There is no task with that id.');
    }

    console.log(rows);

    if (rows[0].Tipo_tarea !== 'MaterialTask') {
        throw new Error('This task is not a material task.');
    }

    // Cogemos la recompensa según su tipo.
    switch (rows[0].Recompensa_tipo) {
        case "String" :
            recompensa = {
                type: "TextContent",
                text: rows[0].Recompensa
            };
            break;

        case "Imagenes" :
            recompensa = await database.getImageContent(rows[0].Recompensa);
            break;

        case "Audios" :
            recompensa = await database.getAudio(rows[0].Recompensa);
            break;

        case "Videos" :
            recompensa = await database.getVideo(rows[0].Recompensa);
            break;

        default : throw new Error('There is no reward type with that name. '
                                    + rows[0].Recompensa_tipo);
    }

    console.log("sdjikgbn");

    // Contamos cuántos materiales hay en MATERIALES_TAREA.
    const [rows2, fields2] = await connection.execute(
        'SELECT COUNT(*) FROM MATERIALES_TAREA WHERE ID_tarea = ?',
        [idTask], (error, results, fields) => {
            if (error) {
                throw new Error('Error counting materials.', error);
            }
        }
    );

    if (rows2.length === 0) {
        throw new Error('There are no materials in this task.');
    }

    n_materiales = rows2[0]['COUNT(*)'];

    console.log(n_materiales);
    console.log(rows);
    
    try {
        imageTask = await database.getImageContent(rows[0].Img_tarea);
    } catch(error) {
        throw new Error('Error getting image content.', error);
    }

    const data = {
        type: "MaterialTaskModel",
        taskId: rows[0].ID_tarea,
        displayName: rows[0].Nombre,
        displayImage: imageTask,
        reward: recompensa,
        requests: n_materiales
    };

    console.log(data);

    return data;
}

async function getMenuTaskModel(idTask) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM TAREA WHERE ID_tarea = ?',
        [idTask], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting menu task.', error);
            }
        }
    );

    if (rows.length === 0) {
        throw new Error('There is no task with that id.');
    }

    if (rows[0].Tipo_tarea !== 'MenuTask') {
        throw new Error('This task is not a menu task.');
    }

    // Cogemos la recompensa según su tipo.
    switch (rows[0].Recompensa_tipo) {
        case "String" :
            recompensa = {
                type: "TextContent",
                text: rows[0].Recompensa
            };
            break;

        case "Imagenes" :
            recompensa = await database.getImageContent(rows[0].Recompensa);
            break;

        case "Audios" :
            recompensa = await database.getAudio(rows[0].Recompensa);
            break;

        case "Videos" :
            recompensa = await database.getVideo(rows[0].Recompensa);
            break;

        default : throw new Error('There is no reward type with that name. '
                                    + rows[0].Recompensa_tipo);
    }
    
    try {
        imageTask = await database.getImageContent(rows[0].Img_tarea);
    } catch(error) {
        throw new Error('Error getting image content.', error);
    }

    try{
        const classroomsIds = await getClassroomsMenuTask();
        classrooms = await Promise.all(classroomsIds.classrooms.map(getClassroomInfo));
    }catch(error){
        throw new Error('Error getting classrooms.', error);
    }

    const data = {
        type: "MenuTaskModel",
        taskId: rows[0].ID_tarea,
        displayName: rows[0].Nombre,
        displayImage: imageTask,
        reward: recompensa,
        classrooms: classrooms
    };

    console.log(data);

    return data;
}

async function getClassroomsMenuTask() {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
       'SELECT DISTINCT ID_aula FROM OPCIONES_MENU_TAREA',
    );

    const data = {
        classrooms: rows.map(row => row.ID_aula)
    };

    return data;
}

async function getClassroomInfo (idAula){
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT Num_aula, Imagen_clase, Nombre FROM AULAS WHERE Num_aula = ?',
        [idAula], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting material task.', error);
            }
        }
    );
    
    if (rows.length === 0) {
        throw new Error('There is no classroom with that id.');
    }

    try{
        imageContent = await database.getImageContent(rows[0].Imagen_clase);
    }catch{
        throw new Error('Error getting image content.', error);
    }

    textContent = {
        type: "TextContent",
        text: rows[0].Nombre
    };
   
    const data = {
        classroomId: rows[0].Num_aula,
        displayText: textContent,
        displayImage: imageContent
    };

    return data;
}

async function getTaskType(idTask) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT Tipo_tarea FROM TAREA WHERE ID_tarea = ?',
        [idTask], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting material task.', error);
            }
        }
    );
    

    if (rows.length === 0) {
        throw new Error('There is no material request with that id.');
    }

    const data = {
        type: rows[0].Tipo_tarea
    };

    return data;
}

async function getMaterialRequest(TaskId, RequestId) {
    const connection = await conectar();
    RequestId = Number(RequestId) + 1;
    const [rows, fields] = await connection.execute(
        'SELECT * FROM MATERIALES_TAREA WHERE ID_tarea = ? AND num_peticion = ?',
        [TaskId, RequestId], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting material request.', error);
            }
        }
    );

    if (rows.length === 0) {
        throw new Error('There is no material request with that id.');
    }

    console.log(rows);

    // Cogemos los datos del material y la imagen del mismo.
    try {
        material_data = await database.getMaterial(rows[0].ID_material);  // no se hace la misma consulta 2 veces?
        imagen_peticion = await database.getImageContent(rows[0].Imagen_peticion);
    } catch(error) {
        throw new Error('Error getting material or image content.', error);
    }

    const data = {
        material : material_data, 
        displayAmount: imagen_peticion,
        isDelivered: rows[0].Esta_entregado === 1 ? true : false
    };

    return data;
}

async function toggleDelivered(TaskId, RequestId, isDelivered) {
    const connection = await conectar();
    RequestId = Number(RequestId) + 1;
    const [rows, fields] = await connection.execute(
        'UPDATE MATERIALES_TAREA SET Esta_entregado = ? WHERE ID_tarea = ? AND num_peticion = ?',
        [isDelivered, TaskId, RequestId], (error, results, fields) => {
            if (error) {
                throw new Error('Error updating material request.', error);
            }
        }
    );

    return rows;
}

async function getGenericTaskModel(idTask) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM TAREA WHERE ID_tarea = ?',
        [idTask], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting generic task.', error);
            }
        }
    );

    if (rows.length === 0) {
        throw new Error('There is no task with that id.');
    }

    if (rows[0].Tipo_tarea !== 'GenericTask') {
        throw new Error('This task is not a generic task.');
    }

    // Cogemos la recompensa según su tipo.
    switch (rows[0].Recompensa_tipo) {
        case "String" :
            recompensa = {
                type: "TextContent",
                text: rows[0].Recompensa
            };
            break;

        case "Imagenes" :
            recompensa = await database.getImageContent(rows[0].Recompensa);
            break;

        case "Audios" :
            recompensa = await database.getAudio(rows[0].Recompensa);
            break;

        case "Videos" :
            recompensa = await database.getVideo(rows[0].Recompensa);
            break;

        default : throw new Error('There is no reward type with that name. '
                                    + rows[0].Recompensa_tipo);
    }

    try {
        imageTask = await database.getImageContent(rows[0].Img_tarea);
    } catch(error) {
        throw new Error('Error getting image content.', error);
    }

    const data = {
        type: "GenericTaskModel",
        taskId: rows[0].ID_tarea,
        displayName: rows[0].Nombre,
        displayImage: imageTask,
        reward: recompensa,
        steps: await getNumSteps(idTask),
    };

    console.log (data.steps);

    return data;
}

async function getGenericTaskStep(TaskId, StepId) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT * FROM PASO_GENERAL WHERE ID_tarea = ? AND ID_paso = ?',
        [TaskId, StepId], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting generic task.', error);
            }
        }
    );

    if (rows.length === 0) {
        throw new Error('There is no step with that id.');
    }

    try {
        imageStep = await database.getImageContent(rows[0].Imagen_tarea);
    } catch(error) {
        throw new Error('Error getting image content.', error);
    }

    try {
        videoStep = await database.getVideo(rows[0].Video_tarea);
    } catch(error) {
        throw new Error('Error getting video content.', error);
    }

    try {
        audioStep = await database.getAudio(rows[0].Audio_tarea);
    } catch(error) {
        throw new Error('Error getting audio content.', error);
    }

    texto = {
        type: "TextContent",
        text: rows[0].Texto_tarea
    };

    contentPack = {
        text: texto,
        image: imageStep,
        video: videoStep,
        audio: audioStep
    };

    const data = {
        displayName: rows[0].Nombre,
        isCompleted: rows[0].Estado === 'false' ? false : Boolean(rows[0].Estado),
        content: contentPack
    };

    return data;
}

async function toggleStepCompleted(TaskId, StepId, isCompleted) {
    const connection = await conectar();

    isCompleted = isCompleted ? 'true' : 'false';
    console.log(isCompleted);

    const [rows, fields] = await connection.execute(
        'UPDATE PASO_GENERAL SET Estado = ? WHERE ID_tarea = ? AND ID_paso = ?',
        [isCompleted, TaskId, StepId], (error, results, fields) => {
            if (error) {
                throw new Error('Error updating step.', error);
            }
        }
    );

    return "OK";
}

async function addGenericStep(TaskId, Description, StepName, StepText, StepImage, StepVideo, StepAudio) {
    const connection = await conectar();

    const [rows, fields] =  await connection.execute(
        'CALL InsertPaso(?, ?, ?, ?, ?, ?, ?)', 
        [StepName, Description, StepImage, StepAudio, StepVideo, StepText, TaskId] , (error, results, fields)=> {
            if (error) {
                throw new Error('Error adding step.', error);
            }
        });

    return rows;
}

async function getNumSteps (TaskID){
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT COUNT(*) FROM PASO_GENERAL WHERE ID_tarea = ?',
        [TaskID], (error, results, fields) => {
            if (error) {
                throw new Error('Error counting steps.', error);
            }
        }
    );

    return rows[0]['COUNT(*)'];
}

async function getListClassrooms (){ //PROBAR
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT Num_aula FROM AULAS'
    );

    const data = {
        classRoomIds: rows.map(row => row.Num_aula)
    };

    return data;
}

async function getListMenuTasks (TaskId, ClassRoomId){ //PROBAR
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        `SELECT * 
         FROM OPCIONES_MENU_TAREA 
         INNER JOIN OPCIONES_MENU ON OPCIONES_MENU_TAREA.ID_opcion = OPCIONES_MENU.ID_opcion 
         WHERE OPCIONES_MENU_TAREA.ID_tarea = ? AND OPCIONES_MENU_TAREA.ID_aula = ?`,
        [TaskId, ClassRoomId]
    );
    if (rows.length === 0) {
        throw new Error('There is no menu task with that id.');
    }

    const [rows1, filds] = await connection.execute(
        'SELECT * FROM OPCIONES_MENU WHERE ID_opcion = ?',
        [rows[0].ID_opcion]
    );

    if (rows1.length === 0) {
        throw new Error('There is no options menu with that id.');
    }

    try{
        clasroomInfo = await getClassroomInfo(ClassRoomId);
    }catch{
        throw new Error('Error getting classroom info.', error);
    }

    for (let row of rows) {
        try{
            row.displayImage = await database.getImageContent(row.Imagen_opcion);
        }catch{
            throw new Error('Error getting image content.', error);
        }
    }


    const data = {
        menuOptions: rows.map(row => {
            return {
                menuOptionId: row.ID_opcion,
                requestedAmount: row.Cantidad,
                displayName: textContent = {
                    type: "TextContent",
                    text: row.Nombre
                },
                displayImage: row.displayImage,
            };
        }),
        classroom: clasroomInfo
    };


    return data;
}

async function updateAmountMenu(taskID, classroomID, menuOptionID, amount){ //PROBAR
    const connection = await conectar();

    const [rows1, fields] = await connection.execute(
        'SELECT * FROM OPCIONES_MENU_TAREA WHERE ID_tarea = ? AND ID_opcion = ? AND ID_aula = ?',
        [taskID, menuOptionID, classroomID]
    );

    console.log (rows1);

    if (rows1.length === 0) {
        throw new Error('There is no menu option with that id.');
    }

    const [rows2, fields2] = await connection.execute(
        'UPDATE OPCIONES_MENU_TAREA SET Cantidad = ? WHERE ID_tarea = ? AND ID_opcion = ? AND ID_aula = ?',
        [amount, taskID, menuOptionID, classroomID], (error, results, fields) => {
            if (error) {
                throw new Error('Error updating amount', error);
            }
        }
    );

    return rows2;
}

module.exports = {
    getIdentityCard,
    getIdentityCards,
    getImagesAndSteps,
    getAvatar,
    getFormatos,
    getInteracciones,
    getData,
    getPerfil,
    getTasksCards,
    getPassword,
    getAuthMethod,
    studentData,
    getProfileData,
    getStudentFromTaks,
    getTask,
    updateStep,
    getMaterialTaskModel,
    getMaterialRequest,
    toggleDelivered,
    getGenericTaskModel,
    getGenericTaskStep,
    toggleStepCompleted,
    getTaskType,
    addGenericStep,
    getNumSteps,
    getMenuTaskModel,
    getListClassrooms,
    getListMenuTasks,
    updateAmountMenu,
    getClassroomsMenuTask,
    getClassroomInfo,
    getIdStudentByLastnames
};