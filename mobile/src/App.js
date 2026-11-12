// Ponto de entrada: restaura a sessão, configura a navegação e conecta cada tela aos fluxos de autenticação.
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { request } from './api/client.js';
import { styles, C } from './theme.js';
import { AuthScreen } from './screens/AuthScreen.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { FormScreen } from './screens/FormScreen.js';
import { ResultScreen } from './screens/ResultScreen.js';
import { HistoryScreen } from './screens/HistoryScreen.js';
import { AdminScreen } from './screens/AdminScreen.js';

const Stack = createNativeStackNavigator();

function App() {
  const [session, setSession] = useState(null);
  const [boot, setBoot] = useState(true);

  // Recupera o token protegido; a API confirma se a sessão ainda está válida.
  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('solis-token');
        if (token) {
          const data = await request('/auth/me', { token });
          setSession({ token, user: data.user });
        }
      } catch {
        await SecureStore.deleteItemAsync('solis-token');
      } finally {
        setBoot(false);
      }
    })();
  }, []);

  // Login e cadastro guardam o JWT no armazenamento seguro do dispositivo.
  const establishSession = async (path, body) => {
    const data = await request(path, { method: 'POST', body });
    await SecureStore.setItemAsync('solis-token', data.token);
    setSession({ token: data.token, user: data.user });
  };
  const login = (data) => establishSession('/auth/login', data);
  const register = (data) => establishSession('/auth/register', data);

  // A API revoga o jti; em seguida o token local é removido mesmo se a rede falhar.
  const logout = async () => {
    try {
      await request('/auth/logout', { token: session.token, method: 'POST' });
    } catch {}
    await SecureStore.deleteItemAsync('solis-token');
    setSession(null);
  };

  if (boot) return <View style={styles.loading}><ActivityIndicator size="large" color={C.green} /></View>;
  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer key={session?.user.id || 'guest'}>
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: C.paper }, headerTintColor: C.ink, headerTitleStyle: { fontWeight: '800' }, contentStyle: { backgroundColor: C.paper } }}>
          {!session ? (
            <Stack.Screen name="Entrar" options={{ headerShown: false }}>
              {(props) => <AuthScreen {...props} onLogin={login} onRegister={register} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Início" options={{ headerRight: () => <Pressable onPress={logout}><Text style={styles.navAction}>Sair</Text></Pressable> }}>
                {(props) => <HomeScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="Simulação" options={{ title: 'Nova simulação' }}>
                {(props) => <FormScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="Resultado" options={{ title: 'Seu cenário' }}>
                {(props) => <ResultScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="Histórico">
                {(props) => <HistoryScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="Administração">
                {(props) => <AdminScreen {...props} session={session} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default App;
