import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Platform, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useExpenses } from '@/hooks/useExpenses';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Expense } from '@/types/expenses';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ExpensesPieChart } from '@/components/analytics/ExpensesPieChart';
import { ExpensesBarChart } from '@/components/analytics/ExpensesBarChart';
import { KeyMetrics } from '@/components/analytics/KeyMetrics';
import { DetailedAnalytics } from '@/components/analytics/DetailedAnalytics';
import { SegmentedControl } from '@/components/SegmentedControl';

// Типы для данных аналитики
interface AnalyticsData {
  total: number;
  timeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

export default function AnalyticsScreen() {
  const {
    expenses,
    allExpenses,
    loading,
    error,
    loadExpenses,
    dateRange,
    changeDateRange,
    sortOption
  } = useExpenses();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    total: 0,
    timeOfDay: {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    },
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [displayStartDate, setDisplayStartDate] = useState<Date>(dateRange.startDate);
  const [displayEndDate, setDisplayEndDate] = useState<Date>(dateRange.endDate);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  // Обновляем отображаемые даты при изменении dateRange
  useEffect(() => {
    setDisplayStartDate(dateRange.startDate);
    setDisplayEndDate(dateRange.endDate);
  }, [dateRange]);

  // Обработчик для обновления данных при потягивании вниз
  const handleRefresh = async () => {
    Keyboard.dismiss();
    setRefreshing(true);
    await loadExpenses(false);
    setRefreshing(false);
  };

  // Обновляем данные каждый раз при фокусе на странице
  useFocusEffect(
    useCallback(() => {
      console.log('Аналитика: обновление данных при фокусе');
      loadExpenses(false);
      return () => {
        // Функция очистки, если потребуется
      };
    }, [loadExpenses])
  );

  // Обработка данных для аналитики
  useEffect(() => {
    if (expenses.length > 0) {
      calculateAnalyticsData(expenses);
    }
  }, [expenses]);

  // Расчет аналитических данных на основе расходов
  const calculateAnalyticsData = (expensesData: Expense[]) => {
    let totalAmount = 0;
    let morningAmount = 0;
    let afternoonAmount = 0;
    let eveningAmount = 0;
    let nightAmount = 0;

    expensesData.forEach(expense => {
      const expenseDate = new Date(expense.timestamp);
      const expenseHour = expenseDate.getHours();

      totalAmount += expense.amount;

      // Расчет расходов по времени суток
      if (expenseHour >= 6 && expenseHour < 12) {
        morningAmount += expense.amount; // Утро: 6:00 - 11:59
      } else if (expenseHour >= 12 && expenseHour < 18) {
        afternoonAmount += expense.amount; // День: 12:00 - 17:59
      } else if (expenseHour >= 18 && expenseHour < 24) {
        eveningAmount += expense.amount; // Вечер: 18:00 - 23:59
      } else {
        nightAmount += expense.amount; // Ночь: 00:00 - 5:59
      }
    });

    setAnalyticsData({
      total: totalAmount,
      timeOfDay: {
        morning: morningAmount,
        afternoon: afternoonAmount,
        evening: eveningAmount,
        night: nightAmount,
      },
    });
  };

  // Форматирование денежной суммы
  const formatCurrency = (amount: number): string => {
    return amount.toFixed(2) + ' BYN';
  };

  // Форматирование даты
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Обработчики изменения дат
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      selectedDate.setHours(0, 0, 0, 0);
      setDisplayStartDate(selectedDate);
      changeDateRange(selectedDate, displayEndDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      selectedDate.setHours(23, 59, 59, 999);
      setDisplayEndDate(selectedDate);
      changeDateRange(displayStartDate, selectedDate);
    }
  };

  // Получаем расходы за предыдущий период для сравнения
  const previousPeriodExpenses = useMemo(() => {
    const now = Date.now();
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000; // 30 дней назад
    return expenses.filter(expense => {
      return expense.timestamp >= monthAgo && expense.timestamp < now;
    });
  }, [expenses]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Аналитика</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Анализ ваших расходов
        </ThemedText>
      </View>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <ThemedView style={styles.card}>
            <KeyMetrics
              expenses={expenses}
              previousPeriodExpenses={previousPeriodExpenses}
            />
          </ThemedView>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Распределение расходов</ThemedText>
            <ThemedView style={styles.card}>
              <ExpensesPieChart expenses={expenses} />
            </ThemedView>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>График расходов</ThemedText>
            <ThemedView style={styles.card}>
              <View style={styles.barChartContainer}>
                <SegmentedControl
                  values={['День', 'Неделя', 'Месяц']}
                  selectedIndex={['day', 'week', 'month'].indexOf(selectedPeriod)}
                  onChange={(index: number) => {
                    setSelectedPeriod(['day', 'week', 'month'][index] as 'day' | 'week' | 'month');
                  }}
                  style={styles.segmentedControl}
                />
                <ExpensesBarChart
                  expenses={expenses}
                  period={selectedPeriod}
                />
              </View>
            </ThemedView>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Детальный анализ</ThemedText>
            <ThemedView style={styles.card}>
              <DetailedAnalytics expenses={expenses} />
            </ThemedView>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  headerTitle: {
    fontSize: 26,
    marginBottom: 4,
    color: '#fff',
  },
  headerSubtitle: {
    opacity: 0.7,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1c1c1e',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  barChartContainer: {
    padding: 16,
  },
  segmentedControl: {
    marginBottom: 16,
  },
}); 