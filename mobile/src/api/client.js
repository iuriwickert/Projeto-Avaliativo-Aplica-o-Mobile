// Centraliza as chamadas HTTP e injeta o token Bearer nas rotas autenticadas.
const API = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');

export async function request(path, {
  token,
  method = 'GET',
  body
} = {}) {
  if (!API) throw Error('Configure EXPO_PUBLIC_API_URL em mobile/.env antes de usar o app.');
  const r = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? {
        Authorization: `Bearer ${token}`
      } : {})
    },
    ...(body ? {
      body: JSON.stringify(body)
    } : {})
  });
  if (r.status === 204) return null;
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(data.error || `Erro ${r.status}`);
  return data;
}
