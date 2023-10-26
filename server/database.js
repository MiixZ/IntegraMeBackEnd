import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS
}).promise();

/*
export async function query(sql, params) {
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
};
*/

//---------------------------------------------- FUNCIONES QUERY -----------------------------------------------------

export async function getTodoByID(id) {             // Función de prueba que devolverá todos los datos de una tabla por un ID.
    const row = await pool.query(
      `SELECT * FROM todos WHERE id = ?`, [id]);
      return row;
}