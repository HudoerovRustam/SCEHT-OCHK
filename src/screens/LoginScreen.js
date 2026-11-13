import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/constant';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { authService } from '../services/api';
import { useGameStore } from '../store/gameStore';

export default function LoginScreen({ navigation }) {
  const store = useGameStore();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      Alert.alert('Внимание', 'Введите почту (логин) и пароль.');
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
        Alert.alert('Аккаунт создан! 🎉', 'Вы успешно зарегистрировались в системе.');
      } else {
        authData = await authService.signIn(cleanEmail, password);
      }

      const userProfile = {
        email: cleanEmail,
        token: authData.access_token || null
      };

      if (store && typeof store.setUser === 'function') {
        await store.setUser(userProfile);
      }

      if (navigation && typeof navigation.replace === 'function') {
        navigation.replace('MainTabs');
      }
    } catch (error) {
      Alert.alert('Ошибка входа', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 80 }}>🎲</Text>
            <Text style={styles.titleText}>
              {isRegisterMode ? 'Регистрация' : 'Вход в аккаунт'}
            </Text>
          </View>

          <AppInput
            label="Электронная почта (Email)"
            placeholder="example@mail.ru"
            value={email}
            onChangeText={setEmail}
          />

          <AppInput
            label="Пароль"
            placeholder="Минимум 6 символов"
            value={password}
            onChangeText={setPassword}
            isPassword={true}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#6C47FF" style={{ marginTop: 20 }} />
          ) : (
            <AppButton
              title={isRegisterMode ? 'Создать аккаунт' : 'Войти'}
              variant="primary"
              size="md"
              onPress={handleAuth}
              style={styles.button}
            />
          )}

          <TouchableOpacity 
            style={styles.switchBtn} 
            onPress={() => setIsRegisterMode(!isRegisterMode)}
            disabled={loading}
          >
            <Text style={styles.switchText}>
              {isRegisterMode 
                ? 'Уже есть аккаунт? Войти' 
                : 'Нет аккаунта? Зарегистрироваться'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND || '#1C1E22',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  formContainer: {
    width: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  button: {
    marginTop: 15,
  },
  switchBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#A0A5B0',
    fontSize: 15,
    fontWeight: '600',
  },
});
