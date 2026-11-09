import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/constant';


const getStatusConfig = (status) => {
  switch (status) {
    case 'pending':
      return { bg: '#3A3010', text: colors.WARNING, label: 'Ожидает' };
    case 'in_progress':
      return { bg: '#10304A', text: colors.PRIMARY, label: 'В процессе' };
    case 'completed':
      return { bg: '#0F3D18', text: colors.SUCCESS, label: 'Завершено' };
    case 'cancelled':
      return { bg: '#3D1313', text: colors.DANGER, label: 'Отменено' };
    default:
      return { bg: colors.BORDER, text: colors.TEXT_PRIMARY, label: status };
  }
};

export default function StatusBadge({ status }) {
  const config = getStatusConfig(status);

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
