import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity, Platform, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useExpenses } from '@/hooks/useExpenses';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Expense } from '@/types/expenses';
import { TimeOfDayChart } from '@/components/TimeOfDayChart';
import { MonthlyExpensesChart } from '@/components/MonthlyExpensesChart';
import { IconSymbol } from '@/components/ui/IconSymbol';
import DateTimePicker from '@react-native-community/datetimepicker';

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
          <ThemedText style={styles.loaderText}>
            Загрузка данных...
          </ThemedText>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[themeColors.tint]}
              tintColor={themeColors.tint}
            />
          }
          contentContainerStyle={styles.scrollContent}
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          {/* Выбор периода */}
          <ThemedView style={styles.dateRangeContainer}>
            <ThemedText type="subtitle" style={styles.dateRangeTitle}>
              Период анализа
            </ThemedText>
            <View style={styles.datePickersContainer}>
              <TouchableOpacity
                style={[styles.dateButton, { borderColor: themeColors.tint }]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <IconSymbol name="calendar" size={20} color={themeColors.tint} />
                <ThemedText style={[styles.dateButtonText, { color: themeColors.tint }]}>
                  {formatDate(displayStartDate)}
                </ThemedText>
              </TouchableOpacity>
              
              <ThemedText style={styles.dateRangeSeparator}>—</ThemedText>
              
              <TouchableOpacity
                style={[styles.dateButton, { borderColor: themeColors.tint }]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <IconSymbol name="calendar" size={20} color={themeColors.tint} />
                <ThemedText style={[styles.dateButtonText, { color: themeColors.tint }]}>
                  {formatDate(displayEndDate)}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* Блок с общей статистикой */}
          <ThemedView style={styles.analyticsCard}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Общие расходы за период
            </ThemedText>
            <ThemedText type="title" style={[styles.totalAmount, { color: themeColors.tint }]}>
              {formatCurrency(analyticsData.total)}
            </ThemedText>
          </ThemedView>

          {/* График расходов по месяцам */}
          <ThemedView style={styles.analyticsCard}>
            <MonthlyExpensesChart 
              expenses={expenses}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
            />
          </ThemedView>

          {/* График расходов по времени суток */}
          <ThemedView style={styles.analyticsCard}>
            <TimeOfDayChart 
              morningAmount={analyticsData.timeOfDay.morning}
              afternoonAmount={analyticsData.timeOfDay.afternoon}
              eveningAmount={analyticsData.timeOfDay.evening}
              nightAmount={analyticsData.timeOfDay.night}
            />
          </ThemedView>

          {/* Детализация по времени суток */}
          <ThemedView style={styles.analyticsCard}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Расходы по времени суток
            </ThemedText>

            <View style={styles.statRow}>
              <ThemedText>Утро (6:00 - 11:59):</ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: '#FFD700' }]}>
                {formatCurrency(analyticsData.timeOfDay.morning)}
              </ThemedText>
            </View>

            <View style={styles.statRow}>
              <ThemedText>День (12:00 - 17:59):</ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: '#FF8C00' }]}>
                {formatCurrency(analyticsData.timeOfDay.afternoon)}
              </ThemedText>
            </View>

            <View style={styles.statRow}>
              <ThemedText>Вечер (18:00 - 23:59):</ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: '#8A2BE2' }]}>
                {formatCurrency(analyticsData.timeOfDay.evening)}
              </ThemedText>
            </View>

            <View style={styles.statRow}>
              <ThemedText>Ночь (00:00 - 5:59):</ThemedText>
              <ThemedText type="defaultSemiBold" style={[styles.statValue, { color: '#4B0082' }]}>
                {formatCurrency(analyticsData.timeOfDay.night)}
              </ThemedText>
            </View>
          </ThemedView>

          {/* Нижний отступ для navBar */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

      {Platform.OS === 'ios' ? (
        <>
          <Modal
            animationType="slide"
            transparent={true}
            visible={showStartDatePicker}
            onRequestClose={() => setShowStartDatePicker(false)}
          >
            <View style={styles.modalContainer}>
              <ThemedView style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity 
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowStartDatePicker(false);
                    }}
                    style={styles.modalButton}
                  >
                    <ThemedText style={{ color: themeColors.tint }}>Отмена</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowStartDatePicker(false);
                    }}
                    style={styles.modalButton}
                  >
                    <ThemedText style={{ color: themeColors.tint }}>Готово</ThemedText>
                  </TouchableOpacity>
                </View>
                
                <DateTimePicker
                  value={displayStartDate}
                  mode="date"
                  display="spinner"
                  onChange={handleStartDateChange}
                  locale="ru-RU"
                />
              </ThemedView>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={showEndDatePicker}
            onRequestClose={() => setShowEndDatePicker(false)}
          >
            <View style={styles.modalContainer}>
              <ThemedView style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity 
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowEndDatePicker(false);
                    }}
                    style={styles.modalButton}
                  >
                    <ThemedText style={{ color: themeColors.tint }}>Отмена</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowEndDatePicker(false);
                    }}
                    style={styles.modalButton}
                  >
                    <ThemedText style={{ color: themeColors.tint }}>Готово</ThemedText>
                  </TouchableOpacity>
                </View>
                
                <DateTimePicker
                  value={displayEndDate}
                  mode="date"
                  display="spinner"
                  onChange={handleEndDateChange}
                  locale="ru-RU"
                />
              </ThemedView>
            </View>
          </Modal>
        </>
      ) : (
        <>
          {showStartDatePicker && (
            <DateTimePicker
              value={displayStartDate}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
              locale="ru-RU"
            />
          )}
          
          {showEndDatePicker && (
            <DateTimePicker
              value={displayEndDate}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
              locale="ru-RU"
            />
          )}
        </>
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
  dateRangeContainer: {
    padding: 16,
    marginBottom: 8,
  },
  dateRangeTitle: {
    marginBottom: 12,
  },
  datePickersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 14,
  },
  dateRangeSeparator: {
    marginHorizontal: 8,
    fontSize: 16,
  },
  analyticsCard: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  cardTitle: {
    marginBottom: 12,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontWeight: '600',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
    width: '100%',
  },
  modalButton: {
    minWidth: 60,
  },
  scrollContent: {
    padding: 16,
  },
  bottomSpacer: {
    height: 80, // Высота нижней навигации
  },
}); 