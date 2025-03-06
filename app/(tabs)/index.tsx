import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl, Modal, Platform, KeyboardAvoidingView, SafeAreaView, TouchableWithoutFeedback, Keyboard } from 'react-native';
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
import { useBudget } from '@/hooks/useBudget';
import { formatCurrency } from '@/utils/formatters';

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
  const { budgetData } = useBudget();

  const handleRefresh = async () => {
    Keyboard.dismiss();
    setRefreshing(true);
    await loadExpenses(true);
    setRefreshing(false);
  };

  useEffect(() => {
    loadExpenses(true);
  }, []);

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'timestamp'>) => {
    try {
      setShowExpenseForm(false);
      await addExpense(expense, true);
    } catch (error) {
      console.error('Ошибка при добавлении расхода:', error);
    }
  };

  const handleDeleteExpense = async (expense: Expense) => {
    Keyboard.dismiss();
    await deleteExpense(expense.id, true);
  };

  const ListHeader = () => (
    <>
      <DailyTotalWidget totalAmount={getTotal()} />

      {budgetData && (
        <ThemedView style={styles.dailyLimitContainer}>
          <ThemedText>Дневной лимит:</ThemedText>
          <ThemedText style={[styles.dailyLimit, { color: themeColors.tint }]}>
            {formatCurrency(budgetData.remainingDailyLimit)}
          </ThemedText>
        </ThemedView>
      )}

      <TouchableOpacity
        style={[styles.addButton, { borderColor: themeColors.tint }]}
        onPress={() => setShowExpenseForm(true)}
      >
        <ThemedText style={{ color: themeColors.tint }}>
          Добавить расход
        </ThemedText>
      </TouchableOpacity>

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

  // Компонент для нижнего отступа
  const BottomSpacer = () => <View style={styles.bottomSpacer} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
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
          ListFooterComponent={BottomSpacer}
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
          onScrollBeginDrag={() => Keyboard.dismiss()}
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={showExpenseForm}
          onRequestClose={() => setShowExpenseForm(false)}
          statusBarTranslucent={true}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              Keyboard.dismiss();
              setShowExpenseForm(false);
            }}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()} 
              style={styles.modalContentWrapper}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
    paddingBottom: 90,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContentWrapper: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
  },
  dailyLimitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  dailyLimit: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 80,
  },
});
