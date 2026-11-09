import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function RollDiceScreen({ navigation }) {
  const [diceResult, setDiceResult] = useState(5);

  const rollDice = () => {
    const result = Math.floor(Math.random() * 6) + 1;
    setDiceResult(result);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Бросок кубика</Text>
      </View>

      <View style={styles.diceContainer}>
        <Text style={styles.diceVisual}>🎲</Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={rollDice}>
        <Text style={styles.buttonText}>Бросить кубик</Text>
      </TouchableOpacity>

      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Результат</Text>
        <Text style={styles.resultValue}>{diceResult}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.outlineButton} onPress={rollDice}>
          <Text style={styles.outlineButtonText}>🔄  Еще раз</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.goBack()}>
          <Text style={styles.outlineButtonText}>↩️  Назад к игре</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  headerTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginLeft: 20 },
  diceContainer: { alignItems: 'center', marginBottom: 30 },
  diceVisual: { fontSize: 120, color: '#ffffff' },
  primaryButton: { backgroundColor: '#6C47FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 30 },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  resultContainer: { backgroundColor: '#262930', borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 40 },
  resultLabel: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  resultValue: { color: '#6C47FF', fontSize: 36, fontWeight: 'bold' },
  footer: { gap: 12, marginBottom: 30 },
  outlineButton: { border豎Width: 2, borderColor: '#374151', backgroundColor: '#262930', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  outlineButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' }
});
  