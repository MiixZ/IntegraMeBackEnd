require('dotenv').config();
const database = require('./general.js');

async function conectar() {
    return await database.conectarBD();
}

async function getIdentityCards() {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT ID_alumno, NickName FROM PERFIL_ALUMNOS'
    );

    const ids = rows.map(result => result.ID_alumno);
    const nicknames = rows.map(result => result.NickName);

    return [ids, nicknames];
}

async function getIdentityCard(idStudent) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'SELECT ID_alumno, NickName FROM ALUMNOS WHERE ID_alumno = ?',
        [idStudent]
    );

    const id = rows[0].ID_alumno;
    const nickname = rows[0].NickName;

    return [id, nickname];
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

    const data = rows.map(row => ({
        taskId: row.ID_tarea,
        taskState: row.Estado,
        displayName: row.Nombre,
        displayImage: row.Img_tarea,
        taskType: row.Tipo_tarea
    }));

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

    if (rows[0].Tipo_tarea !== 'MaterialTask') {
        throw new Error('This task is not a material task.');
    }

    if (rows.length === 0) {
        throw new Error('There is no task with that id.');
    }

    // Cogemos la recompensa según su tipo.
    switch (rows[0].Recompensa_tipo) {
        case "String" :
            recompensa = {
                type: "TextContent",
                string: rows[0].Recompensa
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
        displayImage: imagen_peticion,
        isDelivered: rows[0].estaEntregado
    };

    return data;
}

async function toggleDelivered(TaskId, RequestId, isDelivered) {
    const connection = await conectar();

    const [rows, fields] = await connection.execute(
        'UPDATE MATERIALES_TAREA SET estaEntregado = ? WHERE ID_tarea = ? AND num_peticion = ?',
        [isDelivered, TaskId, RequestId], (error, results, fields) => {
            if (error) {
                throw new Error('Error updating material request.', error);
            }
        }
    );

    return "OK";
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

    if (rows[0].Tipo_tarea !== 'GenericTask') {
        throw new Error('This task is not a generic task.');
    }

    if (rows.length === 0) {
        throw new Error('There is no task with that id.');
    }

    // Cogemos la recompensa según su tipo.
    switch (rows[0].Recompensa_tipo) {
        case "String" :
            recompensa = {
                type: "TextContent",
                string: rows[0].Recompensa
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
        steps: rows[0].Steps
    };

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
        string: rows[0].Texto_tarea
    };

    contentPack = {
        text: texto,
        image: imageStep,
        video: videoStep,
        audio: audioStep
    };

    const data = {
        displayName: rows[0].Nombre,
        isCompleted: rows[0].Estado,
        content: contentPack
    };

    return data;
}

async function toggleStepCompleted(TaskId, StepId, isCompleted) {
    const connection = await conectar();

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
    toggleStepCompleted
};
