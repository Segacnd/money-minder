import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScrollView } from 'react-native-gesture-handler';
import { DailyTotalWidget } from '@/components/DailyTotalWidget';
import { ExpenseFilters, ExpenseFilterOptions } from '@/components/ExpenseFilters';
import { ExpenseSortSelector, SortOption } from '@/components/ExpenseSortSelector';
import { ExpensesList } from '@/components/ExpensesList';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense } from '@/types/expenses';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function HistoryScreen() {
  const {
    expenses,
    loading,
    error,
    loadExpenses,
    deleteExpense,
    selectedDate,
    changeSelectedDate,
    sortOption,
    changeSortOption,
    filterOptions,
    changeFilters,
    getDailyTotal,
  } = useExpenses();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  // Обновляем данные каждый раз при фокусе на странице
  useFocusEffect(
    useCallback(() => {
      console.log('История: обновление данных при фокусе');
      loadExpenses();
      return () => {
        // Функция очистки, если потребуется
      };
    }, [loadExpenses])
  );
  
  // Обработчик для обновления списка расходов при потягивании вниз
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };
  
  // Обработчик удаления расхода
  const handleDeleteExpense = async (expense: Expense) => {
    await deleteExpense(expense.id);
  };
  
  // Обработчик изменения даты
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      changeSelectedDate(selectedDate);
    }
  };
  
  // Обработчик изменения фильтров
  const handleApplyFilters = (filters: ExpenseFilterOptions) => {
    changeFilters(filters);
  };
  
  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    changeFilters({});
  };
  
  // Обработчик изменения сортировки
  const handleChangeSortOption = (option: SortOption) => {
    changeSortOption(option);
  };
  
  // Форматирование даты для отображения
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    return date.toLocaleDateString('ru-RU', options);
  };
  
  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          История расходов
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Просмотр всех ваших расходов
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
          {error && (
            <ThemedView style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </ThemedView>
          )}
          
          {/* Виджет с общей суммой расходов за выбранный день */}
          <DailyTotalWidget 
            totalAmount={getDailyTotal()} 
            date={selectedDate} 
          />
          
          {/* Выбор даты */}
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <IconSymbol name="calendar" size={20} color={themeColors.tint} />
            <ThemedText style={styles.datePickerText}>
              {formatDate(selectedDate)}
            </ThemedText>
            <IconSymbol name="chevron.down" size={16} color={themeColors.tint} />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={selectedDate}
              mode={'date'}
              display="default"
              onChange={handleDateChange}
            />
          )}
          
          {/* Блок с сортировкой и фильтрацией */}
          <View style={styles.filtersContainer}>
            <ExpenseSortSelector 
              onSelectSort={handleChangeSortOption} 
              currentSort={sortOption} 
            />
            <ExpenseFilters 
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
              activeFilters={filterOptions}
            />
          </View>
          
          {/* Список расходов */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Список расходов
          </ThemedText>
          
          <ExpensesList
            expenses={expenses}
            onDeleteItem={handleDeleteExpense}
          />
          
          {expenses.length === 0 && (
            <ThemedView style={styles.emptyStateContainer}>
              <ThemedText style={styles.emptyStateText}>
                Нет расходов за выбранную дату
              </ThemedText>
              <TouchableOpacity
                style={[styles.emptyStateButton, { borderColor: themeColors.tint }]}
                onPress={() => changeSelectedDate(new Date())}
              >
                <ThemedText style={{ color: themeColors.tint }}>
                  Вернуться к сегодняшней дате
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
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
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  datePickerText: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 20,
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyStateButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
}); 