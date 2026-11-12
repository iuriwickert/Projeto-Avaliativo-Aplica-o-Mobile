// Controladores traduzem requisições HTTP em chamadas aos serviços de autenticação.
import { loginSchema, registerSchema } from '../validation/schemas.js';
import { loginUser, logoutSession, registerUser } from '../services/authService.js';

export async function register(req, res) {
  const data = registerSchema.parse(req.body);
  res.status(201).json(await registerUser(data));
}

export async function login(req, res) {
  const data = loginSchema.parse(req.body);
  res.json(await loginUser(data));
}

export function currentUser(req, res) {
  res.json({ user: req.user });
}

export async function logout(req, res) {
  await logoutSession(req.jwt);
  res.status(204).end();
}
