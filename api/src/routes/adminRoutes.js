// Todas as rotas administrativas aplicam autenticação e autorização no servidor.
import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { asyncRoute } from '../middleware/asyncRoute.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export const adminRoutes = Router();
adminRoutes.use(requireAuth, requireAdmin);

adminRoutes.get('/references', asyncRoute(adminController.references));
adminRoutes.put('/references/:key', asyncRoute(adminController.saveReference));
adminRoutes.get('/simulations', asyncRoute(adminController.simulations));
