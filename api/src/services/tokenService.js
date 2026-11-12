// Emite JWT com issuer, expiração e jti, que permite revogar uma sessão no logout.
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { jwtExpiresIn, jwtSecret } from '../config.js';

export function issueToken(user) {
  const jti = randomUUID();
  const token = jwt.sign(
    { sub: String(user.id), role: user.role, jti },
    jwtSecret,
    { expiresIn: jwtExpiresIn, issuer: 'solis-api' },
  );
  return { token, jti };
}
