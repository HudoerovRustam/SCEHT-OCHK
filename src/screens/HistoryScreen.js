import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/constant'; // Путь к вашим константам

import AppCard from '../components/Card'; 
import StatusBadge from '../components/StatusBadge';
import AppButton from '../components/AppButton';

const MOCK_HISTORY = [
  {
    id: '1',
    date: 'Сегодня, 14:20',
    gameMode: 'Классический (до 50 очков)',
    status: 'completed',
    players: [
      { name: 'Игрок 3', score: 52, isWinner: true },
      { name: 'Игрок 1', score: 45 },
      { name: 'Игрок 4', score: 38 },
      { name: 'Игрок 2', score: 21 },
    ],
  },
  {
    id: '2',
    date: 'Вчера, 19:05',
    gameMode: 'Быстрая игра',
    status: 'completed',
    players: [
      { name: 'Игрок 1', score: 32, isWinner: true },
      { name: 'Игрок 2', score: 18 },
    ],
  },
  {
    id: '3',
    date: '28 Октября, 11:15',
    gameMode: 'Турнир',
    status: 'cancelled',
    players: [
      { name: 'Игрок 4', score: 12 },
      { name: 'Игрок 3', score: 10 },
    ],
  },
];

export default function HistoryScreen() {
  const [historyData, setHistoryData] = useState(MOCK_HISTORY);

  // Функция очистки истории (для демонстрации работы кнопки)
  const handleClearHistory = () => {
    setHistoryData([]);
  };

  // Функция рендера одной карточки игры
  const renderItem = ({ item }) => {
    // Находим победителя для вывода в превью карточки
    const winner = item.players.find(p => p.isWinner);

    return (
      <AppCard style={styles.cardWrapper}>
        {/* Шапка карточки: Дата и Статус */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.dateText}>{item.date}</Text>
            <Text style={styles.modeText}>{item.gameMode}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>

        {/* Разделитель */}
        <View style={styles.divider} />

        {/* Список участников и очков внутри карточки */}
        <View style={styles.playersList}>
          {item.players.map((player, index) => (
            <View key={index} style={styles.playerRow}>
              <Text style={[styles.playerName, player.isWinner && styles.winnerName]}>
                {player.name} {player.isWinner && '👑'}
              </Text>
              <Text style={[styles.playerScore, player.isWinner && styles.winnerScore]}>
                {player.score}
              </Text>
            </View>
          ))}
        </View>
      </AppCard>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Заголовок экрана */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>История игр</Text>
          <Text style={styles.headerSubtitle}>Список ваших прошлых сессий</Text>
        </View>

        {/* Основной список или заглушка, если пусто */}
        {historyData.length > 0 ? (
          <FlatList
            data={historyData}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <AppButton
                title="Очистить всю историю"
                variant="danger"
                size="md"
                onPress={handleClearHistory}
                style={styles.clearButton}
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyText}>История игр пока пуста</Text>
            <Text style={styles.emptySubtext}>Сыграйте свой первый матч, чтобы результаты появились здесь.</Text>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND, // Используем темный фон из констант
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
    paddingTop: 15,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateText: {
    color: colors.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
  },
  modeText: {
    color: colors.TEXT_MUTED,
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.BORDER,
    verticalAlign: 'middle',
    marginVertical: 12,
  },
  playersList: {
    gap: 8,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerName: {
    color: colors.TEXT_MUTED,
    fontSize: 14,
    fontWeight: '500',
  },
  winnerName: {
    color: colors.SUCCESS, // Выделяем победителя зеленым
    fontWeight: '700',
  },
  playerScore: {
    color: colors.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  winnerScore: {
    color: colors.SUCCESS,
    fontWeight: '800',
  },
  clearButton: {
    marginTop: 20,
  },
  emptyContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: colors.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtext: {
    color: colors.TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
