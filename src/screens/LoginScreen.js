import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../constants/constant';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { authService } from '../services/api';
import { useGameStore } from '../store/gameStore';
import { useResponsive } from '../utils/responsive';

export default function LoginScreen({ navigation }) {
  const store = useGameStore();
  const { isWatch, paddingHorizontal } = useResponsive();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      Alert.alert('Внимание', 'Введите почту и пароль.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Слабый пароль', 'Пароль должен содержать минимум 6 символов.');
      return;
    }

    setLoading(true);
    try {
      let authData;
      if (isRegisterMode) {
        authData = await authService.signUp(cleanEmail, password);
        Alert.alert('Аккаунт создан! 🎉', 'Вы успешно зарегистрировались.');
      } else {
        authData = await authService.signIn(cleanEmail, password);
      }

      if (store && typeof store.setUser === 'function') {
        await store.setUser({ email: cleanEmail, token: authData.access_token || null });
      }
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Ошибка входа', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal }]} keyboardShouldPersistTaps="handled">
        <View style={styles.innerWrapper}>
          <View style={[styles.imagePlaceholder, isWatch && { marginBottom: 10 }]}>
            <Text style={{ fontSize: isWatch ? 40 : 72 }}>🎲</Text>
            <Text style={[styles.titleText, isWatch && { fontSize: 16, marginTop: 4 }]}>
              {isRegisterMode ? 'Регистрация' : 'Вход'}
            </Text>
          </View>

          <AppInput label={isWatch ? '' : 'Email'} placeholder="example@mail.ru" value={email} onChangeText={setEmail} />
          <AppInput label={isWatch ? '' : 'Пароль'} placeholder="Пароль (от 6 симв.)" value={password} onChangeText={setPassword} isPassword={true} />

          {loading ? (
            <ActivityIndicator size="large" color="#6C47FF" style={{ marginTop: 15 }} />
          ) : (
            <AppButton
              title={isRegisterMode ? 'Создать' : 'Войти'}
              variant="primary"
              size={isWatch ? 'sm' : 'md'}
              onPress={handleAuth}
              style={styles.button}
            />
          )}

          <TouchableOpacity style={styles.switchBtn} onPress={() => setIsRegisterMode(!isRegisterMode)} disabled={loading}>
            <Text style={[styles.switchText, isWatch && { fontSize: 11 }]}>
              {isRegisterMode ? 'Есть аккаунт? Войти' : 'Регистрация'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors?.BACKGROUND || '#1C1E22' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 25 },
  innerWrapper: { width: '100%', maxWidth: 460 },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  titleText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  button: { marginTop: 12 },
  switchBtn: { marginTop: 15, alignItems: 'center' },
  switchText: { color: '#A0A5B0', fontSize: 15, fontWeight: '600' },
});
