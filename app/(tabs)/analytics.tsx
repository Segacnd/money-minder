import React, { useState, useEffect, useCallback, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Platform, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useExpenses } from '@/hooks/useExpenses';
import { useBudget } from '@/hooks/useBudget';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Expense } from '@/types/expenses';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ExpensesPieChart } from '@/components/analytics/ExpensesPieChart';
import { ExpensesBarChart } from '@/components/analytics/ExpensesBarChart';
import { KeyMetrics } from '@/components/analytics/KeyMetrics';
import { DetailedAnalytics } from '@/components/analytics/DetailedAnalytics';
import { UnusedFundsStats } from '@/components/analytics/UnusedFundsStats';
import { SegmentedControl } from '@/components/SegmentedControl';
import { OverLimitChart } from '@/components/analytics/OverLimitChart';

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

// Добавляем интерфейсы для компонента ErrorBoundary
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Обновленный компонент ErrorBoundary с корректными типами
class ChartErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.log('Victory chart error suppressed:', error);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ThemedView style={styles.errorContainer}>
          <ThemedText>Не удалось загрузить график</ThemedText>
        </ThemedView>
      );
    }

    return this.props.children;
  }
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
  
  const { budgetData, loadBudgetData } = useBudget();
  
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

  // Загрузка данных при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      loadExpenses(false);
      loadBudgetData();
    }, [])
  );

  // Обработчик обновления данных
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExpenses(false);
    await loadBudgetData();
    setRefreshing(false);
  };

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[themeColors.tint]}
            tintColor={themeColors.tint}
          />
        }
      >
        <View style={styles.content}>
          <ThemedView style={styles.card}>
            <ChartErrorBoundary>
              <KeyMetrics
                expenses={expenses}
                previousPeriodExpenses={previousPeriodExpenses}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
              />
            </ChartErrorBoundary>
          </ThemedView>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Распределение расходов</ThemedText>
            <ThemedView style={styles.card}>
              <ChartErrorBoundary>
                <ExpensesPieChart expenses={expenses} />
              </ChartErrorBoundary>
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
                <ChartErrorBoundary>
                  <ExpensesBarChart
                    expenses={expenses}
                    period={selectedPeriod}
                  />
                </ChartErrorBoundary>
              </View>
            </ThemedView>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Детальный анализ</ThemedText>
            <ThemedView style={styles.card}>
              <ChartErrorBoundary>
                <DetailedAnalytics expenses={expenses} />
              </ChartErrorBoundary>
            </ThemedView>
          </View>

          {/* Новый компонент статистики неиспользованных средств */}
          {budgetData && (
            <ThemedView style={styles.card}>
              <ChartErrorBoundary>
                <UnusedFundsStats 
                  savedUnusedFunds={budgetData.savedUnusedFunds || 0}
                  unusedFundsYesterday={budgetData.unusedFundsYesterday}
                  monthlyIncome={budgetData.monthlyIncome}
                />
              </ChartErrorBoundary>
            </ThemedView>
          )}

          {/* Новый компонент статистики превышений лимита */}
          {budgetData && budgetData.overLimitHistory && budgetData.overLimitHistory.length > 0 && (
            <ThemedView style={styles.card}>
              <ChartErrorBoundary>
                <OverLimitChart history={budgetData.overLimitHistory} />
              </ChartErrorBoundary>
            </ThemedView>
          )}
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
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
}); 