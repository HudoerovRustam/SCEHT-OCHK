import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, useWindowDimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function GameScreen({ route, navigation }) {
  const store = useGameStore();
  const { width, height } = useWindowDimensions();
  const { gameName = 'Игра', isTimerMode = false } = route.params || {};

  const isWatch = width < 280;
  const isCompactHeight = height < 500;
  const isTablet = width >= 600;

  const [players, setPlayers] = useState(store?.activePlayers || []);
  const [seconds, setSeconds] = useState(0);
  const [showTimer, setShowTimer] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const updateScore = (id, delta) => {
    const updated = players.map((p) => (p.id === id ? { ...p, score: p.score + delta } : p));
    setPlayers(updated);
    if (store) store.activePlayers = updated;
  };

  const handleFinishGame = async () => {
    setIsRunning(false);
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const topPlayer = sorted.at(0);
    const secondPlayer = sorted.at(1);

    const isDraw = topPlayer && secondPlayer && topPlayer.score === secondPlayer.score;
    const winnerName = isDraw ? 'Ничья' : topPlayer?.name || 'Не определен';

    try {
      if (!isDraw && store && typeof store.addGame === 'function') {
        await store.addGame({
          title: gameName,
          winner: winnerName
        });
      }
      Alert.alert(
        'Игра окончена! 🏆',
        `Победитель: ${winnerName}\nВремя: ${formatTime(seconds)}`,
        [{ text: 'ОК', onPress: () => navigation.navigate('MainTabs') }]
      );
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить результаты.');
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[
        styles.scrollContent, 
        { 
          paddingTop: isWatch ? 22 : isCompactHeight ? 20 : 45,
          paddingHorizontal: isWatch ? 12 : 20 
        }
      ]}
    >
      <View style={[styles.innerWrapper, { maxWidth: isTablet ? 700 : 540 }]}>
        <View style={[styles.header, isWatch && { marginBottom: 10 }]}>
          <TouchableOpacity 
            style={[styles.backButton, isWatch && { width: 30, height: 30, borderRadius: 8 }]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backArrow, isWatch && { fontSize: 14 }]}>❮</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isWatch && { fontSize: 16, marginLeft: 8 }]} numberOfLines={1}>
            {gameName}
          </Text>
          
          <TouchableOpacity 
            style={[styles.toggleTimerBadge, isWatch && { paddingHorizontal: 8, paddingVertical: 5 }]} 
            onPress={() => setShowTimer(!showTimer)}
          >
            <Text style={[styles.toggleTimerText, isWatch && { fontSize: 11 }]}>
              {isWatch ? '⏱️' : showTimer ? 'Скрыть ⏱️' : 'Таймер ⏱️'}
            </Text>
          </TouchableOpacity>
        </View>

        {showTimer && (
          <View style={[styles.timerBox, isWatch && styles.timerBoxWatch, isCompactHeight && !isWatch && styles.timerBoxCompact]}>
            <View style={isWatch && { alignItems: 'center', marginBottom: 6 }}>
              {!isWatch && <Text style={styles.timerLabel}>⏱️ Время партии</Text>}
              <Text style={[styles.timerValue, isWatch && { fontSize: 22 }, isCompactHeight && !isWatch && { fontSize: 22 }]}>
                {formatTime(seconds)}
              </Text>
            </View>
            <View style={styles.timerControls}>
              <TouchableOpacity 
                style={[styles.timerBtn, isWatch && { paddingHorizontal: 10, paddingVertical: 6 }]} 
                onPress={() => setIsRunning(!isRunning)}
              >
                <Text style={[styles.timerBtnText, isWatch && { fontSize: 12 }]}>
                  {isWatch ? (isRunning ? '⏸' : '▶️') : (isRunning ? '⏸ Пауза' : '▶️ Старт')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.resetTimerBtn, isWatch && { paddingHorizontal: 10, paddingVertical: 6 }]} 
                onPress={() => { setIsRunning(false); setSeconds(0); }}
              >
                <Text style={[styles.timerBtnText, isWatch && { fontSize: 12 }]}>🔄</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={[styles.playersGrid, isTablet && styles.playersGridTablet]}>
          {players.map((item) => (
            <View 
              key={item.id.toString()} 
              style={[
                styles.playerCard, 
                isTablet && styles.playerCardTablet,
                isWatch && { padding: 10, marginBottom: 8, borderRadius: 12 },
                isCompactHeight && !isWatch && { padding: 12, marginBottom: 8 }
              ]}
            >
              <View style={styles.playerInfo}>
                {!isWatch && <Text style={styles.avatar}>{item.avatar}</Text>}
                <Text style={[styles.name, isWatch && { fontSize: 13 }]} numberOfLines={1}>{item.name}</Text>
              </View>

              <View style={[styles.scoreControls, isWatch && { gap: 6 }]}>
                <TouchableOpacity 
                  style={[styles.scoreBtnMinus, isWatch && { width: 26, height: 26, borderRadius: 7 }]} 
                  onPress={() => updateScore(item.id, -1)}
                >
                  <Text style={[styles.scoreBtnText, isWatch && { fontSize: 14 }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.scoreText, isWatch && { fontSize: 15, minWidth: 20 }]}>{item.score}</Text>
                <TouchableOpacity 
                  style={[styles.scoreBtnPlus, isWatch && { width: 26, height: 26, borderRadius: 7 }]} 
                  onPress={() => updateScore(item.id, 1)}
                >
                  <Text style={[styles.scoreBtnText, isWatch && { fontSize: 14 }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.finishButton, isWatch && { paddingVertical: 10, borderRadius: 10 }]} 
          onPress={handleFinishGame}
        >
          <Text style={[styles.finishButtonText, isWatch && { fontSize: 14 }]}>
            {isWatch ? 'Завершить' : 'Завершить игру'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22' },
  scrollContent: { flexGrow: 1, paddingBottom: 30, alignItems: 'center' },
  innerWrapper: { width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginLeft: 14, flex: 1 },
  toggleTimerBadge: { backgroundColor: '#262930', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#374151' },
  toggleTimerText: { color: '#E5E7EB', fontSize: 13, fontWeight: '600' },
  
  timerBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#262930', borderRadius: 16, padding: 16, marginBottom: 18, borderWidth: 1.5, borderColor: '#6C47FF' },
  timerBoxWatch: { flexDirection: 'column', padding: 10, marginBottom: 10, borderRadius: 12 },
  timerBoxCompact: { paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12 },
  timerLabel: { color: '#A0A5B0', fontSize: 13, fontWeight: '600' },
  timerValue: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginTop: 2 },
  timerControls: { flexDirection: 'row', gap: 8 },
  timerBtn: { backgroundColor: '#6C47FF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  resetTimerBtn: { backgroundColor: '#374151', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  timerBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  playersGrid: { flexDirection: 'column' },
  playersGridTablet: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  playerCard: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 16, padding: 15, marginBottom: 12, alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  playerCardTablet: { width: '48.5%' },
  playerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  avatar: { fontSize: 24, marginRight: 10 },
  name: { color: '#fff', fontSize: 17, fontWeight: 'bold', flex: 1 },
  scoreControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreBtnMinus: { backgroundColor: '#EF4444', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  scoreBtnPlus: { backgroundColor: '#10B981', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  scoreBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scoreText: { color: '#fff', fontSize: 20, fontWeight: 'bold', minWidth: 28, textAlign: 'center' },

  finishButton: { backgroundColor: '#6C47FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 },
    finishButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

