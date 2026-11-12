// Rotas de acesso público e rotas de sessão que exigem Bearer JWT.
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { asyncRoute } from '../middleware/asyncRoute.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const authRoutes = Router();

authRoutes.post('/register', asyncRoute(authController.register));
authRoutes.post('/login', asyncRoute(authController.login));
authRoutes.get('/me', requireAuth, authController.currentUser);
authRoutes.post('/logout', requireAuth, asyncRoute(authController.logout));
