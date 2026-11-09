import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'; 
import { useGameStore } from '../store/gameStore';
const { setPlayersCount } = useGameStore();
setPlayersCount(playersCount + 1);
setPlayersCount(playersCount - 1);

export default function NewGameScreen({ navigation }) {
  const [gameName, setGameName] = useState('');
  const [playersCount, setPlayersCount] = useState(4);
  const [isTimerMode, setIsTimerMode] = useState(false);

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Новая игра</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Название игры</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Например: Игра" 
          placeholderTextColor="#6B7280"
          value={gameName}
          onChangeText={setGameName}
        />

        <Text style={styles.label}>Количество игроков</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity 
            style={styles.counterButton} 
            onPress={() => playersCount > 1 && setPlayersCount(playersCount - 1)}
          >
            <Text style={styles.counterButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{playersCount}</Text>
          <TouchableOpacity 
            style={styles.counterButton} 
            onPress={() => setPlayersCount(playersCount + 1)}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Режим подсчёта</Text>
        <View style={styles.radioContainer}>
          <TouchableOpacity 
            style={styles.radioButton} 
            onPress={() => setIsTimerMode(false)}
          >
            <View style={[styles.radioCircle, !isTimerMode && styles.radioChecked]} />
            <Text style={styles.radioText}>Обычный счёт</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.radioButton} 
            onPress={() => setIsTimerMode(true)}
          >
            <View style={[styles.radioCircle, isTimerMode && styles.radioChecked]} />
            <Text style={styles.radioText}>Счет с таймером</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={() => navigation.navigate('Players', { playersCount, isTimerMode })}
        >
          <Text style={styles.submitButtonText}>Продолжить</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1E22',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#E5E7EB',
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  content: {
    paddingHorizontal: 20,
    width: '100%',
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#000000',
    fontSize: 16,
  },
  counterContainer: {
    flexDirection: 'row',
    backgroundColor: '#262930',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6,
  },
  counterButton: {
    backgroundColor: '#374151',
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  counterValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  radioContainer: {
    backgroundColor: '#262930',
    borderRadius: 14,
    overflow: 'hidden',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioChecked: {
    borderColor: '#6C47FF',
    backgroundColor: '#6C47FF',
  },
  radioText: {
    color: '#ffffff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#6C47FF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 40,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
