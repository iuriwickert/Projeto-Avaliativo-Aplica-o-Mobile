// Administração edita referências com fonte e localidade; a API revalida o papel e os dados.
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { request } from '../api/client.js';
import { Btn, Field, Layout } from '../components/ui.js';
import { C, styles } from '../theme.js';

export function AdminScreen({
  session
}) {
  const [refs, setRefs] = useState({}),
    [key, setKey] = useState('solar_resource'),
    [form, setForm] = useState({
      value: '',
      unit: 'kWh/m²/dia',
      source_name: '',
      source_url: '',
      region: '',
      consulted_on: new Date().toISOString().slice(0, 10),
      limitation: ''
    });
  useEffect(() => {
    request('/admin/references', {
      token: session.token
    }).then(setRefs).catch(e => Alert.alert('Erro', e.message));
  }, []);
  const keys = [['solar_resource', 'HSP local'], ['performance_ratio', 'Fator desempenho'], ['installed_cost_per_kwp', 'Custo por kWp'], ['avoided_tariff', 'Tarifa evitável'], ['fio_b_fraction', 'Fio B'], ['gd2_transition_percent', 'Regra GD II 2026'], ['self_consumption_fraction', 'Autoconsumo']];
  const select = k => {
    setKey(k);
    const p = refs[k] || {};
    setForm({
      value: String(p.value ?? ''),
      unit: p.unit || {
        solar_resource: 'kWh/m²/dia',
        performance_ratio: 'fração',
        installed_cost_per_kwp: 'R$/kWp',
        avoided_tariff: 'R$/kWh',
        fio_b_fraction: 'fração',
        gd2_transition_percent: 'fração',
        self_consumption_fraction: 'fração'
      }[k],
      source_name: p.source_name || '',
      source_url: p.source_url || '',
      region: p.region || '',
      consulted_on: p.consulted_on || new Date().toISOString().slice(0, 10),
      limitation: p.limitation || ''
    });
  };
  const save = async () => {
    try {
      const d = await request(`/admin/references/${key}`, {
        token: session.token,
        method: 'PUT',
        body: {
          ...form,
          value: Number(form.value)
        }
      });
      setRefs(o => ({
        ...o,
        [key]: d
      }));
      Alert.alert('Salvo', 'Referência atualizada.');
    } catch (e) {
      Alert.alert('Erro ao salvar', e.message);
    }
  };
  if (session.user.role !== 'admin') return <Layout><Text>Acesso restrito.</Text></Layout>;
  return <Layout><Text style={styles.eyebrow}>ADMINISTRAÇÃO</Text><Text style={styles.h1}>Referências</Text><Text style={styles.body}>Registre valor, unidade, fonte, link, data de consulta e limite de aplicação. A API valida o papel de administrador.</Text><View style={styles.pills}>{keys.map(([k, label]) => <Pressable key={k} onPress={() => select(k)} style={[styles.pill, key === k && styles.pillActive]}><Text style={[styles.pillText, key === k && styles.pillTextActive]}>{label}</Text></Pressable>)}</View><View style={styles.card}><Field label="Valor" value={form.value} onChangeText={x => setForm(o => ({
        ...o,
        value: x
      }))} keyboardType="decimal-pad" optional={false} /><Field label="Unidade" value={form.unit} onChangeText={x => setForm(o => ({
        ...o,
        unit: x
      }))} optional={false} /><Field label="Fonte" value={form.source_name} onChangeText={x => setForm(o => ({
        ...o,
        source_name: x
      }))} optional={false} /><Field label="URL" value={form.source_url} onChangeText={x => setForm(o => ({
        ...o,
        source_url: x
      }))} optional={false} /><Field label="Localidade abrangida (cidade ou distribuidora)" value={form.region} onChangeText={x => setForm(o => ({
        ...o,
        region: x
      }))} /><Field label="Data de consulta" value={form.consulted_on} onChangeText={x => setForm(o => ({
        ...o,
        consulted_on: x
      }))} optional={false} /><Field label="Limitação" value={form.limitation} onChangeText={x => setForm(o => ({
        ...o,
        limitation: x
      }))} multiline optional={false} /><Btn title="Salvar referência" onPress={save} /></View><Text style={styles.section}>Valores atuais</Text>{keys.map(([k, label]) => <Text key={k} style={styles.bodySmall}>{label}: {refs[k]?.value ?? 'não cadastrado'} {refs[k]?.unit || ''} · {refs[k]?.source_name || refs[k]?.source || 'sem fonte'}</Text>)}</Layout>;
}
