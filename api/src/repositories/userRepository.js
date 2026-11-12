// Operações de persistência de contas e sessões revogadas; regras de autenticação ficam nos serviços.
import { pool } from '../db/pool.js';

export async function findByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id,name,email,password_hash,role,active FROM users WHERE email=?',
    [email],
  );
  return rows[0] || null;
}

export async function findActiveById(id) {
  const [rows] = await pool.execute(
    'SELECT id,name,email,role,active FROM users WHERE id=? AND active=TRUE',
    [id],
  );
  return rows[0] || null;
}

export async function createUser({ name, email, passwordHash, role = 'user' }) {
  const [result] = await pool.execute(
    'INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)',
    [name, email, passwordHash, role],
  );
  return { id: result.insertId, name, email, role };
}

export async function updateRole(id, role) {
  await pool.execute('UPDATE users SET role=? WHERE id=?', [role, id]);
}

export async function isTokenRevoked(jti) {
  const [rows] = await pool.execute(
    'SELECT jti FROM revoked_tokens WHERE jti=? AND expires_at > NOW()',
    [jti],
  );
  return rows.length > 0;
}

export async function revokeToken(jti, expiresAt) {
  await pool.execute(
    'INSERT IGNORE INTO revoked_tokens(jti,expires_at) VALUES(?,?)',
    [jti, expiresAt],
  );
}
