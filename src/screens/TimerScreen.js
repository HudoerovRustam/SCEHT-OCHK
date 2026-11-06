import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function TimerScreen({ navigation }) {
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 минут (10:00) по умолчанию
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((seconds) => seconds - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  // Форматирование секунд в вид ММ:СС
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Таймер</Text>
      </View>

      {/* Большое табло со временем */}
      <View style={styles.timerDisplayContainer}>
        <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
      </View>

      {/* Набор цветных кнопок из Figma */}
      <View style={styles.buttonContainer}>
        {/* Старт (Зеленая) */}
        <TouchableOpacity style={styles.startButton} onPress={() => setIsActive(true)}>
          <Text style={styles.buttonText}>▶️  Старт</Text>
        </TouchableOpacity>

        {/* Пауза (Фиолетовая) */}
        <TouchableOpacity style={styles.pauseButton} onPress={() => setIsActive(false)}>
          <Text style={styles.buttonText}>⏸️  Пауза</Text>
        </TouchableOpacity>

        {/* Сброс (Красная) */}
        <TouchableOpacity style={styles.resetButton} onPress={() => { setIsActive(false); setSecondsLeft(600); }}>
          <Text style={styles.buttonText}>🔄  Сброс</Text>
        </TouchableOpacity>

        {/* Назад к счёту (Серая) */}
        <TouchableOpacity style={styles.backToGameButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>↩️  Назад к счёту</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 60 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  headerTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginLeft: 20 },
  timerDisplayContainer: { alignItems: 'center', marginBottom: 50 },
  timerText: { color: '#6C47FF', fontSize: 72, fontWeight: 'bold' },
  buttonContainer: { gap: 14, width: '100%', marginBottom: 30 },
  startButton: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  pauseButton: { backgroundColor: '#6C47FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  resetButton: { backgroundColor: '#EF4444', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  backToGameButton: { backgroundColor: '#374151', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
