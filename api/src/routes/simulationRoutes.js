// Todas as operações de cenário exigem sessão; os controladores aplicam a propriedade do usuário.
import { Router } from 'express';
import * as simulationController from '../controllers/simulationController.js';
import { asyncRoute } from '../middleware/asyncRoute.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const simulationRoutes = Router();
simulationRoutes.use(requireAuth);

simulationRoutes.post('/calculate', asyncRoute(simulationController.calculate));
simulationRoutes.get('/', asyncRoute(simulationController.list));
simulationRoutes.post('/', asyncRoute(simulationController.create));
simulationRoutes.get('/:id', asyncRoute(simulationController.getOne));
simulationRoutes.put('/:id', asyncRoute(simulationController.update));
simulationRoutes.delete('/:id', asyncRoute(simulationController.remove));
