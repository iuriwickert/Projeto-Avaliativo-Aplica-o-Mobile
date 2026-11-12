// Histórico oferece consulta, edição, duplicação, comparação e exclusão dos cenários da conta.
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { request } from '../api/client.js';
import { labels } from '../constants.js';
import { Btn, Layout } from '../components/ui.js';
import { C, styles } from '../theme.js';
import { money } from '../utils/format.js';

export function HistoryScreen({
  navigation,
  session
}) {
  const [rows, setRows] = useState([]),
    [sel, setSel] = useState([]),
    [busy, setBusy] = useState(true);
  const load = async () => {
    try {
      setRows(await request('/simulations', {
        token: session.token
      }));
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const remove = id => Alert.alert('Excluir simulação?', 'Esta ação remove o cenário do seu histórico.', [{
    text: 'Cancelar'
  }, {
    text: 'Excluir',
    style: 'destructive',
    onPress: async () => {
      try {
        await request(`/simulations/${id}`, {
          token: session.token,
          method: 'DELETE'
        });
        setRows(x => x.filter(r => r.id !== id));
      } catch (e) {
        Alert.alert('Erro', e.message);
      }
    }
  }]);
  const duplicate = async item => {
    try {
      const d = await request('/simulations', {
        token: session.token,
        method: 'POST',
        body: {
          title: `${item.title} (cópia)`,
          inputs: item.inputs
        }
      });
      setRows(x => [d, ...x]);
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  };
  return <Layout><Text style={styles.eyebrow}>CENÁRIOS SALVOS</Text><Text style={styles.h1}>Seu histórico</Text><Text style={styles.body}>Toque em comparar para selecionar até dois cenários.</Text>{busy ? <ActivityIndicator color={C.green} /> : rows.map(x => <Pressable key={x.id} style={[styles.card, sel.includes(x.id) && styles.selected]} onPress={() => setSel(a => a.includes(x.id) ? a.filter(i => i !== x.id) : a.length < 2 ? [...a, x.id] : [a[1], x.id])}><Text style={styles.cardTitle}>{x.title} {sel.includes(x.id) ? '✓' : ''}</Text><Text style={styles.bodySmall}>{x.result?.suggestedKwp ? `${x.result.suggestedKwp.toFixed(1)} kWp · ` : ''}{x.inputs?.location || 'Localização não informada'} · {new Date(x.updated_at).toLocaleDateString('pt-BR')}</Text><View style={styles.actionRow}><Text style={styles.action} onPress={() => navigation.navigate('Resultado', {
          simulation: x
        })}>Abrir</Text><Text style={styles.action} onPress={() => navigation.navigate('Simulação', {
          edit: x
        })}>Editar</Text><Text style={styles.action} onPress={() => duplicate(x)}>Duplicar</Text><Text style={[styles.action, {
          color: C.red
        }]} onPress={() => remove(x.id)}>Excluir</Text></View></Pressable>)}{sel.length === 2 && <View style={styles.card}><Text style={styles.cardTitle}>Comparação</Text>{sel.map(id => {
        const x = rows.find(y => y.id === id);
        return <Text key={id} style={styles.bodySmall}>{x?.title}: {x?.result?.suggestedKwp?.toFixed(1) || '—'} kWp · {money(x?.result?.investmentRange?.reference)} · {x?.result?.paybackYears?.toFixed(1) || '—'} anos</Text>;
      })}</View>}{!rows.length && !busy && <Text style={styles.body}>Ainda não há simulações salvas.</Text>}</Layout>;
}
