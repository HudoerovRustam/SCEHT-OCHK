import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { colors } from '../constants/constant';


export default function AppBottomSheet({
  visible,
  onClose,
  title,
  children,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      {/* Кликер по заднему фону (Backdrop) для закрытия */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          
          {/* Контейнер самой шторки (чтобы клики внутри неё не закрывали модалку) */}
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              
              {/* Шапка модалки */}
              <View style={styles.header}>
                <View style={styles.swipeIndicator} />
                
                <View style={styles.titleRow}>
                  {title && <Text style={styles.titleText}>{title}</Text>}
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Контентная область */}
              <View style={styles.content}>
                {children}
              </View>

            </View>
          </TouchableWithoutFeedback>
          
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Анимированное затемнение 50%
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.BACKGROUND,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34, 
    maxHeight: '85%',
  },
  header: {
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  swipeIndicator: {
    width: 40,
    height: 5,
    backgroundColor: colors.BORDER,
    borderRadius: 10,
    marginBottom: 15,
  },
  titleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleText: {
    color: colors.TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: colors.TEXT_MUTED,
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});
