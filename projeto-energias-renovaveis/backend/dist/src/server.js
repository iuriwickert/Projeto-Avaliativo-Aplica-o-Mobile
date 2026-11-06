"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const app_1 = require("./app");
async function main() {
    await database_1.pool.query('SELECT 1');
    (0, app_1.createApp)().listen(env_1.config.port, '0.0.0.0', () => {
        console.log(`API Raiz Renovável disponível na porta ${env_1.config.port}.`);
    });
}
main().catch(async (error) => {
    console.error('Não foi possível iniciar a API. Confira as variáveis de ambiente e o MySQL.', error);
    await database_1.pool.end();
    process.exitCode = 1;
});
