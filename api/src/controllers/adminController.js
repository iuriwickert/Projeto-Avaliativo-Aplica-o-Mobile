// Controladores administrativos: manutenção de referências e listagem limitada para suporte.
import { referenceSchema } from '../validation/schemas.js';
import { getReferences, listAdminSimulations, updateReference } from '../services/adminService.js';

export async function references(_req, res) {
  res.json(await getReferences());
}

export async function saveReference(req, res) {
  const data = referenceSchema.parse(req.body);
  res.json(await updateReference(req.params.key, data, req.user.id));
}

export async function simulations(_req, res) {
  res.json(await listAdminSimulations());
}
