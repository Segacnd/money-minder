import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { Expense } from '../types/expenses';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

interface ExpenseItemProps {
  expense: Expense;
  onPress?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ 
  expense,
  onPress,
  onDelete
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  // Форматирование даты для читаемого отображения (без вывода в интерфейсе)
  const formattedDate = new Date(expense.timestamp).toLocaleDateString();
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress?.(expense)}
    >
      <View style={styles.content}>
        <View style={styles.categoryContainer}>
          <IconSymbol 
            name="tag.fill" 
            size={18} 
            color={themeColors.tint} 
          />
          <ThemedText type="defaultSemiBold" style={styles.category}>
            {expense.category}
          </ThemedText>
        </View>
        
        {expense.description && (
          <ThemedText style={styles.description}>
            {expense.description}
          </ThemedText>
        )}
        
        <ThemedText type="title" style={styles.amount}>
          {expense.amount.toFixed(2)} BYN
        </ThemedText>
      </View>
      
      {onDelete && (
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => onDelete(expense)}
        >
          <IconSymbol 
            name="trash.fill" 
            size={20} 
            color="#FF3B30" 
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  content: {
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  category: {
    marginLeft: 6,
  },
  description: {
    marginTop: 4,
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
  },
  deleteButton: {
    padding: 8,
  },
}); 