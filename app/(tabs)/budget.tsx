import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, Modal, Keyboard, Text } from 'react-native';
import { ThemedText, CurrencyText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useBudget } from '@/hooks/useBudget';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { formatCurrency } from '@/utils/formatters';
import { BudgetForm } from '@/components/BudgetForm';
import { OverLimitHistoryModal } from '@/components/OverLimitHistoryModal';
import { Ionicons } from '@expo/vector-icons';

export default function BudgetScreen() {
  const {
    budgetData,
    loading,
    setIncomeData,
    addCriticalExpense,
    removeCriticalExpense,
    setSavingsGoal,
    resetBudget,
    loadBudgetData,
    getOverLimitHistory,
  } = useBudget();

  const [income, setIncome] = useState('');
  const [salaryDate, setSalaryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [savingsAmount, setSavingsAmount] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showOverLimitHistory, setShowOverLimitHistory] = useState(false);

  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const handleSaveIncome = () => {
    if (!income || isNaN(Number(income))) {
      Alert.alert('Ошибка', 'Введите корректную сумму дохода');
      return;
    }
    setIncomeData(Number(income), salaryDate);
    setIncome('');
  };

  const handleAddCriticalExpense = () => {
    if (!expenseTitle || !expenseAmount || isNaN(Number(expenseAmount))) {
      Alert.alert('Ошибка', 'Заполните все поля корректно');
      return;
    }
    addCriticalExpense(expenseTitle, Number(expenseAmount));
    setExpenseTitle('');
    setExpenseAmount('');
  };

  const handleSaveSavingsGoal = () => {
    if (!savingsAmount || isNaN(Number(savingsAmount))) {
      Alert.alert('Ошибка', 'Введите корректную сумму для накоплений');
      return;
    }
    setSavingsGoal(Number(savingsAmount));
    setSavingsAmount('');
  };

  const handleReset = () => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите сбросить все данные бюджета?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Сбросить', style: 'destructive', onPress: resetBudget },
      ]
    );
  };

  const handleCloseForm = async () => {
    console.log('[DEBUG] handleCloseForm вызван');
    Keyboard.dismiss();
    setShowForm(false);
    
    // Перезагружаем данные после закрытия формы
    try {
      console.log('[DEBUG] Начинаем загрузку данных бюджета в handleCloseForm');
      await loadBudgetData();
      console.log('[DEBUG] Данные бюджета успешно загружены в handleCloseForm');
    } catch (error) {
      console.error('[DEBUG] Ошибка при загрузке данных бюджета в handleCloseForm:', error);
    }
  };

  const handleShowOverLimitHistory = () => {
    setShowOverLimitHistory(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ThemedText>Загрузка...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Планирование бюджета
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Распределение финансов
        </ThemedText>
      </ThemedView>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        {budgetData ? (
          <>
            <View style={styles.section}>
              <ThemedText type="subtitle">Основная информация</ThemedText>
              <View style={styles.infoRow}>
                <ThemedText>Месячный доход:</ThemedText>
                <ThemedText style={styles.value}>
                  <CurrencyText amount={budgetData.monthlyIncome} />
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText>Дата зарплаты:</ThemedText>
                <ThemedText style={styles.value}>
                  <Text>{new Date(budgetData.salaryDate).toLocaleDateString('ru-RU')}</Text>
                </ThemedText>
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle">Критические расходы</ThemedText>
              {budgetData.criticalExpenses.map((expense) => (
                <View key={expense.id} style={styles.infoRow}>
                  <ThemedText>{expense.title}:</ThemedText>
                  <ThemedText style={styles.value}>
                    <CurrencyText amount={expense.amount} />
                  </ThemedText>
                </View>
              ))}
              <View style={styles.infoRow}>
                <ThemedText>Всего критических расходов:</ThemedText>
                <ThemedText style={styles.value}>
                  <CurrencyText amount={budgetData.criticalExpenses.reduce((sum, exp) => sum + exp.amount, 0)} />
                </ThemedText>
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle">Накопления</ThemedText>
              <View style={styles.infoRow}>
                <ThemedText>Цель по накоплениям:</ThemedText>
                <ThemedText style={styles.value}>
                  <CurrencyText amount={budgetData.savingsGoal} />
                </ThemedText>
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle">Дневной бюджет</ThemedText>
              <View style={styles.infoRow}>
                <ThemedText>Дневной лимит:</ThemedText>
                <ThemedText style={[styles.value, { color: themeColors.tint }]}>
                  <CurrencyText amount={budgetData.dailyLimit} />
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText>Осталось на сегодня:</ThemedText>
                <ThemedText 
                  style={[
                    styles.value, 
                    { 
                      color: budgetData.remainingDailyLimit < 0 ? '#FF3B30' : themeColors.tint 
                    }
                  ]}
                >
                  <CurrencyText amount={budgetData.remainingDailyLimit} />
                </ThemedText>
              </View>
              {budgetData.overLimitAmount && budgetData.overLimitAmount > 0 && (
                <View style={styles.infoRow}>
                  <ThemedText>Превышение лимита:</ThemedText>
                  <ThemedText style={[styles.value, { color: '#FF3B30' }]}>
                    <CurrencyText amount={budgetData.overLimitAmount} />
                  </ThemedText>
                </View>
              )}
              
              {budgetData.overLimitHistory && budgetData.overLimitHistory.length > 0 && (
                <TouchableOpacity 
                  style={styles.detailsButton}
                  onPress={handleShowOverLimitHistory}
                >
                  <ThemedText style={styles.detailsButtonText}>
                    <Text>Подробная история превышений</Text>
                  </ThemedText>
                  <Ionicons 
                    name="chevron-forward" 
                    size={16} 
                    color={themeColors.text} 
                  />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeColors.tint }]}
              onPress={() => setShowForm(true)}
            >
              <ThemedText style={{ color: colorScheme === 'dark' ? '#000' : '#fff' }}>
                <Text>Изменить данные</Text>
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resetButton, { borderColor: 'red' }]}
              onPress={handleReset}
            >
              <ThemedText style={{ color: 'red' }}>
                <Text>Сбросить данные</Text>
              </ThemedText>
            </TouchableOpacity>
            
            <View style={styles.bottomSpacer} />
          </>
        ) : (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              <Text>Данные бюджета не заполнены</Text>
            </ThemedText>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeColors.tint }]}
              onPress={() => setShowForm(true)}
            >
              <ThemedText style={{ color: colorScheme === 'dark' ? '#000' : '#fff' }}>
                <Text>Заполнить данные</Text>
              </ThemedText>
            </TouchableOpacity>
            
            <View style={styles.bottomSpacer} />
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showForm}
        onRequestClose={handleCloseForm}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => {
            Keyboard.dismiss();
            handleCloseForm();
          }}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedView style={styles.modalContent}>
              <BudgetForm
                onClose={handleCloseForm}
                initialData={budgetData}
              />
            </ThemedView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <OverLimitHistoryModal 
        visible={showOverLimitHistory}
        onClose={() => setShowOverLimitHistory(false)}
        history={budgetData?.overLimitHistory || []}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  headerTitle: {
    fontSize: 24,
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  value: {
    fontWeight: '600',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: '90%',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    marginBottom: 16,
    opacity: 0.7,
  },
  bottomSpacer: {
    height: 80,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.3)',
  },
  detailsButtonText: {
    opacity: 0.8,
  },
}); 