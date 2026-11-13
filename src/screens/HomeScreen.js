import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView, useWindowDimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function HomeScreen({ navigation }) {
  const store = useGameStore();
  const { width } = useWindowDimensions();
  const isWatch = width < 280;
  const userEmail = store?.user?.email || 'Гость';

  const handleLogout = () => {
    Alert.alert(
      'Выход из аккаунта',
      'Выйти из текущего профиля?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            if (store && typeof store.setUser === 'function') {
              await store.setUser(null);
            }
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.scrollContent, isWatch && styles.scrollContentWatch]}
    >
      <View style={styles.innerWrapper}>
        <View style={styles.topBar}>
          <View style={[styles.userBadge, isWatch && { paddingHorizontal: 8, paddingVertical: 4 }]}>
            <Text style={[styles.userText, isWatch && { fontSize: 10 }]} numberOfLines={1}>
              👤 {userEmail}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.logoutButton, isWatch && { paddingHorizontal: 8, paddingVertical: 4 }]} 
            onPress={handleLogout}
          >
            <Text style={[styles.logoutText, isWatch && { fontSize: 10 }]}>
              {isWatch ? '🚪' : '🚪 Выйти'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.centerContent, isWatch && { paddingVertical: 5 }]}>
          <Text style={[styles.diceLogo, isWatch && { fontSize: 38, marginBottom: 6 }]}>🎲</Text>
          <Text style={[styles.title, isWatch && { fontSize: 18, marginBottom: 4 }]}>Игро Счёт</Text>
          {!isWatch && <Text style={styles.subtitle}>Готовы сыграть?</Text>}

          <TouchableOpacity 
            style={[styles.primaryButton, isWatch && styles.watchButton]} 
            onPress={() => navigation.navigate('NewGame')}
          >
            <Text style={[styles.primaryButtonText, isWatch && { fontSize: 13 }]}>➕ Новая игра</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryButton, isWatch && styles.watchButton]} 
            onPress={() => navigation.navigate('История')}
          >
            <Text style={[styles.secondaryButtonText, isWatch && { fontSize: 13 }]}>🕒 История</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22' },
  scrollContent: { flexGrow: 1, paddingTop: 45, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' },
  scrollContentWatch: { paddingTop: 22, paddingBottom: 20, paddingHorizontal: 14 },
  innerWrapper: { width: '100%', maxWidth: 540, flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  userBadge: { backgroundColor: '#262930', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#374151', maxWidth: '65%' },
  userText: { color: '#E5E7EB', fontSize: 13, fontWeight: '600' },
  logoutButton: { backgroundColor: '#262930', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#EF4444' },
  logoutText: { color: '#EF4444', fontSize: 13, fontWeight: 'bold' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  diceLogo: { fontSize: 80, marginBottom: 15 },
  title: { color: '#ffffff', fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#A0A5B0', fontSize: 16, marginBottom: 35 },
  primaryButton: { width: '100%', backgroundColor: '#6C47FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 14 },
  secondaryButton: { width: '100%', backgroundColor: '#262930', paddingVertical: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  watchButton: { paddingVertical: 10, borderRadius: 10, marginBottom: 8 },
  primaryButtonText: { color: '#ffffff', fontSize: 17, fontWeight: 'bold' },
  secondaryButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '600' },
});
