import React, { useState, useEffect, useMemo, memo, useRef, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl, Modal, Platform, KeyboardAvoidingView, Keyboard, Dimensions, Animated } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseFilters } from '@/components/ExpenseFilters';
import { ExpenseSortSelector } from '@/components/ExpenseSortSelector';
import { ExpensesList } from '@/components/ExpensesList';
import { DailyLimitProgressBar } from '@/components/DailyLimitProgressBar';
import { useExpenses } from '@/hooks/useExpenses';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Expense } from '@/types/expenses';
import { useBudget } from '@/hooks/useBudget';
import { formatCurrency } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { TipDisplay } from '@/components/TipDisplay';
import { moneyTips } from '@/constants/MoneyTips';
import * as Haptics from 'expo-haptics';

const DynamicIslandIcon = memo(() => {
  if (Platform.OS !== 'ios') return null;

  const { height } = Dimensions.get('window');
  const hasDynamicIsland = Platform.OS === 'ios' && height >= 852;

  if (!hasDynamicIsland) return null;

  return (
    <View style={styles.dynamicIslandWrapper}>
      <View style={styles.dynamicIslandIcon}>
        <Ionicons name="wallet-outline" size={24} color="#fff" />
      </View>
    </View>
  );
});

const ListHeader = memo(({ 
  budgetData, 
  onAddPress, 
  sortOption, 
  onSortChange,
  filterOptions,
  onFiltersChange,
  onFiltersReset,
  themeColors 
}: any) => (
  <>
    {budgetData && (
      <DailyLimitProgressBar 
        remainingLimit={budgetData.remainingDailyLimit}
        totalLimit={budgetData.dailyLimit}
      />
    )}

    <TouchableOpacity
      style={[styles.addButton, { borderColor: themeColors.tint }]}
      onPress={onAddPress}
    >
      <ThemedText style={{ color: themeColors.tint }}>
        Добавить расход
      </ThemedText>
    </TouchableOpacity>

    <View style={styles.filtersContainer}>
      <ExpenseSortSelector
        onSelectSort={onSortChange}
        currentSort={sortOption}
      />
      <ExpenseFilters
        onApplyFilters={onFiltersChange}
        onResetFilters={onFiltersReset}
        activeFilters={filterOptions}
      />
    </View>

    <ThemedText type="subtitle" style={styles.sectionTitle}>
      Расходы за сегодня
    </ThemedText>
  </>
));

export default function TabOneScreen() {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletedExpense, setDeletedExpense] = useState<Expense | null>(null);
  const snackbarAnim = useRef(new Animated.Value(0)).current;
  
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
  const { budgetData, updateRemainingLimit } = useBudget();

  const showSnackbar = useCallback(() => {
    Animated.timing(snackbarAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
      hideSnackbar();
    }, 5000);
  }, []);

  const hideSnackbar = useCallback(() => {
    Animated.timing(snackbarAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setDeletedExpense(null);
    });
  }, []);

  const handleDeleteExpense = useCallback(async (expense: Expense) => {
    setDeletedExpense(expense);
    await deleteExpense(expense.id, true);
    showSnackbar();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [deleteExpense, showSnackbar]);

  const handleUndoDelete = useCallback(async () => {
    if (deletedExpense) {
      await addExpense({
        title: deletedExpense.title,
        amount: deletedExpense.amount,
        category: deletedExpense.category,
        description: deletedExpense.description,
        icon: deletedExpense.icon,
      }, true);
      hideSnackbar();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [deletedExpense, addExpense]);

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
      
      // Обновляем оставшийся дневной лимит
      if (budgetData) {
        await updateRemainingLimit(expense.amount);
      }
    } catch (error) {
      console.error('Ошибка при добавлении расхода:', error);
    }
  };

  // Компонент для нижнего отступа
  const BottomSpacer = () => <View style={styles.bottomSpacer} />;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ThemedView style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <ThemedText type="title" style={styles.headerTitle}>
                Money Minder
              </ThemedText>
              <TipDisplay
                tips={moneyTips}
                style={styles.headerSubtitle}
                intervalDuration={5000}
              />
            </View>
            <TouchableOpacity 
              style={styles.headerRight}
              onPress={() => router.push("/settings")}
            >
              <Ionicons 
                name="settings-outline" 
                size={24} 
                color={themeColors.text} 
              />
            </TouchableOpacity>
          </View>
        </ThemedView>

        <FlatList
          data={expenses}
          renderItem={({ item }) => (
            <ExpensesList
              expenses={[item]}
              onDeleteItem={handleDeleteExpense}
            />
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <ListHeader
              budgetData={budgetData}
              onAddPress={() => setShowExpenseForm(true)}
              sortOption={sortOption}
              onSortChange={changeSortOption}
              filterOptions={filterOptions}
              onFiltersChange={changeFilters}
              onFiltersReset={() => changeFilters({})}
              themeColors={themeColors}
            />
          }
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

        {/* Snackbar для отмены удаления */}
        {deletedExpense && (
          <Animated.View 
            style={[
              styles.snackbar,
              {
                transform: [{
                  translateY: snackbarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0]
                  })
                }]
              }
            ]}
          >
            <ThemedText style={styles.snackbarText}>
              Расход удален
            </ThemedText>
            <TouchableOpacity onPress={handleUndoDelete}>
              <ThemedText style={styles.undoButton}>
                ОТМЕНИТЬ
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Modal с формой добавления расхода */}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 16,
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 24,
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.7,
  },
  scrollContent: {
    padding: 6,
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
  bottomSpacer: {
    height: 80,
  },
  dynamicIslandWrapper: {
    position: 'absolute',
    top: 15,
    left: 100,
    zIndex: 1000,
  },
  dynamicIslandIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  snackbarText: {
    color: '#fff',
    fontSize: 16,
  },
  undoButton: {
    color: '#4794eb',
    fontWeight: 'bold',
    marginLeft: 16,
  },
});
