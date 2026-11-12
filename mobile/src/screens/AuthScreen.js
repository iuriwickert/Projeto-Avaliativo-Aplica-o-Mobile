// Login e cadastro coletam credenciais e mostram erros retornados pela API.
import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Btn, Field, Layout } from '../components/ui.js';
import { styles } from '../theme.js';

export function AuthScreen({
  navigation,
  onLogin,
  onRegister
}) {
  const [mode, setMode] = useState('login'),
    [name, setName] = useState(''),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [busy, setBusy] = useState(false);
  const submit = async () => {
    try {
      setBusy(true);
      await (mode === 'login' ? onLogin({
        email,
        password
      }) : onRegister({
        name,
        email,
        password
      }));
    } catch (e) {
      Alert.alert('Não foi possível entrar', e.message);
    } finally {
      setBusy(false);
    }
  };
  return <Layout><View style={styles.brandMark}><Text style={styles.brandGlyph}>☼</Text></View><Text style={styles.eyebrow}>ENERGIA COM MAIS CLAREZA</Text><Text style={styles.h1}>Planeje o seu{'\n'}próximo passo.</Text><Text style={styles.body}>Explore cenários solares a partir das metas que você já conhece.</Text><View style={styles.card}>{mode === 'register' && <Field label="Seu nome" value={name} onChangeText={setName} placeholder="Como podemos chamar você?" optional={false} />}<Field label="E-mail" value={email} onChangeText={setEmail} placeholder="voce@exemplo.com" keyboardType="email-address" autoCapitalize="none" optional={false} /><Field label="Senha" value={password} onChangeText={setPassword} placeholder="Digite sua senha" secureTextEntry optional={false} />{mode === 'register' && <Text style={styles.helper}>Use ao menos 10 caracteres.</Text>}<Btn title={busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'} onPress={submit} /><Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}><Text style={styles.link}>{mode === 'login' ? 'Primeira vez? Criar conta' : 'Já tem conta? Entrar'}</Text></Pressable></View><Text style={styles.disclaimer}>Estimativas educativas, não orçamento ou garantia de retorno.</Text></Layout>;
}
