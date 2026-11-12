// Componentes visuais reutilizados pelas telas do aplicativo.
import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { styles } from '../theme.js';

// Botão padroniza ação primária, secundária e estado visual de contorno.
export function Btn({
  title,
  onPress,
  outline = false,
  small = false
}) {
  return <Pressable onPress={onPress} style={[styles.btn, outline && styles.btnOutline, small && styles.btnSmall]}><Text style={[styles.btnText, outline && styles.btnTextOutline]}>{title}</Text></Pressable>;
}

// Campo controla rótulo, teclado e proteção de entrada.
export function Field({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  multiline = false,
  optional = true,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = 'sentences'
}) {
  return <View style={styles.field}><Text style={styles.label}>{label} <Text style={styles.optional}>{optional ? '· opcional' : ''}</Text></Text><TextInput value={value == null ? '' : String(value)} onChangeText={onChangeText} keyboardType={keyboardType} multiline={multiline} secureTextEntry={secureTextEntry} autoCapitalize={autoCapitalize} placeholder={placeholder || 'Digite aqui'} placeholderTextColor="#9AA9A0" style={[styles.input, multiline && {
      height: 64,
      textAlignVertical: 'top'
    }]} /></View>;
}

// Layout mantém rolagem e comportamento do teclado consistentes nas telas.
export function Layout({
  children
}) {
  return <KeyboardAvoidingView style={{
    flex: 1
  }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">{children}</ScrollView></KeyboardAvoidingView>;
}

// Metric apresenta um valor calculado ou explica qual dado falta.
export function Metric({
  label,
  value
}) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}
