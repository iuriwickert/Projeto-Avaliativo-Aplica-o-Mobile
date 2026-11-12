// Verifica a conectividade real com o banco, não apenas se o processo Express está ativo.
import { pool } from '../db/pool.js';

export async function health(_req, res) {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', database: 'connected' });
}
