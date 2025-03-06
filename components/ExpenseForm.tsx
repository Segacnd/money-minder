import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

interface ExpenseFormProps {
  onSubmit: (data: { amount: number; category: string; description?: string }) => void;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  
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
            <TextInput
              style={[styles.input, { color: themeColors.text }]}
              value={category}
              onChangeText={setCategory}
              placeholder="Введите категорию"
              placeholderTextColor={themeColors.text + '80'}
              autoComplete="off"
              autoCorrect={false}
              spellCheck={false}
              textContentType="none"
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