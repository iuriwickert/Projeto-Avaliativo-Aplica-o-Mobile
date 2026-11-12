// Conecta o motor de cálculo ao CRUD: cada resultado salvo é um retrato das premissas daquele momento.
import { calculateSimulation } from '../calculator.js';
import { listAll as listReferences } from '../repositories/referenceRepository.js';
import * as simulationRepository from '../repositories/simulationRepository.js';
import { HttpError } from '../utils/httpError.js';

export async function calculate(input) {
  return calculateSimulation(input, await listReferences());
}

export async function listForUser(userId) {
  return simulationRepository.listByUser(userId);
}

export async function createForUser(userId, { title, inputs }) {
  const result = await calculate(inputs);
  return simulationRepository.create({ userId, title, inputs, result });
}

export async function getForUser(userId, id) {
  const simulation = await simulationRepository.findByIdAndOwner(id, userId);
  if (!simulation) throw new HttpError(404, 'Simulação não encontrada.');
  return simulation;
}

export async function updateForUser(userId, id, { title, inputs }) {
  const existing = await getForUser(userId, id);
  const result = await calculate(inputs);
  await simulationRepository.updateByOwner({ id, userId, title, inputs, result });
  return { ...existing, title, inputs, result };
}

export async function deleteForUser(userId, id) {
  const deleted = await simulationRepository.deleteByOwner(id, userId);
  if (!deleted) throw new HttpError(404, 'Simulação não encontrada.');
}
