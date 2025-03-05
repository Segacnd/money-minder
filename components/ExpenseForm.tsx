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
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit }) => {
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
      style={styles.keyboardAvoid}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>
          Добавить расход
        </ThemedText>
        
        {error && (
          <ThemedText style={styles.error}>{error}</ThemedText>
        )}
        
        <View style={styles.inputContainer}>
          <ThemedText>Сумма:</ThemedText>
          <TextInput
            style={[
              styles.input,
              { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }
            ]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={
              colorScheme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
            }
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <ThemedText>Категория:</ThemedText>
          <TextInput
            style={[
              styles.input,
              { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }
            ]}
            value={category}
            onChangeText={handleCategoryChange}
            placeholder="Например: Продукты"
            placeholderTextColor={
              colorScheme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
            }
          />
          
          {showCategorySuggestions && categorySuggestions.length > 0 && (
            <ThemedView style={styles.suggestionsContainer}>
              <FlatList
                data={categorySuggestions}
                keyExtractor={(item, index) => `suggestion-${index}`}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                style={styles.suggestionsList}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.suggestionItem,
                      pressed && { opacity: 0.7 }
                    ]}
                    onPress={() => handleSelectCategory(item)}
                  >
                    <ThemedText>{item}</ThemedText>
                  </Pressable>
                )}
              />
            </ThemedView>
          )}
        </View>
        
        <View style={styles.inputContainer}>
          <ThemedText>Описание (необязательно):</ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
              { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Дополнительные детали..."
            placeholderTextColor={
              colorScheme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
            }
            multiline
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: themeColors.tint }]}
          onPress={handleSubmit}
        >
          <IconSymbol
            name="plus.circle.fill"
            size={20}
            color={colorScheme === 'dark' ? 'black' : 'white'}
          />
          <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? 'black' : 'white' }]}>
            Добавить
          </Text>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    width: '100%',
  },
  container: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
  error: {
    color: '#FF3B30',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 82, // Ниже input
    left: 0,
    right: 0,
    zIndex: 100,
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 