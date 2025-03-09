import React from 'react';
import { View, StyleSheet, Modal, FlatList, TouchableOpacity, Dimensions, Text } from 'react-native';
import { ThemedText, CurrencyText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { OverLimitRecord } from '@/types/budget';
import { formatCurrency } from '@/utils/formatters';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface OverLimitHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  history: OverLimitRecord[];
}

export function OverLimitHistoryModal({ visible, onClose, history }: OverLimitHistoryModalProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  // Сортировка записей по дате (от новых к старым)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const renderHistoryItem = ({ item }: { item: OverLimitRecord }) => {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('ru-RU');
    const formattedTime = date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <View style={styles.historyItem}>
        <View style={styles.historyItemLeft}>
          <ThemedText style={styles.historyItemTitle}>
            <Text>{item.expenseTitle || 'Неизвестный расход'}</Text>
          </ThemedText>
          <ThemedText style={styles.historyItemDate}>
            <Text>{formattedDate} в {formattedTime}</Text>
          </ThemedText>
        </View>
        <ThemedText style={[styles.historyItemAmount, { color: 'red' }]}>
          <Text>+ </Text>
          <CurrencyText amount={item.amount} />
        </ThemedText>
      </View>
    );
  };

  const EmptyHistory = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name="checkmark-circle-outline" 
        size={48} 
        color={themeColors.text} 
        style={styles.emptyIcon} 
      />
      <ThemedText style={styles.emptyText}>
        <Text>Превышений лимита не обнаружено</Text>
      </ThemedText>
      <ThemedText style={styles.emptySubtext}>
        <Text>Вы отлично управляете своим бюджетом!</Text>
      </ThemedText>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <ThemedView style={styles.modalContent}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              <Text>История превышений лимита</Text>
            </ThemedText>
            <TouchableOpacity onPress={onClose}>
              <ThemedText style={{ color: themeColors.tint }}>
                <Text>Закрыть</Text>
              </ThemedText>
            </TouchableOpacity>
          </View>

          <FlatList
            data={sortedHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={EmptyHistory}
            contentContainerStyle={styles.listContent}
          />
        </ThemedView>
      </View>
    </Modal>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  title: {
    fontSize: 18,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  historyItemDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  historyItemAmount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    opacity: 0.7,
    textAlign: 'center',
  },
}); 