import React from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Expense } from '@/types/expenses';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface ExpensesListProps {
  expenses: Expense[];
  onDeleteItem: (expense: Expense) => Promise<void>;
  showDate?: boolean;
}

export function ExpensesList({ expenses, onDeleteItem, showDate = false }: ExpensesListProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  const handleDelete = (expense: Expense) => {
    Alert.alert(
      'Удаление расхода',
      `Вы уверены, что хотите удалить расход "${expense.description}" на сумму ${formatCurrency(expense.amount)}?`,
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => onDeleteItem(expense),
        },
      ]
    );
  };
  
  const getCategoryIcon = (category: string) => {
    // Сопоставление категорий с иконками
    const categoryIcons: Record<string, string> = {
      'Продукты': 'cart',
      'Транспорт': 'car',
      'Жильё': 'house',
      'Развлечения': 'film',
      'Здоровье': 'heart',
      'Одежда': 'bag',
      'Рестораны': 'fork.knife',
      'Путешествия': 'airplane',
      'Связь': 'phone',
      'Образование': 'book',
    };
    
    return categoryIcons[category] || 'tag';
  };
  
  if (expenses.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      {expenses.map((expense) => (
        <ThemedView key={expense.id} style={styles.expenseItem}>
          <View style={styles.expenseMain}>
            <View style={styles.categoryIconContainer}>
              <IconSymbol 
                name={getCategoryIcon(expense.category)} 
                size={20} 
                color={themeColors.tint}
              />
            </View>
            
            <View style={styles.expenseDetails}>
              <ThemedText style={styles.expenseDescription}>
                {expense.description}
              </ThemedText>
              
              <View style={styles.expenseMetadata}>
                <View style={styles.categoryContainer}>
                  <ThemedText style={styles.categoryText}>
                    {expense.category}
                  </ThemedText>
                </View>
                
                {showDate && (
                  <ThemedText style={styles.dateText}>
                    {formatDate(new Date(expense.timestamp))}
                  </ThemedText>
                )}
              </View>
            </View>
            
            <View style={styles.amountContainer}>
              <ThemedText style={styles.amountText}>
                {formatCurrency(expense.amount)}
              </ThemedText>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDelete(expense)}
          >
            <IconSymbol name="trash" size={18} color="rgba(255, 59, 48, 0.8)" />
          </TouchableOpacity>
        </ThemedView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  expenseMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  expenseMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryContainer: {
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    opacity: 0.7,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  amountContainer: {
    marginLeft: 'auto',
    paddingLeft: 16,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 8,
  },
}); 