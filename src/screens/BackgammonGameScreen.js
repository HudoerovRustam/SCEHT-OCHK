import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { roomService } from '../services/api';
import SurrenderButton from '../components/SurrenderButton';

const createInitialPoints = () => {
  const pts = Array.from({ length: 24 }, () => ({ color: null, count: 0 }));
  pts.splice(0, 1, { color: 'white', count: 2 });
  pts.splice(11, 1, { color: 'white', count: 5 });
  pts.splice(16, 1, { color: 'white', count: 3 });
  pts.splice(18, 1, { color: 'white', count: 5 });

  pts.splice(23, 1, { color: 'black', count: 2 });
  pts.splice(12, 1, { color: 'black', count: 5 });
  pts.splice(7, 1, { color: 'black', count: 3 });
  pts.splice(5, 1, { color: 'black', count: 5 });
  return pts;
};

const TOP_ROW_INDICES = Array.from({ length: 12 }, (_, i) => i + 12);
const BOTTOM_ROW_INDICES = Array.from({ length: 12 }, (_, i) => 11 - i);

export default function BackgammonGameScreen({ route, navigation }) {
  const store = useGameStore();
  const { mode = 'local', roomId, roomCode, myRole, player1 = 'Белые', player2 = 'Чёрные' } = route.params || {};

  const [points, setPoints] = useState(createInitialPoints);
  const [turn, setTurn] = useState('white');
  const [dice, setDice] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [borneOff, setBorneOff] = useState({ white: 0, black: 0 });
  const [p2Name, setP2Name] = useState(player2);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (mode !== 'online' || !roomId || isFinished) return;

    const timer = setInterval(async () => {
      try {
        const room = await roomService.getRoom(roomId);
        if (!room) return;
        if (room.player2) setP2Name(room.player2);
        if (room.board_state) {
          const parsed = JSON.parse(room.board_state);
          if (parsed.points) setPoints(parsed.points);
          if (parsed.borneOff) setBorneOff(parsed.borneOff);
        }
        if (room.turn) setTurn(room.turn);

        if (room.winner && !isFinished) {
          setIsFinished(true);
          Alert.alert('Победа в нардах! 🏆', `Победитель: ${room.winner}`, [
            { text: 'ОК', onPress: () => navigation.goBack() }
          ]);
        }
      } catch (e) {}
    }, 2000);

    return () => clearInterval(timer);
  }, [mode, roomId, isFinished]);

  const finishAndSave = async (winnerName, finalPoints = points, finalBorne = borneOff) => {
    setIsFinished(true);
    try {
      if (mode === 'online' && roomId) {
        await roomService.updateMove(roomId, { points: finalPoints, borneOff: finalBorne }, turn, winnerName);
      }
      if (store?.addGame) {
        await store.addGame({ title: 'Нарды', winner: winnerName });
      }
      Alert.alert('Победа в нардах! 🏆', `Победитель: ${winnerName}`, [
        { text: 'ОК', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить партию.');
    }
  };

  const syncOnlineMove = async (nextPoints, nextBorne, nextTurn) => {
    if (mode === 'online' && roomId) {
      await roomService.updateMove(roomId, { points: nextPoints, borneOff: nextBorne }, nextTurn);
    }
  };

  const rollDice = () => {
    if (mode === 'online' && turn !== myRole) return;
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDice(d1 === d2 ? [d1, d1, d1, d1] : [d1, d2]);
    setSelectedIdx(null);
  };

  const handlePointPress = async (idx) => {
    if (isFinished) return;
    if (mode === 'online' && turn !== myRole) return;

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
        Alert.alert('Пункт занят', 'Нельзя встать на пункт с 2+ фишками соперника.');
        return;
      }

      const newPoints = points.map((p) => ({ ...p }));
      const sourcePt = newPoints.at(selectedIdx);
      const targetPt = newPoints.at(idx);

      sourcePt.count -= 1;
      if (sourcePt.count === 0) sourcePt.color = null;

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

      const nextTurn = remainingDice.length === 0 ? (turn === 'white' ? 'black' : 'white') : turn;
      setPoints(newPoints);
      setSelectedIdx(null);
      setDice(remainingDice);
      setTurn(nextTurn);

      await syncOnlineMove(newPoints, borneOff, nextTurn);
    }
  };
  const handleBearOff = async () => {
    if (selectedIdx === null || dice.length === 0) return;
    if (mode === 'online' && turn !== myRole) return;

    const distToExit = turn === 'white' ? 24 - selectedIdx : selectedIdx + 1;
    const dieIndex = dice.findIndex((d) => d >= distToExit);

    if (dieIndex === -1) {
      Alert.alert('Не хватает очков', `Для вывода фишки нужно минимум ${distToExit}.`);
      return;
    }

    const newPoints = points.map((p) => ({ ...p }));
    const sourcePt = newPoints.at(selectedIdx);
    sourcePt.count -= 1;
    if (sourcePt.count === 0) sourcePt.color = null;

    const newBorne = { ...borneOff, [turn]: borneOff[turn] + 1 };
    const remainingDice = [...dice];
    remainingDice.splice(dieIndex, 1);

    const nextTurn = remainingDice.length === 0 ? (turn === 'white' ? 'black' : 'white') : turn;
    setPoints(newPoints);
    setBorneOff(newBorne);
    setSelectedIdx(null);
    setDice(remainingDice);
    setTurn(nextTurn);

    if (newBorne[turn] >= 15) {
      return finishAndSave(turn === 'white' ? player1 : p2Name, newPoints, newBorne);
    }

    await syncOnlineMove(newPoints, newBorne, nextTurn);
  };

  const isMyTurnOnline = mode === 'local' || turn === myRole;

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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.innerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>❮</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🎲 Нарды</Text>
          {mode === 'online' && (
            <View style={styles.codeBadge}>
              <Text style={styles.codeText}>Код: {roomCode}</Text>
            </View>
          )}
        </View>

        <View style={[styles.turnBanner, !isMyTurnOnline && { borderColor: '#F59E0B' }]}>
          <Text style={styles.turnText}>
            {mode === 'online' && !isMyTurnOnline
              ? `⏳ Ожидание хода (${turn === 'white' ? player1 : p2Name})...`
              : `Ход: ${turn === 'white' ? `⚪ ${player1}` : `⚫ ${p2Name}`}`}
          </Text>
          <Text style={styles.scoreSub}>Выведено: ⚪ {borneOff.white}/15 | ⚫ {borneOff.black}/15</Text>
        </View>

        {isMyTurnOnline && (
          <View style={styles.diceRow}>
            <TouchableOpacity style={styles.rollBtn} onPress={rollDice} disabled={dice.length > 0}>
              <Text style={styles.btnText}>{dice.length > 0 ? `Ходы: [ ${dice.join(' , ')} ]` : '🎲 Бросить кубики'}</Text>
            </TouchableOpacity>
            {dice.length > 0 && (
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={async () => {
                  const nextTurn = turn === 'white' ? 'black' : 'white';
                  setDice([]);
                  setSelectedIdx(null);
                  setTurn(nextTurn);
                  await syncOnlineMove(points, borneOff, nextTurn);
                }}
              >
                <Text style={styles.skipText}>Передать ход</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={styles.boardLabel}>Верхний ряд (пункты 13 – 24 ➔ выход белых)</Text>
        {renderHalfBoard(TOP_ROW_INDICES)}

        <Text style={styles.boardLabel}>Нижний ряд (выход чёрных ⇦ пункты 1 – 12)</Text>
        {renderHalfBoard(BOTTOM_ROW_INDICES)}

        {selectedIdx !== null && isMyTurnOnline && (
          <TouchableOpacity style={styles.bearOffBtn} onPress={handleBearOff}>
            <Text style={styles.btnText}>📤 Вывести фишку с пункта {selectedIdx + 1}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.controls}>
          {mode === 'local' && (
            <>
              <TouchableOpacity style={styles.winBtn1} onPress={() => finishAndSave(player1)}>
                <Text style={styles.btnText}>🏆 Победа: {player1}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.winBtn2} onPress={() => finishAndSave(p2Name)}>
                <Text style={styles.btnText}>🏆 Победа: {p2Name}</Text>
              </TouchableOpacity>
            </>
          )}

          <SurrenderButton
            mode={mode}
            myRole={myRole}
            player1={player1}
            p2Name={p2Name}
            onSurrender={(winnerName) => finishAndSave(winnerName)}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22' },
  scrollContent: { paddingTop: 45, paddingBottom: 30, paddingHorizontal: 16, alignItems: 'center' },
  innerWrapper: { width: '100%', maxWidth: 640 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginLeft: 16, flex: 1 },
  codeBadge: { backgroundColor: '#6C47FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  codeText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  turnBanner: { backgroundColor: '#262930', paddingVertical: 10, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1.5, borderColor: '#6C47FF' },
  turnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
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
