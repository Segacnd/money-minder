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
  onSubmit: (data: { amount: number; category: string; description?: string }) => void;
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
  
  const handleSubmit = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Пожалуйста, введите корректную сумму');
      return;
    }
    
    if (!category) {
      setError('Пожалуйста, укажите категорию');
      return;
    }
    
    onSubmit({
      amount: Number(amount),
      category,
      description: description || undefined,
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
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Добавить расход
          </ThemedText>

          <View style={styles.formGroup}>
            <ThemedText>Сумма</ThemedText>
            <TextInput
              style={[styles.input, { color: themeColors.text }]}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="Введите сумму"
              placeholderTextColor={themeColors.text + '80'}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText>Категория</ThemedText>
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
                <MaterialIcons name="add" size={20} color={themeColors.tint} />
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
                    <ScrollView style={styles.categoriesList}>
                      {predefinedCategories.map((cat) => (
                        <TouchableOpacity
                          key={cat.name}
                          style={[
                            styles.categoryOption,
                            category === cat.name && { backgroundColor: themeColors.tint + '20' }
                          ]}
                          onPress={() => handleSelectCategory(cat.name)}
                        >
                          <View style={styles.categoryOptionContent}>
                            <MaterialIcons
                              name={cat.icon}
                              size={20}
                              color={cat.color || themeColors.tint}
                            />
                            <ThemedText style={styles.categoryOptionText}>
                              {cat.name}
                            </ThemedText>
                          </View>
                          {category === cat.name && (
                            <MaterialIcons
                              name="check"
                              size={20}
                              color={themeColors.tint}
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </ThemedView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    width: '100%',
  },
  container: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  title: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  categoryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  categorySelector: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addCategoryButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryOptionText: {
    fontSize: 16,
  },
  newCategoryContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 