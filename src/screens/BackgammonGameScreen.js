import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';

// Начальная расстановка 24 пунктов классических коротких нард
const createInitialPoints = () => {
  const pts = Array.from({ length: 24 }, () => ({ color: null, count: 0 }));
  
  // Белые фишки (идут от 1 к 24)
  pts.splice(0, 1, { color: 'white', count: 2 });
  pts.splice(11, 1, { color: 'white', count: 5 });
  pts.splice(16, 1, { color: 'white', count: 3 });
  pts.splice(18, 1, { color: 'white', count: 5 });

  // Чёрные фишки (идут от 24 к 1)
  pts.splice(23, 1, { color: 'black', count: 2 });
  pts.splice(12, 1, { color: 'black', count: 5 });
  pts.splice(7, 1, { color: 'black', count: 3 });
  pts.splice(5, 1, { color: 'black', count: 5 });

  return pts;
};

const TOP_ROW_INDICES = Array.from({ length: 12 }, (_, i) => i + 12); // Пункты 13 - 24
const BOTTOM_ROW_INDICES = Array.from({ length: 12 }, (_, i) => 11 - i); // Пункты 12 - 1

export default function BackgammonGameScreen({ route, navigation }) {
  const store = useGameStore();
  const { player1 = 'Белые (Игрок 1)', player2 = 'Чёрные (Игрок 2)' } = route.params || {};

  const [points, setPoints] = useState(createInitialPoints);
  const [turn, setTurn] = useState('white');
  const [dice, setDice] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [borneOff, setBorneOff] = useState({ white: 0, black: 0 });

  const finishAndSave = async (winnerName) => {
    try {
      if (store && typeof store.addGame === 'function') {
        await store.addGame({ title: 'Нарды', winner: winnerName });
      }
      Alert.alert('Победа в нардах! 🏆', `Победитель: ${winnerName}\nСохранено в Supabase.`, [
        { text: 'ОК', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить партию в облако.');
    }
  };

  const rollDice = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice(d1 === d2 ? [d1, d1, d1, d1] : [d1, d2]);
    setSelectedIdx(null);
  };

  const handlePointPress = (idx) => {
    if (dice.length === 0) {
      Alert.alert('Бросьте кубики', 'Сначала нажмите кнопку «Бросить кубики».');
      return;
    }

    const pt = points.at(idx);

    if (pt.color === turn && pt.count > 0) {
      setSelectedIdx(selectedIdx === idx ? null : idx);
      return;
    }

    if (selectedIdx !== null) {
      const distance = turn === 'white' ? idx - selectedIdx : selectedIdx - idx;
      const dieIndex = dice.indexOf(distance);

      if (dieIndex === -1) {
        Alert.alert('Неверный ход', `Доступные ходы по кубикам: ${dice.join(', ')}`);
        return;
      }

      if (pt.color && pt.color !== turn && pt.count >= 2) {
        Alert.alert('Пункт занят', 'Нельзя встать на пункт, занятый 2 или более фишками соперника.');
        return;
      }

      const newPoints = points.map((p) => ({ ...p }));
      const sourcePt = newPoints.at(selectedIdx);
      const targetPt = newPoints.at(idx);

      sourcePt.count -= 1;
      if (sourcePt.count === 0) sourcePt.color = null;

      // Сбиваем одиночную фишку соперника на старт
      if (targetPt.color && targetPt.color !== turn && targetPt.count === 1) {
        const startIdx = targetPt.color === 'white' ? 0 : 23;
        const startPt = newPoints.at(startIdx);
        startPt.color = targetPt.color;
        startPt.count += 1;
        targetPt.count = 0;
      }

      targetPt.color = turn;
      targetPt.count += 1;

      const remainingDice = [...dice];
      remainingDice.splice(dieIndex, 1);

      setPoints(newPoints);
      setSelectedIdx(null);
      setDice(remainingDice);

      if (remainingDice.length === 0) {
        setTurn(turn === 'white' ? 'black' : 'white');
      }
    }
  };

  const handleBearOff = () => {
    if (selectedIdx === null || dice.length === 0) return;
    const distToExit = turn === 'white' ? 24 - selectedIdx : selectedIdx + 1;
    const dieIndex = dice.findIndex((d) => d >= distToExit);

    if (dieIndex === -1) {
      Alert.alert('Не хватает очков', `Для вывода фишки с этого пункта нужно минимум ${distToExit}.`);
      return;
    }

    const newPoints = points.map((p) => ({ ...p }));
    const sourcePt = newPoints.at(selectedIdx);
    sourcePt.count -= 1;
    if (sourcePt.count === 0) sourcePt.color = null;

    const newBorne = { ...borneOff, [turn]: borneOff[turn] + 1 };
    const remainingDice = [...dice];
    remainingDice.splice(dieIndex, 1);

    setPoints(newPoints);
    setBorneOff(newBorne);
    setSelectedIdx(null);
    setDice(remainingDice);

    if (newBorne[turn] >= 15) {
      return finishAndSave(turn === 'white' ? player1 : player2);
    }

    if (remainingDice.length === 0) {
      setTurn(turn === 'white' ? 'black' : 'white');
    }
  };

  const renderHalfBoard = (indices) => (
    <View style={styles.halfBoard}>
      {indices.map((idx) => {
        const pt = points.at(idx);
        const isSel = selectedIdx === idx;
        return (
          <TouchableOpacity
            key={idx}
            style={[styles.pointSlot, isSel && styles.selectedSlot]}
            onPress={() => handlePointPress(idx)}
          >
            <Text style={styles.pointNumber}>{idx + 1}</Text>
            {pt && pt.count > 0 && (
              <View style={[styles.chip, pt.color === 'white' ? styles.whiteChip : styles.blackChip]}>
                <Text style={[styles.chipText, pt.color === 'white' ? { color: '#000' } : { color: '#fff' }]}>
                  {pt.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎲 Нарды</Text>
      </View>

      <View style={styles.turnBanner}>
        <Text style={styles.turnText}>Ход: {turn === 'white' ? `⚪ ${player1}` : `⚫ ${player2}`}</Text>
        <Text style={styles.scoreSub}>Выведено: ⚪ {borneOff.white}/15 | ⚫ {borneOff.black}/15</Text>
      </View>

      <View style={styles.diceRow}>
        <TouchableOpacity style={styles.rollBtn} onPress={rollDice} disabled={dice.length > 0}>
          <Text style={styles.btnText}>{dice.length > 0 ? `Ходы: [ ${dice.join(' , ')} ]` : '🎲 Бросить кубики'}</Text>
        </TouchableOpacity>
        {dice.length > 0 && (
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => {
              setDice([]);
              setSelectedIdx(null);
              setTurn(turn === 'white' ? 'black' : 'white');
            }}
          >
            <Text style={styles.skipText}>Передать ход</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.boardLabel}>Верхний ряд (пункты 13 – 24 ➔ выход белых)</Text>
      {renderHalfBoard(TOP_ROW_INDICES)}

      <Text style={styles.boardLabel}>Нижний ряд (выход чёрных ⇦ пункты 1 – 12)</Text>
      {renderHalfBoard(BOTTOM_ROW_INDICES)}

      {selectedIdx !== null && (
        <TouchableOpacity style={styles.bearOffBtn} onPress={handleBearOff}>
          <Text style={styles.btnText}>📤 Вывести фишку с пункта {selectedIdx + 1}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={styles.winBtn1} onPress={() => finishAndSave(player1)}>
          <Text style={styles.btnText}>🏆 Победа: {player1}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.winBtn2} onPress={() => finishAndSave(player2)}>
          <Text style={styles.btnText}>🏆 Победа: {player2}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginLeft: 16 },
  turnBanner: { backgroundColor: '#262930', paddingVertical: 10, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#6C47FF' },
  turnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  scoreSub: { color: '#A0A5B0', fontSize: 13, marginTop: 4 },
  diceRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  rollBtn: { flex: 1, backgroundColor: '#6C47FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  skipBtn: { backgroundColor: '#374151', paddingHorizontal: 14, borderRadius: 12, justifyContent: 'center' },
  skipText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  boardLabel: { color: '#A0A5B0', fontSize: 12, marginBottom: 6, marginTop: 4 },
  halfBoard: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', backgroundColor: '#262930', padding: 8, borderRadius: 12, marginBottom: 12, gap: 6 },
  pointSlot: { width: '14.5%', height: 64, backgroundColor: '#1C1E22', borderRadius: 8, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderWidth: 1, borderColor: '#374151' },
  selectedSlot: { borderColor: '#10B981', borderWidth: 2, backgroundColor: '#1E2E2A' },
  pointNumber: { color: '#6B7280', fontSize: 11, fontWeight: 'bold' },
  chip: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  whiteChip: { backgroundColor: '#F9FAFB', borderColor: '#9CA3AF' },
  blackChip: { backgroundColor: '#111827', borderColor: '#6C47FF' },
  chipText: { fontSize: 13, fontWeight: 'bold' },
  bearOffBtn: { backgroundColor: '#F59E0B', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  controls: { gap: 10, marginTop: 6 },
  winBtn1: { backgroundColor: '#6C47FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  winBtn2: { backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});
