import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const initialPlayers = [
  { id: '1', name: 'Игрок 1', score: 25, avatar: 'https://cdn-icons-png.flaticon.com/256/7853/7853210.png' },
  { id: '2', name: 'Игрок 2', score: 18, avatar: 'https://www.futbox.com/img/v1/a5b/b1a/816/cd2/c10b83a9a4fb7e382dfa_zoom.png' },
  { id: '3', name: 'Игрок 3', score: 32, avatar: 'https://avatars.mds.yandex.net/i?id=3009e6c3e2d59f22dcc6369d7c80d505f8c41135-5869063-images-thumbs&n=13' },
  { id: '4', name: 'Игрок 4', score: 20, avatar: 'https://static.tildacdn.info/tild6632-6139-4    136-b336-393565393332/tumblr_pfhftpiSxG1xh.gif' },
];

export default function FinishScreen() {

  const winner = initialPlayers.reduce((max, player) => (player.score > max.score ? player : max), initialPlayers[0]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.settingsButton}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.titleText}>Игра завершена!</Text>

          <View style={styles.winnerCard}>
            <Text style={styles.winnerLabel}>ПОБЕДИТЕЛЬ</Text>
            <Text style={styles.winnerName}>{winner.name}</Text>
          </View>

          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Итоговые результаты:</Text>
            
            {initialPlayers.map((player) => {
              const isWinner = player.id === winner.id;
              
              return (
                <View key={player.id} style={styles.playerRow}>
                  <View style={styles.playerInfo}>
                    <Image 
                      source={{ uri: player.avatar }} 
                      style={styles.avatar} 
                    />
                    <Text style={styles.playerName}>{player.name}</Text>
                  </View>
                  
                  <View style={styles.scoreContainer}>
                    <Text style={styles.playerScore}>{player.score}</Text>
                    {isWinner && <Text style={styles.crownIcon}>👑</Text>}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.primaryButton]}>
              <Text style={styles.buttonText}>Новая игра</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
              <Text style={styles.buttonText}>На главную</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12161A', 
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222831',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  winnerCard: {
    width: '100%',
    backgroundColor: '#0F541C', 
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 35,
  },
  winnerLabel: {
    color: '#A17028', 
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  winnerName: {
    color: '#2CE134', 
    fontSize: 30,
    fontWeight: '900',
  },
  resultsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  resultsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A2026', 
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,               
    height: 36,              
    borderRadius: 8,         
    backgroundColor: '#323B44', 
    marginRight: 14,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerScore: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  crownIcon: {
    fontSize: 16,
    marginLeft: 6,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginTop: 'auto', 
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#5A31F4', 
  },
  secondaryButton: {
    backgroundColor: '#29313C', 
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
