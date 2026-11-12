export const MODEL = {
  performance_ratio: { value: 0.75, unit: 'fração', nature: 'estimado pelo sistema', source: 'Premissa inicial baseada na metodologia EPE, PR 0,75 para a maioria dos segmentos', sourceUrl: 'https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-889/NT-EPE-DEA-SEE-009-2025.pdf', limitation: 'Fator agregado de perdas; orientação, inclinação, sombra, temperatura e instalação alteram o resultado.' },
  installed_cost_per_kwp: { value: 31700, unit: 'R$/kWp', nature: 'referência histórica', source: 'EPE, Roadmap tecnológico RED, preço residencial de jan/2024: R$ 3,17/Wp para sistema de 4 kWp', sourceUrl: 'https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-897/NT%20DEA-SEE-14-2024%20-%20RT%20RED%20-%20Tecnologia.pdf', consulted_on: '2026-11-12', limitation: 'Preço histórico observado; não é cotação atual ou orçamento individual.' },
  avoided_tariff: { value: null, unit: 'R$/kWh', nature: 'referência administrada', source: 'Aguardando tarifa da distribuidora e enquadramento', sourceUrl: 'https://dadosabertos.aneel.gov.br/pt_BR/dataset/tarifas-distribuidoras-energia-eletrica', limitation: 'TE/TUSD homologadas não determinam sozinhas a economia líquida nem o valor de compensação.' },
  fio_b_fraction: { value: null, unit: 'fração da TUSD', nature: 'referência administrada', source: 'Aguardando parâmetro tarifário local', sourceUrl: 'https://www2.aneel.gov.br/cedoc/retreh20223150.pdf', limitation: 'Componente Fio B deve ser apurado na tarifa/distribuidora do cenário.' },
  gd2_transition_percent: { value: 0.6, unit: 'fração', nature: 'regra configurável 2026', source: 'Lei 14.300/2022, art. 27, regra de transição GD II em 2026', sourceUrl: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14300.htm', consulted_on: '2026-11-12', limitation: 'Percentual incide sobre componentes definidos em lei, não é desconto linear de 60% na conta. Confirmar categoria e data de acesso.' },
  self_consumption_fraction: { value: 0.7, unit: 'fração', nature: 'assumido pelo sistema', source: 'Hipótese inicial editável pelo usuário', sourceUrl: '', limitation: 'Perfil horário não conhecido; benefício pode diferir significativamente.' },
};

const validNumber = (x) => typeof x === 'number' && Number.isFinite(x) && x > 0;
export function calculateSimulation(input, references = {}) {
  const warnings = [], constraints = [], parameters = {};
  const matches = (scope, region) => Boolean(scope?.trim() && region?.trim() && scope.toLocaleLowerCase().includes(region.toLocaleLowerCase()));
  const solarReference = references.solar_resource?.value == null ? null : { ...references.solar_resource, value:Number(references.solar_resource.value) };
  const regionalSolar = matches(input.location, solarReference?.region) ? solarReference : null;
  const regionalTariff = matches(input.distributor, references.avoided_tariff?.region) ? references.avoided_tariff : null;
  const regionalFioB = matches(input.distributor, references.fio_b_fraction?.region) ? references.fio_b_fraction : null;
  const solar = validNumber(input.hspKwhM2Day) ? {
    value: input.hspKwhM2Day, unit: 'kWh/m²/dia', nature: 'informado pela pessoa', source: input.solarSource || 'Informado pela pessoa (fonte não identificada)', sourceUrl: input.solarSourceUrl || '', consultedOn: input.solarConsultedOn || null,
    limitation: input.solarSource ? 'Validar correspondência com coordenadas, inclinação e período.' : 'Sem fonte rastreável; inserir dado do Atlas INPE para localização.'
  } : regionalSolar?.value ? { ...regionalSolar, nature: 'estimado pelo sistema' } : null;
  const fallbackSolar = !solar && !input.location?.trim();
  if (fallbackSolar) warnings.push('Localização ausente: foi usada faixa nacional aproximada do Atlas INPE (4,44–5,48 kWh/m²/dia); incerteza maior e sem precisão municipal.');
  if (!solar && input.location?.trim()) warnings.push('Localização informada, mas sem dado climático local do Atlas: use a ferramenta do Atlas ou informe HSP com fonte e data. O app não substitui a consulta geográfica.');
  const pr = Number(input.performanceRatio) || Number(references.performance_ratio?.value) || MODEL.performance_ratio.value;
  parameters.performanceRatio = { value: pr, unit: 'fração', nature: input.performanceRatio ? 'informado pela pessoa' : references.performance_ratio?.value ? 'referência administrada' : 'assumido pelo sistema', source: references.performance_ratio?.source || MODEL.performance_ratio.source, sourceUrl: references.performance_ratio?.source_url || MODEL.performance_ratio.sourceUrl, consultedOn: references.performance_ratio?.consulted_on || null, limitation: MODEL.performance_ratio.limitation };
  if (solar) parameters.solarResource = solar;
  const hspLow = fallbackSolar ? 4.44 : solar?.value || null;
  const hspHigh = fallbackSolar ? 5.48 : solar?.value || null;
  const hspMid = hspLow == null ? null : (hspLow + hspHigh) / 2;
  if (fallbackSolar) parameters.solarResource = { range: '4,44–5,48', unit: 'kWh/m²/dia', nature: 'estimativa nacional em faixa', source: 'Atlas Brasileiro de Energia Solar, faixa citada em guia governamental', sourceUrl: 'https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/habitacao/arquivos/9-_guia-de-eficiencia-energetica.pdf', consultedOn: '2026-11-12', limitation: 'Não representa produtividade municipal; usada apenas na ausência de localização, com incerteza elevada.' };
  const kwpPerDay = hspMid == null ? null : hspMid * 30.4375 * pr;
  let kwp = validNumber(input.targetKwp) ? input.targetKwp : null;
  const energyTarget = validNumber(input.targetKwhMonth) ? input.targetKwhMonth : null;
  const goalSavings = validNumber(input.targetSavingsMonth) ? input.targetSavingsMonth : validNumber(input.coveragePercent) && validNumber(input.monthlyBill) ? input.monthlyBill * input.coveragePercent / 100 : null;
  const savingsTarget = goalSavings && validNumber(input.tariff) ? goalSavings / input.tariff : null;
  const annualTarget = energyTarget || savingsTarget;
  if (!kwp && annualTarget && kwpPerDay) kwp = annualTarget / kwpPerDay;
  if (!kwp && input.monthlyBill && input.tariff && kwpPerDay) kwp = Math.max(0.5, input.monthlyBill / input.tariff * 0.7 / kwpPerDay);
  if (!kwp) { warnings.push('Informe uma meta de geração, economia mensal, potência ou conta e tarifa para estimar a potência.'); kwp = 0; }
  const area = validNumber(input.availableAreaM2) ? input.availableAreaM2 : null;
  const costPerKwp = Number(input.costPerKwp || references.installed_cost_per_kwp?.value || MODEL.installed_cost_per_kwp.value) || null;
  const capacityBeforeConstraints = kwp;
  if (area) warnings.push('Área é usada como limitação informada, sem conversão automática para kWp: forma, módulos, espaçamentos, obstáculos e orientação pedem vistoria e referência dimensional do arranjo.');
  if (validNumber(input.budget) && costPerKwp && kwp * costPerKwp > input.budget) {
    const feasible = input.budget / costPerKwp;
    constraints.push(`Meta exige ~${kwp.toFixed(1)} kWp, mas o orçamento comporta ~${feasible.toFixed(1)} kWp ao custo de referência. Melhor cenário pelo orçamento: ${feasible.toFixed(1)} kWp; reduzir meta ou ampliar orçamento.`);
    kwp = feasible;
  }
  if (validNumber(input.targetKwhMonth) && kwpPerDay && kwp * kwpPerDay < input.targetKwhMonth * 0.98) constraints.push('A geração estimada não alcança a meta mensal informada.');
  if (validNumber(input.budget) && !costPerKwp) warnings.push('Sem custo de referência rastreável: compatibilidade com orçamento não pode ser avaliada.');
  if (costPerKwp) parameters.installedCost = { value: costPerKwp, unit: 'R$/kWp', nature: input.costPerKwp ? 'informado pela pessoa' : 'estimado pelo sistema', source: input.costPerKwp ? 'Informado pela pessoa' : references.installed_cost_per_kwp?.source_name || MODEL.installed_cost_per_kwp.source, sourceUrl: references.installed_cost_per_kwp?.source_url || MODEL.installed_cost_per_kwp.sourceUrl, consultedOn: references.installed_cost_per_kwp?.consulted_on || MODEL.installed_cost_per_kwp.consulted_on, limitation: MODEL.installed_cost_per_kwp.limitation };
  const annualKwh = kwpPerDay == null || kwp <= 0 ? null : kwp * kwpPerDay * 12;
  const annualKwhLow = hspLow == null || kwp <= 0 ? null : kwp * hspLow * 30.4375 * pr * 12;
  const annualKwhHigh = hspHigh == null || kwp <= 0 ? null : kwp * hspHigh * 30.4375 * pr * 12;
  const tariff = Number(input.tariff || regionalTariff?.value) || null;
  const selfUse = Math.min(1, Math.max(0, Number(input.selfConsumptionFraction) || Number(references.self_consumption_fraction?.value) || 0.7));
  const investment = costPerKwp && kwp > 0 ? kwp * costPerKwp : null;
  const fioB = Number(input.fioBShare ?? regionalFioB?.value) || null;
  const transition = Number(input.gd2TransitionPercent ?? references.gd2_transition_percent?.value ?? 0.6);
  const gd2Applies = /gd\s*ii/i.test(input.gd2Category || '') && (!input.connectionDate || input.connectionDate >= '2023-01-07');
  const te = Number(input.tariffTE) || null, tusd = Number(input.tariffTUSD) || null;
  const exportValueFactor = fioB == null || !gd2Applies ? null : Math.max(0, 1 - fioB * transition);
  const directTariff = te && tusd ? te + tusd : tariff;
  const exportTariff = te && tusd && fioB != null && gd2Applies ? te + tusd * exportValueFactor : null;
  const effectiveValue = directTariff && exportTariff != null ? directTariff * selfUse + exportTariff * (1 - selfUse) : tariff && selfUse === 1 ? tariff : null;
  const annualSavings = annualKwh != null && effectiveValue ? annualKwh * effectiveValue : null;
  const availableTariff = tariff || (te && tusd ? te + tusd : null);
  const savingsRange = annualKwh != null && availableTariff && !(te && tusd && fioB != null && gd2Applies) ? { low:annualKwh * availableTariff * selfUse, high:annualKwh * availableTariff, unit:'R$/ano', note:'Limites ilustrativos: autoconsumo direto até compensação integral; tarifa local, componentes Fio B e enquadramento podem mudar o resultado.' } : annualSavings != null ? { low:annualSavings, high:annualSavings, unit:'R$/ano', note:'Estimativa baseada nas hipóteses descritas.' } : null;
  if (annualKwh != null && tariff && selfUse < 1 && fioB == null) warnings.push('Economia líquida incerta: faltam distribuidora/TE/TUSD e participação Fio B. A faixa representa autoconsumo direto até compensação integral, sem tarifação mínima.');
  if (annualKwh != null && selfUse < 1 && !gd2Applies) warnings.push('Sem categoria e componentes de tarifa confirmados, o valor da energia exportada não foi presumido; confira enquadramento e distribuidora.');
  if (annualKwh != null && directTariff) warnings.push('A economia simplificada não desconta o custo de disponibilidade/valor mínimo faturável; confira a modalidade e a fatura da distribuidora.');
  if (annualKwh != null && te && tusd && fioB != null && !gd2Applies) warnings.push('Informe e confirme a categoria GD II e a data do pedido de acesso para aplicar a regra tarifária de transição. A economia foi apresentada em faixa.');
  if (annualKwh != null && !tariff && !(te && tusd)) warnings.push('Informe tarifa evitável local para estimar economia. Se disponível, use TE e TUSD homologadas da ANEEL e confira a fatura; tarifa cheia não equivale automaticamente à economia.');
  const paybackYears = investment && annualSavings ? investment / annualSavings : null;
  const paybackRangeYears = investment && savingsRange?.low > 0 ? { low:investment/savingsRange.high, high:investment/savingsRange.low } : null;
  if (annualKwh != null) parameters.selfConsumption = { value: selfUse, unit: 'fração', nature: input.selfConsumptionFraction ? 'informado pela pessoa' : 'assumido pelo sistema', source: input.selfConsumptionFraction ? 'Informado pela pessoa' : 'Hipótese inicial do modelo Solis', sourceUrl: '', consultedOn: null, limitation: 'A parcela autoconsumida depende do perfil horário da residência.' };
  if (tariff || te || tusd) parameters.tariff = { value: tariff || null, te, tusd, unit:'R$/kWh', nature: input.tariff || input.tariffTE ? 'informado pela pessoa' : 'referência administrada', source: input.tariff || input.tariffTE ? 'Informado pela pessoa; validar na fatura e na ANEEL' : regionalTariff?.source_name, sourceUrl: regionalTariff?.source_url || 'https://dadosabertos.aneel.gov.br/pt_BR/dataset/tarifas-distribuidoras-energia-eletrica', consultedOn: regionalTariff?.consulted_on || null, limitation:'Tarifa homologada não representa diretamente economia marginal líquida; confira componentes e modalidade.' };
  parameters.compensationRule = { value:transition, unit:'fração dos componentes elegíveis', nature:gd2Applies?'regra configurável GD II aplicada':'regra GD II disponível, aplicação não confirmada', source:references.gd2_transition_percent?.source_name || MODEL.gd2_transition_percent.source, sourceUrl:references.gd2_transition_percent?.source_url || MODEL.gd2_transition_percent.sourceUrl, consultedOn:references.gd2_transition_percent?.consulted_on || MODEL.gd2_transition_percent.consulted_on, limitation:MODEL.gd2_transition_percent.limitation };
  const plottedAnnualSavings = annualSavings ?? (savingsRange ? (savingsRange.low + savingsRange.high) / 2 : null);
  const cashflow = investment && plottedAnnualSavings ? Array.from({ length: 26 }, (_, year) => ({ year, cumulativeSavings: plottedAnnualSavings * year, investment, net: plottedAnnualSavings * year - investment, isRange: annualSavings == null })) : [];
  if (input.connectionDate && input.connectionDate < '2023-01-07') warnings.push('A regra de compensação depende da data de solicitação de acesso e do enquadramento; validar com a distribuidora e a Lei 14.300.');
  warnings.push('Estimativa preliminar, sem garantia de geração, economia, preço ou retorno. Confirmar com vistoria técnica, distribuidora, tarifa da fatura e proposta profissional.');
  return { suggestedKwp: kwp || null, requestedKwp: capacityBeforeConstraints || null, generationKwhMonth: annualKwh == null ? null : annualKwh / 12, generationRangeKwhMonth: annualKwh == null ? null : { low:annualKwhLow/12, high:annualKwhHigh/12, unit:'kWh/mês' }, generationKwhYear: annualKwh, investmentRange: investment == null ? null : { low: investment, reference: investment, high: investment, unit: 'BRL', note: input.costPerKwp ? 'Custo informado pela pessoa; não representa orçamento conferido.' : `Referência histórica residencial EPE: jan/2024, R$ ${costPerKwp/1000} /Wp; não é orçamento atual.` }, annualSavings, monthlySavings: annualSavings == null ? null : annualSavings / 12, savingsRange, paybackYears, paybackRangeYears, cashflow, parameters, constraints, warnings, assumptions: { monthLengthDays:30.4375, gd2TransitionPercent:transition, exportValueFactor, nature: 'fluxo simplificado sem financiamento, degradação, O&M, troca de inversor ou tarifa mínima; valores podem não se aplicar ao enquadramento do consumidor', source: 'Modelo Solis com referências configuráveis', limitation: 'Regras da Lei 14.300 dependem de categoria, data e componentes da tarifa. Confirme com distribuidora.' } };
}
