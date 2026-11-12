// Pool MySQL compartilhado por repositórios; consultas usam parâmetros para evitar injeção SQL.
import '../config.js';
import mysql from 'mysql2/promise';

export const pool = mysql.createPool(
  process.env.DATABASE_URL || 'mysql://root@localhost:3306/solis',
);
