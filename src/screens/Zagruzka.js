import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/constant';

// Импортируем компоненты из вашего UI-Kit
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (navigation && typeof navigation.replace === 'function') {
      navigation.replace('MainTabs');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.formContainer}>
          
          {/* Иконка/логотип */}
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 80 }}>🎲</Text>
          </View>

          <AppInput
            label="Логин"
            placeholder="Введите логин"
            value={email}
            onChangeText={setEmail}
          />

          <AppInput
            label="Пароль"
            placeholder="Введите пароль"
            value={password}
            onChangeText={setPassword}
            isPassword={true}
          />

          <AppButton
            title="Войти"
            variant="primary"
            size="md"
            onPress={handleLogin}
            style={styles.button}
          />

        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  formContainer: {
    width: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  button: {
    marginTop: 15,
  },
});
