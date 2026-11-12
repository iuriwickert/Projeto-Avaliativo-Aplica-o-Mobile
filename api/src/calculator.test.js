import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSimulation, hasMinimumScenarioInput } from './calculator.js';
test('calcula um cenário com cada dado-base isolado e usa a tarifa-base sem entrada manual', () => {
  const cases = [['meta de geração', {
    targetKwhMonth: 500
  }], ['meta de economia', {
    targetSavingsMonth: 450
  }], ['conta mensal', {
    monthlyBill: 450
  }], ['orçamento', {
    budget: 15000
  }]];
  for (const [label, input] of cases) {
    assert.equal(hasMinimumScenarioInput(input), true, `${label} deve satisfazer a entrada mínima`);
    const result = calculateSimulation(input, {});
    assert.ok(result.suggestedKwp > 0, `${label}: deve sugerir potência`);
    assert.ok(result.generationKwhMonth > 0, `${label}: deve calcular geração`);
    assert.ok(result.investmentRange?.reference > 0, `${label}: deve estimar investimento`);
    assert.equal(result.parameters.tariff.value, 0.81, `${label}: deve usar a tarifa-base padrão`);
    assert.ok(result.savingsRange?.low > 0, `${label}: deve estimar uma faixa de economia`);
    assert.ok(result.paybackRangeYears?.low > 0, `${label}: deve estimar retorno`);
  }
  assert.equal(hasMinimumScenarioInput({}), false, 'sem nenhum dado-base deve ser rejeitado');
});
test('calcula potência, geração e cashflow com referências informadas', () => {
  const result = calculateSimulation({
    location: 'Campinas, SP',
    targetKwhMonth: 500,
    hspKwhM2Day: 5,
    solarSource: 'Atlas INPE',
    solarSourceUrl: 'https://www.gov.br',
    solarConsultedOn: '2026-11-12',
    tariff: 0.9,
    fioBShare: 0.35,
    costPerKwp: 4500
  }, {});
  assert.ok(result.suggestedKwp > 4 && result.suggestedKwp < 5);
  assert.equal(Math.round(result.generationKwhMonth), 500);
  assert.equal(result.cashflow.length, 26);
  assert.equal(result.parameters.solarResource.nature, 'informado pela pessoa');
  assert.equal(result.annualSavings, null, 'não aplica 60% à tarifa cheia sem TE, TUSD e enquadramento GD II');
  assert.ok(result.savingsRange);
});
test('dimensiona orçamento e expõe conflitos de restrições', () => {
  const budgetOnly = calculateSimulation({
    location: '',
    budget: 1000
  }, {});
  assert.ok(budgetOnly.suggestedKwp > 0);
  assert.ok(budgetOnly.generationKwhYear > 0);
  assert.ok(budgetOnly.warnings.some(x => x.includes('apenas o orçamento')));
  const tight = calculateSimulation({
    location: 'Cidade',
    targetKwp: 10,
    hspKwhM2Day: 5,
    availableAreaM2: 20,
    solarSource: 'Atlas',
    costPerKwp: 5000,
    budget: 10000
  }, {});
  assert.ok(tight.constraints.length >= 1);
  assert.ok(tight.warnings.some(x => x.includes('Área')));
});
test('usa a faixa nacional sem localização e limita potência ao orçamento', () => {
  const result = calculateSimulation({
    targetKwhMonth: 500,
    budget: 10000
  }, {});
  assert.equal(result.parameters.solarResource.range, '4,44–5,48');
  assert.ok(result.suggestedKwp > 0 && result.suggestedKwp < result.requestedKwp);
  assert.ok(result.constraints.some(x => x.includes('Melhor cenário')));
  assert.ok(result.generationRangeKwhMonth.high > result.generationRangeKwhMonth.low);
});
test('usa referências nacionais quando as referências locais não correspondem', () => {
  const result = calculateSimulation({
    location: 'Santos, SP',
    distributor: 'Distribuidora X',
    targetKwhMonth: 300
  }, {
    solar_resource: {
      value: 6,
      region: 'Manaus, AM'
    },
    avoided_tariff: {
      value: 1.2,
      region: 'Distribuidora Y'
    }
  });
  assert.ok(result.generationKwhMonth > 0);
  assert.equal(result.parameters.solarResource.range, '4,44–5,48');
  assert.equal(result.parameters.tariff.value, 0.81);
  assert.ok(result.warnings.some(x => x.includes('faixa nacional')));
});
test('aplica a regra de transição somente com componentes tarifários e categoria GD II', () => {
  const input = {
    location: 'Cidade',
    targetKwhMonth: 300,
    hspKwhM2Day: 5,
    solarSource: 'Atlas',
    tariffTE: 0.2,
    tariffTUSD: 0.7,
    fioBShare: 0.5,
    gd2Category: 'GD II',
    connectionDate: '2024-01-10',
    selfConsumptionFraction: 0.5
  };
  const valid = calculateSimulation(input, {});
  assert.equal(valid.assumptions.exportValueFactor, 0.7);
  assert.ok(valid.annualSavings > 0);
  const unknown = calculateSimulation({
    ...input,
    gd2Category: ''
  }, {});
  assert.equal(unknown.annualSavings, null);
  assert.ok(unknown.savingsRange);
});
