import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useBudget } from '@/hooks/useBudget';
import { BudgetData, CriticalExpense } from '@/types/budget';
import DateTimePicker from '@react-native-community/datetimepicker';

interface BudgetFormProps {
  onClose: () => void;
  initialData: BudgetData | null;
}

export function BudgetForm({ onClose, initialData }: BudgetFormProps) {
  const [income, setIncome] = useState(initialData?.monthlyIncome.toString() || '');
  const [salaryDate, setSalaryDate] = useState(
    initialData ? new Date(initialData.salaryDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [criticalExpenses, setCriticalExpenses] = useState<CriticalExpense[]>(
    initialData?.criticalExpenses || []
  );
  const [savingsGoal, setSavingsGoal] = useState(
    initialData?.savingsGoal.toString() || ''
  );

  const { updateBudgetData } = useBudget();
  
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const handleSave = async () => {
    if (!income || isNaN(Number(income))) {
      Alert.alert('Ошибка', 'Введите корректную сумму дохода');
      return;
    }

    if (!savingsGoal || isNaN(Number(savingsGoal))) {
      Alert.alert('Ошибка', 'Введите корректную сумму для накоплений');
      return;
    }

    try {
      await updateBudgetData(
        Number(income),
        salaryDate,
        criticalExpenses,
        Number(savingsGoal)
      );
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить данные');
    }
  };

  const handleAddExpense = () => {
    if (!expenseTitle || !expenseAmount || isNaN(Number(expenseAmount))) {
      Alert.alert('Ошибка', 'Заполните все поля корректно');
      return;
    }

    const newExpense: CriticalExpense = {
      id: Date.now().toString(),
      title: expenseTitle,
      amount: Number(expenseAmount),
    };

    setCriticalExpenses([...criticalExpenses, newExpense]);
    setExpenseTitle('');
    setExpenseAmount('');
  };

  const handleRemoveExpense = (id: string) => {
    setCriticalExpenses(criticalExpenses.filter(exp => exp.id !== id));
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
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              {initialData ? 'Изменить бюджет' : 'Новый бюджет'}
            </ThemedText>
            <TouchableOpacity onPress={onClose}>
              <ThemedText style={{ color: themeColors.tint }}>Закрыть</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <ThemedText>Месячный доход</ThemedText>
            <TextInput
              style={[styles.input, { color: themeColors.text }]}
              value={income}
              onChangeText={setIncome}
              placeholder="Введите сумму дохода"
              placeholderTextColor={themeColors.text + '80'}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.section}>
            <ThemedText>Дата зарплаты</ThemedText>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            >
              <ThemedText>
                {salaryDate.toLocaleDateString('ru-RU')}
              </ThemedText>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={salaryDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setSalaryDate(date);
                }}
              />
            )}
          </View>

          <View style={styles.section}>
            <ThemedText>Критические расходы</ThemedText>
            {criticalExpenses.map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <ThemedText>{expense.title}</ThemedText>
                <View style={styles.expenseItemRight}>
                  <ThemedText>{expense.amount} Br</ThemedText>
                  <TouchableOpacity
                    onPress={() => handleRemoveExpense(expense.id)}
                    style={styles.deleteButton}
                  >
                    <ThemedText style={{ color: 'red' }}>✕</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.expenseInputs}>
              <TextInput
                style={[styles.input, styles.expenseTitleInput, { color: themeColors.text }]}
                value={expenseTitle}
                onChangeText={setExpenseTitle}
                placeholder="На что"
                placeholderTextColor={themeColors.text + '80'}
                autoComplete="off"
                autoCorrect={false}
                spellCheck={false}
                textContentType="none"
              />
              <TextInput
                style={[styles.input, styles.expenseAmountInput, { color: themeColors.text }]}
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                placeholder="Сколько"
                placeholderTextColor={themeColors.text + '80'}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.button, styles.addButton, { borderColor: themeColors.tint }]}
                onPress={handleAddExpense}
              >
                <ThemedText style={{ color: themeColors.tint }}>+</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText>Накопления</ThemedText>
            <TextInput
              style={[styles.input, { color: themeColors.text }]}
              value={savingsGoal}
              onChangeText={setSavingsGoal}
              placeholder="Сумма для накоплений"
              placeholderTextColor={themeColors.text + '80'}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, { backgroundColor: themeColors.tint }]}
            onPress={handleSave}
          >
            <ThemedText style={{ color: colorScheme === 'dark' ? '#000' : '#fff' }}>
              Сохранить
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    width: '100%',
  },
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
  },
  section: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  expenseItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  expenseTitleInput: {
    flex: 2,
    marginTop: 0,
  },
  expenseAmountInput: {
    flex: 1,
    marginTop: 0,
  },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButton: {
    borderWidth: 1,
    width: 44,
    height: 44,
    padding: 0,
    justifyContent: 'center',
  },
  saveButton: {
    marginTop: 24,
  },
}); 