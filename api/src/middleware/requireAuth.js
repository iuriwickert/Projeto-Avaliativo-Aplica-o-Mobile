// Valida Bearer JWT, revogação e conta ativa antes de disponibilizar a identidade na requisição.
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config.js';
import { findActiveById, isTokenRevoked } from '../repositories/userRepository.js';
import { asyncRoute } from './asyncRoute.js';

export const requireAuth = asyncRoute(async (req, res, next) => {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return res.status(401).json({ error: 'Informe o token como Bearer Token.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret, { issuer: 'solis-api' });
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }

  if (await isTokenRevoked(payload.jti)) {
    return res.status(401).json({ error: 'Sessão encerrada. Entre novamente.' });
  }

  const user = await findActiveById(payload.sub);
  if (!user) return res.status(401).json({ error: 'Conta indisponível.' });

  // O papel vem do MySQL, não do conteúdo enviado pelo aplicativo.
  req.user = user;
  req.jwt = payload;
  next();
});
