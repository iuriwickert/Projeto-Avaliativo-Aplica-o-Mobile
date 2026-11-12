// Inicializa o banco, provisiona o primeiro administrador e inicia o Express.
import './config.js';
import { app } from './app.js';
import { apiPort } from './config.js';
import { bootstrapAdmin } from './services/authService.js';

bootstrapAdmin({
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
})
  .then(() => {
    app.listen(apiPort, () => {
      console.log(`Solis API escutando na porta ${apiPort}`);
    });
  })
  .catch((error) => {
    console.error('Não foi possível preparar a API:', error.message);
    process.exit(1);
  });
