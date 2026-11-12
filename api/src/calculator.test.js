import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSimulation } from './calculator.js';

test('calcula potência, geração e cashflow com referências informadas', () => {
  const result = calculateSimulation({ location:'Campinas, SP', targetKwhMonth:500, hspKwhM2Day:5, solarSource:'Atlas INPE', solarSourceUrl:'https://www.gov.br', solarConsultedOn:'2026-11-12', tariff:0.9, fioBShare:0.35, costPerKwp:4500 }, {});
  assert.ok(result.suggestedKwp > 4 && result.suggestedKwp < 5);
  assert.equal(Math.round(result.generationKwhMonth), 500);
  assert.equal(result.cashflow.length, 26);
  assert.equal(result.parameters.solarResource.nature, 'informado pela pessoa');
  assert.equal(result.annualSavings, null, 'não aplica 60% à tarifa cheia sem TE, TUSD e enquadramento GD II');
  assert.ok(result.savingsRange);
});
test('expõe insuficiência de recurso e conflito de restrições', () => {
  const missing = calculateSimulation({ location:'', budget:1000 }, {});
  assert.equal(missing.generationKwhYear, null);
  assert.ok(missing.warnings.length >= 2);
  const tight = calculateSimulation({ location:'Cidade', targetKwp:10, hspKwhM2Day:5, availableAreaM2:20, solarSource:'Atlas', costPerKwp:5000, budget:10000 }, {});
  assert.ok(tight.constraints.length >= 1);
  assert.ok(tight.warnings.some(x => x.includes('Área')));
});

test('usa a faixa nacional sem localização e limita potência ao orçamento', () => {
  const result = calculateSimulation({ targetKwhMonth:500, budget:10000 }, {});
  assert.equal(result.parameters.solarResource.range, '4,44–5,48');
  assert.ok(result.suggestedKwp > 0 && result.suggestedKwp < result.requestedKwp);
  assert.ok(result.constraints.some(x => x.includes('Melhor cenário')));
  assert.ok(result.generationRangeKwhMonth.high > result.generationRangeKwhMonth.low);
});

test('não reutiliza referência solar nem tarifa de outra localidade', () => {
  const result = calculateSimulation({ location:'Santos, SP', distributor:'Distribuidora X', targetKwhMonth:300 }, {
    solar_resource:{ value:6, region:'Manaus, AM' }, avoided_tariff:{ value:1.2, region:'Distribuidora Y' }
  });
  assert.equal(result.generationKwhMonth,null);
  assert.ok(result.warnings.some(x => x.includes('dado climático local')));
});

test('aplica a regra de transição somente com componentes tarifários e categoria GD II', () => {
  const input={location:'Cidade',targetKwhMonth:300,hspKwhM2Day:5,solarSource:'Atlas',tariffTE:0.2,tariffTUSD:0.7,fioBShare:0.5,gd2Category:'GD II',connectionDate:'2024-01-10',selfConsumptionFraction:0.5};
  const valid=calculateSimulation(input,{});
  assert.equal(valid.assumptions.exportValueFactor,0.7);
  assert.ok(valid.annualSavings>0);
  const unknown=calculateSimulation({...input,gd2Category:''},{});
  assert.equal(unknown.annualSavings,null);
  assert.ok(unknown.savingsRange);
});
