import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useResponsive } from '../utils/responsive';

export default function SettingsScreen({ navigation }) {
  const store = useGameStore();
  const { isWatch, paddingTop, paddingHorizontal, maxWidth, titleSize } = useResponsive();
  const userEmail = store?.user?.email || 'Гость';

  const handleLogout = () => {
    Alert.alert('Выход', 'Выйти из аккаунта?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          if (store?.setUser) await store.setUser(null);
          navigation.replace('Login');
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { paddingTop, paddingHorizontal }]}>
      <View style={[styles.innerWrapper, { maxWidth }]}>
        <Text style={[styles.headerTitle, { fontSize: titleSize }]}>⚙️ Настройки</Text>

        <View style={[styles.card, isWatch && { padding: 10 }]}>
          <Text style={styles.cardLabel}>Аккаунт:</Text>
          <Text style={[styles.cardValue, isWatch && { fontSize: 13 }]}>{userEmail}</Text>
        </View>

        <View style={[styles.card, isWatch && { padding: 10 }]}>
          <Text style={styles.cardLabel}>Версия приложения:</Text>
          <Text style={[styles.cardValue, isWatch && { fontSize: 13 }]}>1.0.0 (Universal)</Text>
        </View>

        <TouchableOpacity style={[styles.logoutBtn, isWatch && { paddingVertical: 10 }]} onPress={handleLogout}>
          <Text style={[styles.logoutText, isWatch && { fontSize: 13 }]}>🚪 Выйти из аккаунта</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22' },
  scrollContent: { flexGrow: 1, paddingBottom: 30, alignItems: 'center' },
  innerWrapper: { width: '100%' },
  headerTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#262930', borderRadius: 14, padding: 16, marginBottom: 12 },
  cardLabel: { color: '#A0A5B0', fontSize: 12, marginBottom: 4 },
  cardValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#262930', borderWidth: 1, borderColor: '#EF4444', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 10 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold' }
});
