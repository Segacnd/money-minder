import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useExpenses } from '@/hooks/useExpenses';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Expense } from '@/types/expenses';
import { TimeOfDayChart } from '@/components/TimeOfDayChart';
import { MonthlyExpensesChart } from '@/components/MonthlyExpensesChart';

// Типы для данных аналитики
interface AnalyticsData {
  totalMonth: number;
  totalYear: number;
  timeOfDay: {
    morning: number; // 06:00 - 11:59
    afternoon: number; // 12:00 - 17:59
    evening: number; // 18:00 - 23:59
    night: number; // 00:00 - 05:59
  };
}

export default function AnalyticsScreen() {
  const { expenses, loading, error, loadExpenses } = useExpenses();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalMonth: 0,
    totalYear: 0,
    timeOfDay: {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    },
  });
  const [refreshing, setRefreshing] = useState(false);
  
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  // Обработчик для обновления данных при потягивании вниз
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };
  
  // Обновляем данные каждый раз при фокусе на странице
  useFocusEffect(
    useCallback(() => {
      console.log('Аналитика: обновление данных при фокусе');
      loadExpenses();
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
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let totalMonthAmount = 0;
    let totalYearAmount = 0;
    let morningAmount = 0;
    let afternoonAmount = 0;
    let eveningAmount = 0;
    let nightAmount = 0;
    
    expensesData.forEach(expense => {
      const expenseDate = new Date(expense.timestamp);
      const expenseMonth = expenseDate.getMonth();
      const expenseYear = expenseDate.getFullYear();
      const expenseHour = expenseDate.getHours();
      
      // Расчет расходов за текущий месяц
      if (expenseMonth === currentMonth && expenseYear === currentYear) {
        totalMonthAmount += expense.amount;
      }
      
      // Расчет расходов за текущий год
      if (expenseYear === currentYear) {
        totalYearAmount += expense.amount;
      }
      
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
      totalMonth: totalMonthAmount,
      totalYear: totalYearAmount,
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
    return amount.toFixed(2) + ' ₽';
  };
  
  // Получение названия текущего месяца
  const getCurrentMonthName = (): string => {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[new Date().getMonth()];
  };
  
  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Аналитика
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Статистика ваших расходов
        </ThemedText>
      </ThemedView>
      
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={themeColors.tint} />
          <ThemedText style={styles.loaderText}>Загрузка данных...</ThemedText>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
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
          {error ? (
            <ThemedView style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </ThemedView>
          ) : (
            <>
              {/* Блок с общей статистикой */}
              <ThemedView style={styles.analyticsCard}>
                <ThemedText type="subtitle" style={styles.cardTitle}>
                  Общие расходы
                </ThemedText>
                
                <View style={styles.statRow}>
                  <ThemedText>За {getCurrentMonthName()}:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={[styles.statValue, {color: themeColors.tint}]}>
                    {formatCurrency(analyticsData.totalMonth)}
                  </ThemedText>
                </View>
                
                <View style={styles.statRow}>
                  <ThemedText>За {new Date().getFullYear()} год:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={[styles.statValue, {color: themeColors.tint}]}>
                    {formatCurrency(analyticsData.totalYear)}
                  </ThemedText>
                </View>
              </ThemedView>
              
              {/* График расходов по месяцам */}
              <ThemedView style={styles.analyticsCard}>
                <MonthlyExpensesChart 
                  expenses={expenses} 
                  year={new Date().getFullYear()} 
                />
              </ThemedView>
              
              {/* Блок с расходами по времени суток */}
              <ThemedView style={styles.analyticsCard}>
                <TimeOfDayChart 
                  morningAmount={analyticsData.timeOfDay.morning}
                  afternoonAmount={analyticsData.timeOfDay.afternoon}
                  eveningAmount={analyticsData.timeOfDay.evening}
                  nightAmount={analyticsData.timeOfDay.night}
                />
              </ThemedView>
              
              {/* Таблица с расходами по времени суток */}
              <ThemedView style={styles.analyticsCard}>
                <ThemedText type="subtitle" style={styles.cardTitle}>
                  Расходы по времени суток
                </ThemedText>
                
                <View style={styles.statRow}>
                  <ThemedText>Утро (6:00 - 11:59):</ThemedText>
                  <ThemedText type="defaultSemiBold" style={[styles.statValue, {color: '#FFD700'}]}>
                    {formatCurrency(analyticsData.timeOfDay.morning)}
                  </ThemedText>
                </View>
                
                <View style={styles.statRow}>
                  <ThemedText>День (12:00 - 17:59):</ThemedText>
                  <ThemedText type="defaultSemiBold" style={[styles.statValue, {color: '#FF8C00'}]}>
                    {formatCurrency(analyticsData.timeOfDay.afternoon)}
                  </ThemedText>
                </View>
                
                <View style={styles.statRow}>
                  <ThemedText>Вечер (18:00 - 23:59):</ThemedText>
                  <ThemedText type="defaultSemiBold" style={[styles.statValue, {color: '#8A2BE2'}]}>
                    {formatCurrency(analyticsData.timeOfDay.evening)}
                  </ThemedText>
                </View>
                
                <View style={styles.statRow}>
                  <ThemedText>Ночь (00:00 - 5:59):</ThemedText>
                  <ThemedText type="defaultSemiBold" style={[styles.statValue, {color: '#4B0082'}]}>
                    {formatCurrency(analyticsData.timeOfDay.night)}
                  </ThemedText>
                </View>
              </ThemedView>
              
              {/* Заметка о том, что время записывается автоматически */}
              <ThemedView style={styles.noteCard}>
                <ThemedText style={styles.noteText}>
                  Время расходов записывается автоматически при создании записи.
                </ThemedText>
              </ThemedView>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loaderText: {
    marginTop: 12,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  analyticsCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  statValue: {
    fontSize: 16,
  },
  noteCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
  },
  noteText: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
}); 