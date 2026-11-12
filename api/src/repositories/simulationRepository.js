// Consultas de simulação sempre recebem userId para preservar o isolamento por proprietário.
import { pool } from '../db/pool.js';

export async function listByUser(userId) {
  const [rows] = await pool.execute(
    'SELECT id,user_id,title,inputs,result,created_at,updated_at FROM simulations WHERE user_id=? ORDER BY updated_at DESC',
    [userId],
  );
  return rows;
}

export async function create({ userId, title, inputs, result }) {
  const [row] = await pool.execute(
    'INSERT INTO simulations(user_id,title,inputs,result) VALUES(?,?,?,?)',
    [userId, title, JSON.stringify(inputs), JSON.stringify(result)],
  );
  return {
    id: row.insertId,
    user_id: userId,
    title,
    inputs,
    result,
  };
}

export async function findByIdAndOwner(id, userId) {
  const [rows] = await pool.execute(
    'SELECT id,user_id,title,inputs,result,created_at,updated_at FROM simulations WHERE id=? AND user_id=?',
    [id, userId],
  );
  return rows[0] || null;
}

export async function updateByOwner({ id, userId, title, inputs, result }) {
  await pool.execute(
    'UPDATE simulations SET title=?,inputs=?,result=? WHERE id=? AND user_id=?',
    [title, JSON.stringify(inputs), JSON.stringify(result), id, userId],
  );
}

export async function deleteByOwner(id, userId) {
  const [result] = await pool.execute(
    'DELETE FROM simulations WHERE id=? AND user_id=?',
    [id, userId],
  );
  return result.affectedRows > 0;
}

export async function listLatestForAdmin() {
  const [rows] = await pool.execute(
    'SELECT s.id,s.user_id,u.email,s.title,s.inputs,s.result,s.updated_at FROM simulations s JOIN users u ON u.id=s.user_id ORDER BY s.updated_at DESC LIMIT 200',
  );
  return rows;
}
