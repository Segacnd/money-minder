import React, { useCallback, memo } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Expense } from '@/types/expenses';
import { formatCurrency } from '@/utils/formatters';
import * as Haptics from 'expo-haptics';
import { predefinedCategories } from '@/constants/Categories';

interface ExpensesListProps {
  expenses: Expense[];
  onDeleteItem: (expense: Expense) => void;
}

const ExpenseItem = memo(({ 
  expense, 
  onDelete
}: { 
  expense: Expense; 
  onDelete: (expense: Expense) => void;
}) => {
  const category = predefinedCategories.find(cat => cat.name === expense.category) || {
    name: expense.category,
    icon: 'label',
    color: '#607D8B'
  };

  const renderRightActions = useCallback(() => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#ff3b30' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDelete(expense);
          }}
        >
          <MaterialIcons name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }, [expense, onDelete]);

  return (
    <Animated.View style={styles.expenseItemContainer}>
      <Swipeable
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
      >
        <ThemedView style={styles.expenseItem}>
          <View style={styles.expenseItemContent}>
            <View style={styles.categoryContainer}>
              <View style={styles.categoryWrapper}>
                <View style={[styles.categoryIconContainer, { backgroundColor: category.color }]}>
                  <MaterialIcons 
                    name={category.icon} 
                    size={24} 
                    color="#fff" 
                  />
                </View>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryBadge, { backgroundColor: `${category.color}20` }]}>
                    <ThemedText style={[styles.categoryText, { color: category.color }]}>
                      {category.name}
                    </ThemedText>
                  </View>
                  <View style={styles.descriptionContainer}>
                    <ThemedText style={styles.expenseDescription} numberOfLines={1}>
                      {expense.description || ' '}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.expenseMain}>
              <ThemedText style={styles.expenseTitle} numberOfLines={1}>
                {expense.title}
              </ThemedText>
            </View>
            <View style={[styles.amountContainer, { backgroundColor: `${category.color}20` }]}>
              <ThemedText style={[styles.amountText, { color: category.color }]}>
                {formatCurrency(expense.amount)}
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </Swipeable>
    </Animated.View>
  );
});

export const ExpensesList = memo(({ expenses, onDeleteItem }: ExpensesListProps) => {
  return (
    <View style={styles.container}>
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onDelete={onDeleteItem}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  expenseItemContainer: {
    marginBottom: 8,
    marginHorizontal: 2,
  },
  expenseItem: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseItemContent: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryContainer: {
    padding: 2,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  categoryInfo: {
    gap: 8,
  },
  expenseMain: {
    flex: 1,
    marginRight: 12,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  expenseDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  amountContainer: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(71, 148, 235, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4794eb',
  },
  rightActions: {
    width: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#ff3b30',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  categoryBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4794eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionContainer: {
    height: 18,
  },
}); 