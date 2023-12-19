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
        'SELECT C.Steps, IS.ID_imagen, I.Descripcion ' +
        'FROM CONJUNTOS AS C ' +
        'INNER JOIN IMAGENES_SET AS IS ON C.ID_set = IS.ID_set ' +
        'INNER JOIN IMAGENES AS I ON IS.ID_imagen = I.ID_imagen ' +
        'WHERE C.ID_set = ?',
        [idSet], (error, results, fields) => {
            if (error) {
                throw new Error('Error getting images and steps.', error);
            }
        }
    );

    const steps = rows[0].Steps;
    const images = rows.map(result => [result.ID_imagen, result.Descripcion]);
    
    return [steps, images];
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
        Avatar_id: row[0].Avatar_id,
        ID_set: row[0].ID_set,
        PasswordFormat: row[0].FormatoPassword,
        Password: row[0].Password_hash,
        NickName: row[0].NickName
    };

    return data;
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

    const data = {
        type: "MenuTaskModel",
        taskId: rows[0].ID_tarea,
        displayName: rows[0].Nombre,
        displayImage: imageTask,
        reward: recompensa,
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
        `SELECT * FROM OPCIONES_MENU_TAREA WHERE ID_tarea = ? AND ID_aula = ?`,
        [TaskId, ClassRoomId]
    );

    const data = {
        menuOptionList: rows.map(row => {
            return {
                name: row.Nombre,
                //displayDescription: row.Descripcion,
                image: row.Imagen_opcion
            };
        })
    };

    return data;
}

//NO DEBERIA DE IR AQUI PORQUE ES DEL PROFESOR, PROBLEMA DEL GUILLE DE MAÑANA
async function insertMenu (taskID, classroomID, menuOptionID, amount){  ////PROBAR-> SERA PARA EL PROFESOR QUE EL JERMU ES GILIPOLLAS
    const connection = await conectar();

    const [rows1, fields] = await connection.execute(
        'SELECT * FROM TAREA WHERE ID_tarea = ?',
        [taskID]
    );

    if (rows1.length === 0) {
        throw new Error('There is no task with that id.');
    }

    const [rows2, fields2] = await connection.execute(
        'SELECT * FROM AULAS WHERE Num_aula = ?',
        [classroomID]
    );

    if (rows2.length === 0) {
        throw new Error('There is no classroom with that id.');
    }

    const [rows3, fields3] = await connection.execute(
        'SELECT * FROM OPCIONES_MENU WHERE ID_opcion = ?',
        [menuOptionID]
    );

    if (rows3.length === 0) {
        throw new Error('There is no menu option with that id.');
    }

    const [rows4, fields4] = await connection.execute(
        'INSERT INTO OPCIONES_MENU_TAREA (ID_tarea, ID_opcion, Cantidad, ID_aula, Fecha) VALUES (?, ?, ?, ?, CURDATE())',
        [taskID, menuOptionID, classroomID, amount], (error, results, fields) => {
            if (error) {
                throw new Error('Error inserting menu', error);
            }
        }
    );

    return rows4;
}

async function updateAmountMenu(taskID, classroomID, menuOptionID, amount){ //PROBAR
    const connection = await conectar();

    const [rows1, fields] = await connection.execute(
        'SELECT * FROM OPCIONES_MENU_TAREA WHERE ID_tarea = ? AND ID_opcion = ? AND ID_aula = ?',
        [taskID, menuOptionID, classroomID]
    );

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
    insertMenu,
    updateAmountMenu
};