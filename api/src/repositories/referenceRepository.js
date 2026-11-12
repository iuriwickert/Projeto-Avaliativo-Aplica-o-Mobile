// Persiste referências com valor, unidade, fonte, localidade, data e limitações auditáveis.
import { pool } from '../db/pool.js';

export async function listAll() {
  const [rows] = await pool.execute(
    'SELECT `key`,value,unit,source_name,source_url,region,consulted_on,limitation FROM reference_parameters',
  );
  return Object.fromEntries(rows.map((row) => [row.key, { ...row, value: row.value }]));
}

export async function save({ key, reference, updatedBy }) {
  const { value, unit, source_name, source_url, region, consulted_on, limitation } = reference;
  await pool.execute(
    'INSERT INTO reference_parameters(`key`,value,unit,source_name,source_url,region,consulted_on,limitation,updated_by) VALUES(?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE value=VALUES(value),unit=VALUES(unit),source_name=VALUES(source_name),source_url=VALUES(source_url),region=VALUES(region),consulted_on=VALUES(consulted_on),limitation=VALUES(limitation),updated_by=VALUES(updated_by)',
    [key, value, unit, source_name, source_url, region || null, consulted_on, limitation, updatedBy],
  );
  return { key, ...reference };
}
