"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const database_1 = require("../src/config/database");
const authService_1 = require("../src/services/authService");
async function main() {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
        throw new Error('Defina ADMIN_NAME, ADMIN_EMAIL e ADMIN_PASSWORD (mínimo 12 caracteres) no ambiente antes do seed.');
    }
    const passwordHash = await (0, authService_1.hashPassword)(ADMIN_PASSWORD);
    await database_1.pool.execute(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = 'admin'`, [ADMIN_NAME.trim(), ADMIN_EMAIL.trim().toLowerCase(), passwordHash]);
    console.log(`Administrador preparado: ${ADMIN_EMAIL.trim().toLowerCase()}`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => database_1.pool.end());
