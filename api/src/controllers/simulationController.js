// Controladores da API de cenários; o serviço aplica o cálculo e o repositório persiste no MySQL.
import { simulationSchema, simulationInputSchema } from '../validation/schemas.js';
import * as simulationService from '../services/simulationService.js';

export async function calculate(req, res) {
  const input = simulationInputSchema.parse(req.body);
  res.json(await simulationService.calculate(input));
}

export async function list(req, res) {
  res.json(await simulationService.listForUser(req.user.id));
}

export async function create(req, res) {
  const data = simulationSchema.parse(req.body);
  res.status(201).json(await simulationService.createForUser(req.user.id, data));
}

export async function getOne(req, res) {
  res.json(await simulationService.getForUser(req.user.id, req.params.id));
}

export async function update(req, res) {
  const data = simulationSchema.parse(req.body);
  res.json(await simulationService.updateForUser(req.user.id, req.params.id, data));
}

export async function remove(req, res) {
  await simulationService.deleteForUser(req.user.id, req.params.id);
  res.status(204).end();
}
