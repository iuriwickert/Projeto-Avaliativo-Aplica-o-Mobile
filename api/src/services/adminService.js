// Ações administrativas limitadas à manutenção de referências e consulta de suporte.
import { MODEL } from '../calculator.js';
import { listAll, save } from '../repositories/referenceRepository.js';
import { listLatestForAdmin } from '../repositories/simulationRepository.js';
import { HttpError } from '../utils/httpError.js';
import { referenceUnits } from '../validation/schemas.js';

export async function getReferences() {
  return { ...MODEL, ...(await listAll()) };
}

export async function updateReference(key, reference, adminId) {
  if (!referenceUnits[key]) throw new HttpError(404, 'Parâmetro desconhecido.');
  if (reference.unit !== referenceUnits[key]) {
    throw new HttpError(400, `Unidade obrigatória: ${referenceUnits[key]}`);
  }
  if (['performance_ratio', 'fio_b_fraction', 'gd2_transition_percent', 'self_consumption_fraction'].includes(key) && reference.value > 1) {
    throw new HttpError(400, 'Este parâmetro deve ficar entre 0 e 1.');
  }
  return save({ key, reference, updatedBy: adminId });
}

export async function listAdminSimulations() {
  return listLatestForAdmin();
}
