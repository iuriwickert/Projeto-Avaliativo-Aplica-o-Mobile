// Centraliza configuração carregada do ambiente e falha cedo se o segredo JWT estiver ausente.
import 'dotenv/config';

export const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET precisa conter ao menos 32 caracteres.');
}

export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '8h';
export const apiPort = Number(process.env.PORT) || 4000;
export const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || '*';
