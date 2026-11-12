// Formulário cria ou edita cenário, exige um objetivo principal e salva o resultado na API.
import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { request } from '../api/client.js';
import { blank, labels, placeholders } from '../constants.js';
import { Btn, Field, Layout } from '../components/ui.js';
import { styles } from '../theme.js';

export function FormScreen({
  navigation,
  route,
  session
}) {
  const [v, setV] = useState({
      ...blank
    }),
    [title, setTitle] = useState('Meu cenário solar'),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const old = route.params?.edit;
    let inputs = old?.inputs || {};
    if (typeof inputs === 'string') {
      try {
        inputs = JSON.parse(inputs);
      } catch {
        inputs = {};
      }
    }
    setV(Object.fromEntries(Object.keys(blank).map(k => [k, String(inputs?.[k] ?? '')])));
    setTitle(old?.title || 'Meu cenário solar');
  }, [route.params?.edit]);
  const set = (k, x) => setV(o => ({
    ...o,
    [k]: x
  }));
  const textFields = ['location', 'distributor', 'solarSource', 'solarSourceUrl', 'solarConsultedOn', 'gd2Category', 'connectionDate'];
  const payload = Object.fromEntries(Object.entries(v).filter(([, x]) => String(x).trim() !== '').map(([k, x]) => textFields.includes(k) ? [k, x] : [k, Number(x.replace(',', '.'))]));
  const submit = async () => {
    try {
      setBusy(true);
      if (!Object.keys(payload).some(k => ['targetKwhMonth', 'targetSavingsMonth', 'monthlyBill', 'budget'].includes(k))) throw Error('Preencha ao menos um: meta de geração, meta de economia, conta mensal ou orçamento.');
      if (payload.coveragePercent && !payload.monthlyBill) throw Error('Para calcular o percentual de redução, informe também a conta mensal.');
      const result = await request('/simulations/calculate', {
        token: session.token,
        method: 'POST',
        body: payload
      });
      const body = {
        title,
        inputs: payload
      };
      const saved = route.params?.edit ? await request(`/simulations/${route.params.edit.id}`, {
        token: session.token,
        method: 'PUT',
        body
      }) : await request('/simulations', {
        token: session.token,
        method: 'POST',
        body
      });
      navigation.replace('Resultado', {
        simulation: {
          ...saved,
          result
        }
      });
    } catch (e) {
      Alert.alert('Revise os dados', e.message);
    } finally {
      setBusy(false);
    }
  };
  return <Layout><Text style={styles.eyebrow}>NOVO CENÁRIO</Text><Text style={styles.h1}>O que você{'\n'}quer alcançar?</Text><Text style={styles.body}>Preencha só o que souber. É obrigatório informar ao menos um destes itens: meta de geração, meta de economia, conta mensal ou orçamento.</Text><View style={styles.card}><Field label="Nome do cenário" value={title} onChangeText={setTitle} optional={false} />{['location', 'distributor', 'targetKwhMonth', 'targetSavingsMonth', 'coveragePercent', 'monthlyBill', 'budget', 'availableAreaM2'].map(k => <Field key={k} label={labels[k]} value={v[k]} onChangeText={x => set(k, x)} placeholder={placeholders[k]} keyboardType={textFields.includes(k) ? 'default' : 'decimal-pad'} />)}</View><Text style={styles.section}>Tarifa e conexão (se souber)</Text><Text style={styles.bodySmall}>Se deixar a tarifa em branco, usamos R$ 0,81/kWh como base nacional indicativa. TE, TUSD e Fio B refinam a economia; confira os valores da sua fatura.</Text><View style={styles.card}>{['tariff', 'tariffTE', 'tariffTUSD', 'fioBShare', 'gd2Category', 'connectionDate'].map(k => <Field key={k} label={labels[k]} value={v[k]} onChangeText={x => set(k, x)} placeholder={placeholders[k]} keyboardType={textFields.includes(k) ? 'default' : 'decimal-pad'} />)}</View><Text style={styles.section}>Dados técnicos (se disponíveis)</Text><Text style={styles.bodySmall}>O sistema já usa desempenho 0,75 e custo de referência de R$ 3.170/kWp. Sem HSP local cadastrada, usa a faixa nacional de 4,44–5,48 kWh/m²/dia e sinaliza a incerteza.</Text><View style={styles.card}>{['hspKwhM2Day', 'solarSource', 'solarSourceUrl', 'solarConsultedOn', 'targetKwp', 'performanceRatio', 'costPerKwp', 'selfConsumptionFraction'].map(k => <Field key={k} label={labels[k]} value={v[k]} onChangeText={x => set(k, x)} placeholder={placeholders[k]} keyboardType={textFields.includes(k) ? 'default' : 'decimal-pad'} />)}</View><Btn title={busy ? 'Calculando…' : 'Calcular cenário  →'} onPress={submit} /></Layout>;
}
