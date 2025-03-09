import React, { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Modal, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export enum SortOption {
  NEWEST = 'date-desc',
  OLDEST = 'date-asc',
  HIGHEST_AMOUNT = 'amount-desc',
  LOWEST_AMOUNT = 'amount-asc',
  CATEGORY_ASC = 'category-asc',
  CATEGORY_DESC = 'category-desc',
}

// Описания опций сортировки
export const SORT_OPTIONS = [
  { value: SortOption.NEWEST, label: 'Сначала новые' },
  { value: SortOption.OLDEST, label: 'Сначала старые' },
  { value: SortOption.HIGHEST_AMOUNT, label: 'По убыванию суммы' },
  { value: SortOption.LOWEST_AMOUNT, label: 'По возрастанию суммы' },
  { value: SortOption.CATEGORY_ASC, label: 'По категории (А-Я)' },
  { value: SortOption.CATEGORY_DESC, label: 'По категории (Я-А)' },
];

interface ExpenseSortSelectorProps {
  onSelectSort: (option: SortOption) => void;
  currentSort: SortOption;
}

export function ExpenseSortSelector({ onSelectSort, currentSort }: ExpenseSortSelectorProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const [modalVisible, setModalVisible] = useState(false);
  
  const currentSortLabel = SORT_OPTIONS.find(option => option.value === currentSort)?.label || 'Сортировка';
  
  // Открытие модального окна
  const openModal = useCallback(() => {
    setModalVisible(true);
  }, []);
  
  // Закрытие модального окна
  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);
  
  const handleSelectSort = (sortOption: SortOption) => {
    onSelectSort(sortOption);
    closeModal();
  };
  
  return (
    <View>
      <TouchableOpacity 
        style={styles.sortButton} 
        onPress={openModal}
        testID="sort-button"
      >
        <MaterialIcons name="sort" size={16} color={themeColors.tint} />
        <ThemedText style={styles.sortButtonText}>
          {currentSortLabel}
        </ThemedText>
      </TouchableOpacity>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable 
            style={styles.modalBackdrop} 
            onPress={closeModal}
          />
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Выберите способ сортировки
              </ThemedText>
              <TouchableOpacity onPress={closeModal}>
                <MaterialIcons name="close" size={20} color={themeColors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    currentSort === option.value && { backgroundColor: `${themeColors.tint}20` }
                  ]}
                  onPress={() => handleSelectSort(option.value)}
                >
                  <ThemedText style={[
                    styles.sortOptionText,
                    currentSort === option.value && { color: themeColors.tint, fontWeight: 'bold' }
                  ]}>
                    {option.label}
                  </ThemedText>
                  {currentSort === option.value && (
                    <MaterialIcons name="check" size={20} color={themeColors.tint} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  sortButtonText: {
    marginLeft: 6,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  modalTitle: {
    fontSize: 18,
  },
  modalBody: {
    padding: 16,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOptionText: {
    fontSize: 16,
  },
}); 