// Restringe ações administrativas com o papel lido da conta autenticada no MySQL.
export function requireAdmin(req, res, next) {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ error: 'Acesso exclusivo de administrador.' });
}
