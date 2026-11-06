import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/constant';

// Импортируем компоненты UI-Kit
import AppCard from '../components/Card';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';

export default function SettingsScreen() {
  // Стейты для настроек игры
  const [maxPoints, setMaxPoints] = useState('50');
  const [diceCount, setDiceCount] = useState('1');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Валидация и сохранение настроек
  const handleSaveSettings = () => {
    const points = parseInt(maxPoints, 10);
    const dice = parseInt(diceCount, 10);

    if (isNaN(points) || points <= 0) {
      Alert.alert('Ошибка', 'Введите корректное целевое количество очков.');
      return;
    }

    if (isNaN(dice) || dice < 1 || dice > 3) {
      Alert.alert('Ошибка', 'Количество кубиков должно быть от 1 до 3.');
      return;
    }

    setLoading(true);

    // Имитация сохранения в базу данных или AsyncStorage
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Успешно', 'Настройки успешно сохранены!');
    }, 1000);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        
        {/* Шапка экрана */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Настройки</Text>
          <Text style={styles.headerSubtitle}>Конфигурация игрового процесса</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Блок 1: Игровые правила */}
          <Text style={styles.sectionTitle}>Правила игры</Text>
          <AppCard style={styles.cardMargin}>
            <AppInput
              label="Лимит очков для победы"
              placeholder="Например: 50"
              value={maxPoints}
              onChangeText={setMaxPoints}
              keyboardType="number-pad"
            />
            <AppInput
              label="Количество кубиков (1-3)"
              placeholder="Например: 1"
              value={diceCount}
              onChangeText={setDiceCount}
              keyboardType="number-pad"
            />
          </AppCard>

          {/* Блок 2: Эффекты и кастомизация */}
          <Text style={styles.sectionTitle}>Системные параметры</Text>
          <AppCard style={styles.cardMargin}>
            {/* Переключатель Звука */}
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Звуковые эффекты</Text>
                <Text style={styles.settingDescription}>Воспроизводить звуки при броске</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#323B44', true: colors.PRIMARY }}
                thumbColor={soundEnabled ? '#FFFFFF' : '#A1AAB3'}
              />
            </View>

            {/* Разделитель */}
            <View style={styles.divider} />

            {/* Переключатель Вибрации */}
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Вибрация (Haptic)</Text>
                <Text style={styles.settingDescription}>Тактильный отклик устройства</Text>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ false: '#323B44', true: colors.PRIMARY }}
                thumbColor={vibrationEnabled ? '#FFFFFF' : '#A1AAB3'}
              />
            </View>
          </AppCard>

          {/* Блок 3: Кнопка сохранения */}
          <AppButton
            title="Сохранить изменения"
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleSaveSettings}
            style={styles.saveButton}
          />

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  headerTitle: {
    color: colors.TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: '950',
  },
  headerSubtitle: {
    color: colors.TEXT_MUTED,
    fontSize: 14,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: colors.TEXT_MUTED,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 15,
    paddingLeft: 4,
  },
  cardMargin: {
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingLabel: {
    color: colors.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    color: colors.TEXT_MUTED,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.BORDER,
    marginVertical: 14,
  },
  saveButton: {
    marginTop: 20,
  },
});
