// Resultado mostra metas, estimativas, faixas, fontes e ressalvas do cálculo persistido.
import React from 'react';
import { Text, View } from 'react-native';
import { labels } from '../constants.js';
import { Btn, Layout, Metric } from '../components/ui.js';
import { C, styles } from '../theme.js';
import { money } from '../utils/format.js';

export function ResultScreen({
  route,
  navigation,
  session
}) {
  const s = route.params?.simulation || {},
    r = s.result || {};
  const bars = r.cashflow || [];
  const max = Math.max(...bars.flatMap(x => [x.cumulativeSavings || 0, x.investment || 0]), 1);
  const inputText = Object.entries(s.inputs || {}).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${labels[k] || k}: ${v}`).join('\n');
  return <Layout><Text style={styles.eyebrow}>CENÁRIO INDICATIVO</Text><Text style={styles.h1}>{s.title || 'Seu resultado'}</Text><Text style={styles.body}>Os resultados usam suas metas e referências disponíveis no momento do cálculo.</Text><View style={styles.card}><Text style={styles.cardTitle}>O que você informou</Text><Text style={styles.bodySmall}>{inputText || 'Nenhuma entrada adicional registrada.'}</Text></View><View style={styles.metrics}><Metric label="Potência sugerida" value={r.suggestedKwp ? `${r.suggestedKwp.toFixed(1)} kWp` : '—'} /><Metric label="Geração estimada" value={r.generationKwhMonth ? `${Math.round(r.generationKwhMonth)} kWh/mês` : r.requestedGenerationKwhMonth ? `${Math.round(r.requestedGenerationKwhMonth)} kWh/mês · meta informada` : r.suggestedKwp ? 'Irradiação local necessária' : r.goalSavingsMonth || r.monthlyBillInput ? 'Tarifa necessária para dimensionar' : 'Informe uma meta de geração'} />{r.generationRangeKwhMonth && <Metric label="Faixa de geração" value={`${Math.round(r.generationRangeKwhMonth.low)}–${Math.round(r.generationRangeKwhMonth.high)} kWh/mês`} />}<Metric label="Investimento de referência" value={r.investmentRange ? money(r.investmentRange.reference) : 'Potência necessária para estimar'} /><Metric label="Economia líquida estimada" value={r.monthlySavings ? `${money(r.monthlySavings)}/mês` : r.savingsRange ? `${money(r.savingsRange.low / 12)}–${money(r.savingsRange.high / 12)}/mês · faixa` : r.goalSavingsMonth ? `${money(r.goalSavingsMonth)}/mês · meta informada` : r.monthlyBillInput ? `Conta informada: ${money(r.monthlyBillInput)}/mês · tarifa necessária` : 'Informe tarifa para estimar'} /><Metric label="Retorno simples" value={r.paybackYears ? `${r.paybackYears.toFixed(1)} anos` : r.paybackRangeYears ? `${r.paybackRangeYears.low.toFixed(1)}–${r.paybackRangeYears.high.toFixed(1)} anos · faixa` : r.investmentRange ? 'Informe tarifa para estimar retorno' : 'Potência e tarifa necessárias'} /></View>{bars.length > 0 && <View style={styles.card}><Text style={styles.cardTitle}>Investimento e economia acumulada</Text><Text style={styles.bodySmall}>R$ nominais · saldo simples, sem reajuste nem degradação</Text><View style={styles.chart}><View style={styles.legend}><Text style={styles.bodySmall}>■ Economia acumulada</Text><Text style={[styles.bodySmall, {
            color: C.orange
          }]}>■ Investimento</Text></View><Text style={styles.axis}>R$ {Math.round(max).toLocaleString('pt-BR')}</Text><View style={styles.barRow}>{bars.filter((_, i) => i % 2 === 0).map(p => <View key={p.year} style={styles.barSlot}><View style={{
              height: Math.max(90, (p.cumulativeSavings || 0) / max * 100),
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 2
            }}><View style={[styles.bar, {
                height: Math.max(2, (p.cumulativeSavings || 0) / max * 90),
                backgroundColor: C.green
              }]} /><View style={[styles.bar, {
                height: Math.max(2, (p.investment || 0) / max * 90),
                backgroundColor: C.orange
              }]} /></View><Text style={styles.barLabel}>{p.year}</Text></View>)}</View><Text style={styles.axis}>0                         Anos                         24</Text></View></View>}<View style={styles.card}><Text style={styles.cardTitle}>Premissas estimadas e origem</Text><Text style={styles.bodySmall}>Cada valor identifica se foi informado ou estimado. Confira os detalhes antes de usar o cenário.</Text>{Object.entries(r.parameters || {}).map(([k, p]) => <View style={styles.parameter} key={k}><Text style={styles.parameterName}>{k === 'solarResource' ? 'Irradiação solar' : k === 'performanceRatio' ? 'Fator de desempenho' : k === 'installedCost' ? 'Custo instalado' : k === 'selfConsumption' ? 'Autoconsumo' : k === 'tariff' ? 'Tarifa usada' : k === 'compensationRule' ? 'Regra de compensação' : k} · {p.nature}</Text><Text style={styles.bodySmall}>{p.range || p.value} {p.unit} · {p.source || 'Modelo Solis'}{p.consultedOn ? ` · consulta ${p.consultedOn}` : ''}</Text>{p.limitation && <Text style={styles.helper}>{p.limitation}</Text>}</View>)}</View>{r.constraints?.map((x, i) => <View style={styles.notice} key={i}><Text style={styles.noticeText}>Atenção: {x}</Text></View>)}{r.warnings?.map((x, i) => <View style={styles.warning} key={i}><Text style={styles.warningText}>{x}</Text></View>)}<Btn title="Editar cenário" outline onPress={() => navigation.navigate('Simulação', {
      edit: s
    })} /><Btn title="Histórico" onPress={() => navigation.navigate('Histórico')} /></Layout>;
}
