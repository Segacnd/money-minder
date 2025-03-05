import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, RefreshControl, TouchableOpacity, FlatList, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ExpenseFilters, ExpenseFilterOptions } from '@/components/ExpenseFilters';
import { ExpenseSortSelector, SortOption } from '@/components/ExpenseSortSelector';
import { ExpensesList } from '@/components/ExpensesList';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense } from '@/types/expenses';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HistoryScreen() {
  const {
    expenses,
    loading,
    error,
    loadExpenses,
    deleteExpense,
    sortOption,
    changeSortOption,
    filterOptions,
    changeFilters,
  } = useExpenses();
  
  const [refreshing, setRefreshing] = useState(false);
  
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
    await loadExpenses(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadExpenses(false);
  }, []);
  
  // Обработчик удаления расхода
  const handleDeleteExpense = async (expense: Expense) => {
    await deleteExpense(expense.id, false);
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
  
  const ListHeader = () => (
    <>
      {/* Блок с сортировкой и фильтрацией */}
      <View style={styles.controlsContainer}>
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
      </View>

      {/* Заголовок списка */}
      <View style={styles.listHeaderContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Все расходы
        </ThemedText>
      </View>
    </>
  );

  const ListEmptyComponent = () => (
    <ThemedView style={styles.emptyStateContainer}>
      <ThemedText style={styles.emptyStateText}>
        У вас пока нет расходов
      </ThemedText>
    </ThemedView>
  );

  const renderItem = ({ item }: { item: Expense }) => (
    <ExpensesList
      expenses={[item]}
      onDeleteItem={handleDeleteExpense}
      showDate={true}
    />
  );
  
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
        <FlatList
          data={expenses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[themeColors.tint]}
              tintColor={themeColors.tint}
            />
          }
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
        />
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
  controlsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.3)',
  },
  sectionTitle: {
    fontSize: 18,
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
  scrollContent: {
    flexGrow: 1,
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
}); 