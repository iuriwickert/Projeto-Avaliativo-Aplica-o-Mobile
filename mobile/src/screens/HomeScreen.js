// Tela inicial direciona para simulação, histórico e administração conforme o papel da conta.
import React from 'react';
import { Text, View } from 'react-native';
import { Btn, Layout } from '../components/ui.js';
import { C, styles } from '../theme.js';

export function HomeScreen({
  navigation,
  session
}) {
  return <Layout><Text style={styles.eyebrow}>SEU ESPAÇO SOLAR</Text><Text style={styles.h1}>Olá, {session.user.name.split(' ')[0]}.</Text><Text style={styles.body}>Comece com o que você sabe. Os demais dados podem ser estimados quando houver uma referência rastreável.</Text><View style={styles.hero}><Text style={styles.heroTag}>SIMULADOR SOLIS</Text><Text style={styles.heroTitle}>Transforme metas em cenários.</Text><Text style={styles.heroText}>Geração · investimento · retorno{'\n'}com premissas à vista.</Text><Btn title="Criar simulação  →" onPress={() => navigation.navigate('Simulação')} /></View><View style={styles.card}><Text style={styles.cardTitle}>Seu histórico</Text><Text style={styles.bodySmall}>Consulte, compare ou ajuste cenários anteriores.</Text><Btn title="Ver simulações" outline onPress={() => navigation.navigate('Histórico')} /></View>{session.user.role === 'admin' && <View style={styles.card}><Text style={styles.cardTitle}>Área administrativa</Text><Text style={styles.bodySmall}>Revise parâmetros de referência e fontes.</Text><Btn title="Manter referências" outline onPress={() => navigation.navigate('Administração')} /></View>}<Text style={styles.disclaimer}>Dados de produção, tarifa e compensação mudam conforme localidade, telhado e enquadramento.</Text></Layout>;
}
