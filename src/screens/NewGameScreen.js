import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function NewGameScreen({ navigation }) {
  const store = useGameStore();
  
  const [gameName, setGameName] = useState('');
  const [playersCount, setPlayersCount] = useState(4);
  const [isTimerMode, setIsTimerMode] = useState(false);

  const handleDecrease = () => {
    if (playersCount > 2) {
      setPlayersCount(playersCount - 1);
    }
  };

  const handleIncrease = () => {
    if (playersCount < 10) {
      setPlayersCount(playersCount + 1);
    }
  };

  const handleContinue = () => {
    if (!gameName || gameName.trim() === '') {
      Alert.alert('Введите название', 'Пожалуйста, обязательно укажите название игры перед продолжением.');
      return;
    }

    if (store && typeof store.setPlayersCount === 'function') {
      store.setPlayersCount(playersCount);
    }

    navigation.navigate('Players', {
      gameName: gameName.trim(),
      isTimerMode: isTimerMode
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Новая игра</Text>
      </View>

      <Text style={styles.label}>Название игры</Text>
      <TextInput
        style={styles.input}
        placeholder="Например: Монополия"
        placeholderTextColor="#6B7280"
        value={gameName}
        onChangeText={setGameName}
      />

      <Text style={styles.label}>Количество игроков</Text>
      <View style={styles.counterContainer}>
        <TouchableOpacity style={styles.counterButton} onPress={handleDecrease}>
          <Text style={styles.counterButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{playersCount}</Text>
        <TouchableOpacity style={styles.counterButton} onPress={handleIncrease}>
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Режим подсчёта</Text>
      <View style={styles.radioGroup}>
        <TouchableOpacity 
          style={styles.radioRow} 
          onPress={() => setIsTimerMode(false)}
        >
          <View style={[styles.radioCircle, !isTimerMode && styles.radioCircleSelected]} />
          <Text style={styles.radioText}>Обычный счёт</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.radioRow} 
          onPress={() => setIsTimerMode(true)}
        >
          <View style={[styles.radioCircle, isTimerMode && styles.radioCircleSelected]} />
          <Text style={styles.radioText}>Счёт с таймером</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Продолжить</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  headerTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginLeft: 20 },
  label: { color: '#ffffff', fontSize: 15, fontWeight: '600', marginBottom: 10 },
  input: { backgroundColor: '#D1D5DB', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, color: '#000000', fontSize: 16, marginBottom: 25 },
  counterContainer: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 14, padding: 10, alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  counterButton: { backgroundColor: '#374151', width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  counterButtonText: { color: '#ffffff', fontSize: 22, fontWeight: 'bold' },
  counterValue: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  radioGroup: { backgroundColor: '#262930', borderRadius: 14, paddingHorizontal: 16, marginBottom: 35 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#6B7280', marginRight: 14 },
  radioCircleSelected: { borderColor: '#6C47FF', backgroundColor: '#6C47FF' },
  radioText: { color: '#ffffff', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#374151' },
  continueButton: { backgroundColor: '#6C47FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  continueButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
