// Orquestra cadastro, login e logout sem misturar regras de autenticação às rotas HTTP.
import { hashPassword, verifyPassword } from './passwordService.js';
import { issueToken } from './tokenService.js';
import { createUser, findByEmail, revokeToken, updateRole } from '../repositories/userRepository.js';
import { HttpError } from '../utils/httpError.js';

export async function registerUser(data) {
  const email = data.email.toLowerCase();
  if (await findByEmail(email)) throw new HttpError(409, 'Este e-mail já está cadastrado.');

  try {
    const user = await createUser({
      name: data.name,
      email,
      passwordHash: await hashPassword(data.password),
      role: 'user',
    });
    return { user, token: issueToken(user).token };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Este e-mail já está cadastrado.');
    throw error;
  }
}

export async function loginUser({ email, password }) {
  const userRecord = await findByEmail(email.toLowerCase());
  if (!userRecord?.active || !(await verifyPassword(password, userRecord.password_hash))) {
    throw new HttpError(401, 'E-mail ou senha incorretos.');
  }

  const user = {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    role: userRecord.role,
  };
  return { user, token: issueToken(user).token };
}

export async function logoutSession(jwtPayload) {
  await revokeToken(jwtPayload.jti, new Date(jwtPayload.exp * 1000));
}

// Provisiona o primeiro administrador sem guardar a senha em texto puro.
export async function bootstrapAdmin({ email, password }) {
  if (!email && !password) return;
  if (!email || !password || password.length < 10) {
    throw new Error('ADMIN_EMAIL e ADMIN_PASSWORD (10+ caracteres) devem ser configurados juntos.');
  }

  const normalizedEmail = email.toLowerCase();
  const existing = await findByEmail(normalizedEmail);
  if (existing) {
    if (existing.role !== 'admin') await updateRole(existing.id, 'admin');
    return;
  }

  await createUser({
    name: 'Administrador',
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    role: 'admin',
  });
}
