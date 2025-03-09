import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  ScrollView,
  Pressable
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { predefinedCategories } from '@/constants/Categories';

interface ExpenseFormProps {
  onSubmit: (data: { 
    amount: number; 
    category: string; 
    description?: string;
    title: string;
    icon: string;
  }) => void;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  // Находим иконку для выбранной категории
  const getCategoryIcon = (categoryName: string): string => {
    const categoryEntry = predefinedCategories.find(c => c.name === categoryName);
    return categoryEntry?.icon || 'help-outline';
  };
  
  // Конвертирует строку с числом в формате с запятой или точкой в число
  const parseAmount = (value: string): number => {
    // Заменяем запятую на точку для корректного преобразования
    const normalizedValue = value.replace(',', '.');
    return Number(normalizedValue);
  };

  // Проверяет, является ли строка корректным числом (с учетом запятой)
  const isValidAmount = (value: string): boolean => {
    const normalizedValue = value.replace(',', '.');
    const num = Number(normalizedValue);
    return !isNaN(num) && num > 0;
  };
  
  const handleSubmit = () => {
    setError(null);
    
    if (!amount || !isValidAmount(amount)) {
      setError('Пожалуйста, введите корректную сумму больше нуля');
      return;
    }
    
    if (!category) {
      setError('Пожалуйста, выберите категорию');
      return;
    }
    
    onSubmit({
      amount: parseAmount(amount),
      category,
      description: description.trim() || undefined,
      title: category, // Используем категорию как заголовок
      icon: getCategoryIcon(category)
    });
    
    setAmount('');
    setCategory('');
    setDescription('');
    setError(null);
  };
  
  // Скрывает клавиатуру при нажатии вне полей ввода
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleSelectCategory = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
    setIsAddingNewCategory(false);
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      setCategory(newCategory.trim());
      setNewCategory('');
      setShowCategoryModal(false);
      setIsAddingNewCategory(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Добавить расход
      </ThemedText>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Сумма</ThemedText>
        <TextInput
          style={[styles.input, { color: themeColors.text }]}
          keyboardType="numeric"
          placeholder="Введите сумму"
          placeholderTextColor={themeColors.text + '80'}
          value={amount}
          onChangeText={setAmount}
          onBlur={() => {
            // Валидация при потере фокуса
            if (amount && !isValidAmount(amount)) {
              setError('Пожалуйста, введите корректную сумму больше нуля');
            }
          }}
        />
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Категория</ThemedText>
        <View style={styles.categoryInputContainer}>
          <TouchableOpacity
            style={[
              styles.categorySelector,
              { borderColor: themeColors.text + '30' }
            ]}
            onPress={() => {
              setShowCategoryModal(true);
              setIsAddingNewCategory(false);
            }}
          >
            {category ? (
              <View style={styles.selectedCategory}>
                <MaterialIcons
                  name={predefinedCategories.find(c => c.name === category)?.icon || 'label'}
                  size={20}
                  color={predefinedCategories.find(c => c.name === category)?.color || themeColors.tint}
                />
                <ThemedText>{category}</ThemedText>
              </View>
            ) : (
              <ThemedText style={{ color: themeColors.text + '80' }}>
                Выберите категорию
              </ThemedText>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addCategoryButton, { borderColor: themeColors.text + '30' }]}
            onPress={() => {
              setShowCategoryModal(true);
              setIsAddingNewCategory(true);
            }}
          >
            <MaterialIcons name="add" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <ThemedText>Комментарий</ThemedText>
        <TextInput
          style={[styles.input, { color: themeColors.text }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Введите комментарий (необязательно)"
          placeholderTextColor={themeColors.text + '80'}
        />
      </View>

      {error && (
        <ThemedText style={styles.errorText}>
          {error}
        </ThemedText>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <ThemedText style={{ color: '#fff' }}>
            Отмена
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
        >
          <ThemedText style={{ color: '#fff' }}>
            Добавить
          </ThemedText>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <ThemedView style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <ThemedText type="subtitle" style={styles.modalTitle}>
                    {isAddingNewCategory ? 'Новая категория' : 'Выберите категорию'}
                  </ThemedText>
                  <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                    <MaterialIcons name="close" size={20} color={themeColors.text} />
                  </TouchableOpacity>
                </View>

                {isAddingNewCategory ? (
                  <View style={styles.newCategoryContainer}>
                    <TextInput
                      style={[styles.input, { color: themeColors.text, flex: 1 }]}
                      value={newCategory}
                      onChangeText={setNewCategory}
                      placeholder="Введите название категории"
                      placeholderTextColor={themeColors.text + '80'}
                      autoFocus
                    />
                    <TouchableOpacity
                      style={[styles.button, styles.submitButton, { marginLeft: 8 }]}
                      onPress={handleAddNewCategory}
                    >
                      <ThemedText style={{ color: '#fff' }}>Добавить</ThemedText>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.addCustomCategoryButton}
                      onPress={() => setIsAddingNewCategory(true)}
                    >
                      <MaterialIcons name="add" size={24} color="#007AFF" />
                      <ThemedText style={{ color: "#007AFF", marginLeft: 8 }}>
                        Добавить свою категорию
                      </ThemedText>
                    </TouchableOpacity>
                    <ScrollView style={styles.categoriesList}>
                      {predefinedCategories.map((cat) => (
                        <TouchableOpacity
                          key={cat.name}
                          style={[
                            styles.categoryOption,
                            category === cat.name && { backgroundColor: "#007AFF20" }
                          ]}
                          onPress={() => handleSelectCategory(cat.name)}
                        >
                          <View style={styles.categoryOptionContent}>
                            <MaterialIcons
                              name={cat.icon}
                              size={20}
                              color={cat.color || "#007AFF"}
                            />
                            <ThemedText style={styles.categoryOptionText}>
                              {cat.name}
                            </ThemedText>
                          </View>
                          {category === cat.name && (
                            <MaterialIcons name="check" size={20} color="#007AFF" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}
              </ThemedView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
    borderRadius: 8,
    padding: 12,
  },
  categoryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categorySelector: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addCategoryButton: {
    borderWidth: 1,
    borderRadius: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  categoriesList: {
    padding: 16,
    maxHeight: 400,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryOptionText: {
    marginLeft: 12,
    fontSize: 16,
  },
  newCategoryContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addCustomCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
}); 