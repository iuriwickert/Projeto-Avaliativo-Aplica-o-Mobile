// Formatação de moeda usada em resultados e comparações.
export function money(n) {
  return n == null ? '—' : Number(n).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  });
}
