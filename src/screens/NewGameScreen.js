import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useResponsive } from '../utils/responsive';

export default function NewGameScreen({ navigation }) {
  const store = useGameStore();
  const { isWatch, paddingTop, paddingHorizontal, maxWidth, titleSize } = useResponsive();
  
  const [gameName, setGameName] = useState('');
  const [playersCount, setPlayersCount] = useState(4);
  const [isTimerMode, setIsTimerMode] = useState(false);

  const handleContinue = () => {
    if (!gameName || gameName.trim() === '') {
      Alert.alert('Введите название', 'Пожалуйста, укажите название игры.');
      return;
    }
    if (store?.setPlayersCount) store.setPlayersCount(playersCount);
    navigation.navigate('Players', { gameName: gameName.trim(), isTimerMode });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { paddingTop, paddingHorizontal }]} keyboardShouldPersistTaps="handled">
      <View style={[styles.innerWrapper, { maxWidth }]}>
        <View style={[styles.header, isWatch && { marginBottom: 12 }]}>
          <TouchableOpacity style={[styles.backButton, isWatch && styles.backBtnWatch]} onPress={() => navigation.goBack()}>
            <Text style={[styles.backArrow, isWatch && { fontSize: 14 }]}>❮</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: titleSize, marginLeft: isWatch ? 10 : 20 }]}>Новая игра</Text>
        </View>

        <Text style={[styles.label, isWatch && { fontSize: 12, marginBottom: 4 }]}>Название игры</Text>
        <TextInput
          style={[styles.input, isWatch && { paddingVertical: 8, fontSize: 13, marginBottom: 12 }]}
          placeholder="Монополия"
          placeholderTextColor="#6B7280"
          value={gameName}
          onChangeText={setGameName}
        />

        <Text style={[styles.label, isWatch && { fontSize: 12, marginBottom: 4 }]}>Игроков: {playersCount}</Text>
        <View style={[styles.counterContainer, isWatch && { padding: 6, marginBottom: 12 }]}>
          <TouchableOpacity style={[styles.counterButton, isWatch && styles.counterBtnWatch]} onPress={() => playersCount > 2 && setPlayersCount(playersCount - 1)}>
            <Text style={styles.counterButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={[styles.counterValue, isWatch && { fontSize: 16 }]}>{playersCount}</Text>
          <TouchableOpacity style={[styles.counterButton, isWatch && styles.counterBtnWatch]} onPress={() => playersCount < 10 && setPlayersCount(playersCount + 1)}>
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, isWatch && { fontSize: 12, marginBottom: 4 }]}>Режим</Text>
        <View style={[styles.radioGroup, isWatch && { paddingHorizontal: 10, marginBottom: 15 }]}>
          <TouchableOpacity style={[styles.radioRow, isWatch && { paddingVertical: 8 }]} onPress={() => setIsTimerMode(false)}>
            <View style={[styles.radioCircle, !isTimerMode && styles.radioCircleSelected]} />
            <Text style={[styles.radioText, isWatch && { fontSize: 12 }]}>Обычный</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={[styles.radioRow, isWatch && { paddingVertical: 8 }]} onPress={() => setIsTimerMode(true)}>
            <View style={[styles.radioCircle, isTimerMode && styles.radioCircleSelected]} />
            <Text style={[styles.radioText, isWatch && { fontSize: 12 }]}>С таймером</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.continueButton, isWatch && { paddingVertical: 10, borderRadius: 10 }]} onPress={handleContinue}>
          <Text style={[styles.continueButtonText, isWatch && { fontSize: 14 }]}>Продолжить</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22' },
  scrollContent: { flexGrow: 1, paddingBottom: 30, alignItems: 'center' },
  innerWrapper: { width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backBtnWatch: { width: 30, height: 30, borderRadius: 8 },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  headerTitle: { color: '#fff', fontWeight: 'bold' },
  label: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#D1D5DB', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, color: '#000', fontSize: 16, marginBottom: 20 },
  counterContainer: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 14, padding: 10, alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  counterButton: { backgroundColor: '#374151', width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  counterBtnWatch: { width: 32, height: 32, borderRadius: 8 },
  counterButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  counterValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  radioGroup: { backgroundColor: '#262930', borderRadius: 14, paddingHorizontal: 16, marginBottom: 25 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#6B7280', marginRight: 12 },
  radioCircleSelected: { borderColor: '#6C47FF', backgroundColor: '#6C47FF' },
  radioText: { color: '#fff', fontSize: 15 },
  divider: { height: 1, backgroundColor: '#374151' },
  continueButton: { backgroundColor: '#6C47FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  continueButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
