// Armazena senhas com scrypt e salt aleatório; a comparação usa tempo constante.
import { randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

export async function hashPassword(password) {
  const salt = randomUUID();
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password, encodedHash) {
  const [salt, savedHex] = encodedHash.split(':');
  if (!salt || !savedHex) return false;

  const savedKey = Buffer.from(savedHex, 'hex');
  const candidateKey = await scrypt(password, salt, savedKey.length);
  return savedKey.length === candidateKey.length && timingSafeEqual(savedKey, candidateKey);
}
