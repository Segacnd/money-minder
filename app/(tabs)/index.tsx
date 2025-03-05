import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl, Modal, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DailyTotalWidget } from '@/components/DailyTotalWidget';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseFilters } from '@/components/ExpenseFilters';
import { ExpenseSortSelector } from '@/components/ExpenseSortSelector';
import { ExpensesList } from '@/components/ExpensesList';
import { useExpenses } from '@/hooks/useExpenses';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Expense } from '@/types/expenses';

export default function TabOneScreen() {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {
    expenses,
    addExpense,
    deleteExpense,
    loadExpenses,
    getTotal,
    sortOption,
    changeSortOption,
    filterOptions,
    changeFilters,
  } = useExpenses();
  
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadExpenses(true);
    setRefreshing(false);
  };

  useEffect(() => {
    loadExpenses(true);
  }, []);

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'timestamp'>) => {
    await addExpense(expense, true);
    setShowExpenseForm(false);
  };

  const handleDeleteExpense = async (expense: Expense) => {
    await deleteExpense(expense.id, true);
  };

  const ListHeader = () => (
    <>
      <DailyTotalWidget totalAmount={getTotal()} />

      <TouchableOpacity
        style={[styles.addButton, { borderColor: themeColors.tint }]}
        onPress={() => setShowExpenseForm(true)}
      >
        <ThemedText style={{ color: themeColors.tint }}>
          Добавить расход
        </ThemedText>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showExpenseForm}
        onRequestClose={() => setShowExpenseForm(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setShowExpenseForm(false)}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedView style={styles.modalContent}>
              <ExpenseForm
                onSubmit={handleAddExpense}
                onCancel={() => setShowExpenseForm(false)}
              />
            </ThemedView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <View style={styles.filtersContainer}>
        <ExpenseSortSelector
          onSelectSort={changeSortOption}
          currentSort={sortOption}
        />
        <ExpenseFilters
          onApplyFilters={changeFilters}
          onResetFilters={() => changeFilters({})}
          activeFilters={filterOptions}
        />
      </View>

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Расходы за сегодня
      </ThemedText>
    </>
  );

  const renderItem = ({ item }: { item: Expense }) => (
    <ExpensesList
      expenses={[item]}
      onDeleteItem={handleDeleteExpense}
    />
  );

  return (
    <View style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Money Minder
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {new Date().toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </ThemedText>
      </ThemedView>

      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
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
  scrollContent: {
    padding: 16,
  },
  addButton: {
    marginVertical: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
  },
});
