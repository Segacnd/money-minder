import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View, TextInput, Modal, Pressable, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ExpenseService } from '@/services/ExpenseService';
import { predefinedCategories } from '@/constants/Categories';

// Категории расходов
const EXPENSE_CATEGORIES = [
  'Продукты',
  'Транспорт',
  'Развлечения',
  'Здоровье',
  'Счета',
  'Покупки',
  'Образование',
  'Путешествия',
  'Рестораны',
  'Другое'
];

export interface ExpenseFilterOptions {
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface ExpenseFiltersProps {
  onApplyFilters: (filters: ExpenseFilterOptions) => void;
  onResetFilters: () => void;
  activeFilters: ExpenseFilterOptions;
}

export function ExpenseFilters({ onApplyFilters, onResetFilters, activeFilters }: ExpenseFiltersProps) {
  const [category, setCategory] = useState<string | undefined>(activeFilters.category);
  const [minAmount, setMinAmount] = useState<string>(activeFilters.minAmount?.toString() || '');
  const [maxAmount, setMaxAmount] = useState<string>(activeFilters.maxAmount?.toString() || '');
  const [modalVisible, setModalVisible] = useState(false);
  const [allCategories, setAllCategories] = useState<string[]>(EXPENSE_CATEGORIES);
  
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  // Загрузка всех категорий, включая пользовательские
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const expenses = await ExpenseService.getExpenses();
        const userCategories = Array.from(new Set(expenses.map(expense => expense.category)));
        const predefinedNames = predefinedCategories.map(cat => cat.name);
        
        // Объединяем предопределенные и пользовательские категории
        const uniqueCategories = Array.from(new Set([...predefinedNames, ...userCategories]));
        setAllCategories(uniqueCategories);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
      }
    };
    
    loadCategories();
  }, []);
  
  // Открытие модального окна
  const openModal = useCallback(() => {
    setModalVisible(true);
  }, []);
  
  // Закрытие модального окна
  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);
  
  // Обновляем локальное состояние при изменении входящих фильтров
  useEffect(() => {
    setCategory(activeFilters.category);
    setMinAmount(activeFilters.minAmount?.toString() || '');
    setMaxAmount(activeFilters.maxAmount?.toString() || '');
  }, [activeFilters]);
  
  // Обновляем состояние компонента при возвращении на экран
  useFocusEffect(
    useCallback(() => {
      // Сбрасываем состояние на первоначальные значения при перефокусе
      setCategory(activeFilters.category);
      setMinAmount(activeFilters.minAmount?.toString() || '');
      setMaxAmount(activeFilters.maxAmount?.toString() || '');
      
      return () => {
        // Закрываем модальное окно при уходе с экрана
        setModalVisible(false);
      };
    }, [activeFilters])
  );
  
  const handleApplyFilters = () => {
    const filters: ExpenseFilterOptions = {};
    
    if (category) {
      filters.category = category;
    }
    
    if (minAmount && !isNaN(Number(minAmount))) {
      filters.minAmount = Number(minAmount);
    }
    
    if (maxAmount && !isNaN(Number(maxAmount))) {
      filters.maxAmount = Number(maxAmount);
    }
    
    onApplyFilters(filters);
    closeModal();
  };
  
  const handleResetFilters = () => {
    setCategory(undefined);
    setMinAmount('');
    setMaxAmount('');
    onResetFilters();
  };
  
  // Получаем количество активных фильтров
  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (activeFilters.category) count++;
    if (activeFilters.minAmount !== undefined) count++;
    if (activeFilters.maxAmount !== undefined) count++;
    return count;
  };
  
  const activeFiltersCount = getActiveFiltersCount();
  
  // Проверяем, является ли категория выбранной
  const isCategorySelected = (cat: string): boolean => {
    return category === cat;
  };
  
  return (
    <View>
      <TouchableOpacity 
        style={[
          styles.filterButton,
          activeFiltersCount > 0 && { backgroundColor: `${themeColors.tint}20` }
        ]} 
        onPress={openModal}
        testID="filter-button"
      >
        <IconSymbol name="line.3.horizontal.decrease" size={16} color={themeColors.tint} />
        <ThemedText style={styles.filterButtonText}>
          {activeFiltersCount > 0 ? `Фильтры (${activeFiltersCount})` : 'Фильтры'}
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
                Фильтры
              </ThemedText>
              <TouchableOpacity onPress={closeModal}>
                <IconSymbol name="xmark" size={20} color={themeColors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <ThemedText style={styles.sectionTitle}>
                Категория
              </ThemedText>
              <View style={styles.categoriesContainer}>
                {allCategories.map(cat => {
                  const predefinedCategory = predefinedCategories.find(pc => pc.name === cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        isCategorySelected(cat) && { backgroundColor: `${themeColors.tint}20` }
                      ]}
                      onPress={() => setCategory(isCategorySelected(cat) ? undefined : cat)}
                    >
                      <View style={styles.categoryContent}>
                        <IconSymbol
                          name={predefinedCategory?.icon || 'tag'}
                          size={16}
                          color={predefinedCategory?.color || themeColors.tint}
                        />
                        <ThemedText style={[
                          styles.categoryText,
                          isCategorySelected(cat) && { color: themeColors.tint, fontWeight: 'bold' }
                        ]}>
                          {cat}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              <ThemedText style={styles.sectionTitle}>
                Сумма
              </ThemedText>
              <View style={styles.amountContainer}>
                <View style={styles.amountInputContainer}>
                  <ThemedText style={styles.amountLabel}>
                    От
                  </ThemedText>
                  <TextInput
                    style={[styles.amountInput, { color: themeColors.text }]}
                    value={minAmount}
                    onChangeText={setMinAmount}
                    placeholder="0"
                    placeholderTextColor={themeColors.text + '50'}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.amountInputContainer}>
                  <ThemedText style={styles.amountLabel}>
                    До
                  </ThemedText>
                  <TextInput
                    style={[styles.amountInput, { color: themeColors.text }]}
                    value={maxAmount}
                    onChangeText={setMaxAmount}
                    placeholder="1000000"
                    placeholderTextColor={themeColors.text + '50'}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.resetButton]}
                  onPress={handleResetFilters}
                >
                  <ThemedText style={styles.resetButtonText}>
                    Сбросить
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.applyButton, { backgroundColor: themeColors.tint }]}
                  onPress={handleApplyFilters}
                >
                  <ThemedText style={styles.applyButtonText}>
                    Применить
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  filterButtonText: {
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
    maxHeight: '70%',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  categoryText: {
    fontSize: 14,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountInputContainer: {
    width: '48%',
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  applyButton: {
    marginLeft: 8,
  },
  resetButtonText: {
    fontSize: 14,
  },
  applyButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}); 