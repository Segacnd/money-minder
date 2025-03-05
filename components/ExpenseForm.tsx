import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  Text,
  FlatList,
  Pressable 
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { IconSymbol } from './ui/IconSymbol';
import { ExpenseService } from '../services/ExpenseService';
import { predefinedCategories } from '../constants/Categories';

interface ExpenseFormProps {
  onSubmit: (data: { amount: number; category: string; description?: string }) => void;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [usedCategories, setUsedCategories] = useState<string[]>([]);
  
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  // Загрузка ранее использованных категорий
  useEffect(() => {
    const loadUsedCategories = async () => {
      try {
        const expenses = await ExpenseService.getExpenses();
        // Получаем уникальные категории из существующих расходов
        const uniqueCategories = Array.from(new Set(expenses.map(expense => expense.category)));
        setUsedCategories(uniqueCategories);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
      }
    };
    
    loadUsedCategories();
  }, []);
  
  // Обновление предложений при изменении ввода
  useEffect(() => {
    if (category.trim()) {
      // Сначала предлагаем из ранее использованных категорий
      const matchingUsedCategories = usedCategories.filter(
        cat => cat.toLowerCase().includes(category.toLowerCase()) && cat !== category
      );
      
      // Затем добавляем предопределенные категории, которые еще не в списке
      const predefinedMatches = predefinedCategories
        .map(cat => cat.name)
        .filter(
          name => 
            name.toLowerCase().includes(category.toLowerCase()) && 
            name !== category &&
            !matchingUsedCategories.includes(name)
        );
      
      const allSuggestions = [...matchingUsedCategories, ...predefinedMatches];
      setCategorySuggestions(allSuggestions);
      setShowCategorySuggestions(allSuggestions.length > 0);
    } else {
      setCategorySuggestions([]);
      setShowCategorySuggestions(false);
    }
  }, [category, usedCategories]);
  
  const handleCategoryChange = (text: string) => {
    setCategory(text);
    setShowCategorySuggestions(true);
  };
  
  const handleSelectCategory = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setShowCategorySuggestions(false);
  };
  
  const handleSubmit = () => {
    // Валидация
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Пожалуйста, введите корректную сумму');
      return;
    }
    
    if (!category) {
      setError('Пожалуйста, укажите категорию');
      return;
    }
    
    // Отправка данных
    onSubmit({
      amount: Number(amount),
      category,
      description: description || undefined,
    });
    
    // Сброс формы
    setAmount('');
    setCategory('');
    setDescription('');
    setError(null);
  };
  
  return (
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

        {showCategorySuggestions && category.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {categorySuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSelectCategory(suggestion)}
              >
                <ThemedText>{suggestion}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.formGroup}>
          <ThemedText>Категория</ThemedText>
          <TextInput
            style={[styles.input, { color: themeColors.text }]}
            value={category}
            onChangeText={handleCategoryChange}
            placeholder="Введите категорию"
            placeholderTextColor={themeColors.text + '80'}
          />
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

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <ThemedText>Отмена</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton, { backgroundColor: themeColors.tint }]}
            onPress={handleSubmit}
          >
            <ThemedText style={{ color: '#fff' }}>Добавить</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  suggestionsContainer: {
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
    borderRadius: 8,
    maxHeight: 120,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
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
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
}); 