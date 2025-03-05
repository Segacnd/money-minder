import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, Animated, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Expense } from '@/types/expenses';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { predefinedCategories } from '@/constants/Categories';

interface ExpensesListProps {
  expenses: Expense[];
  onDeleteItem: (expense: Expense) => Promise<void>;
  showDate?: boolean;
}

const AnimatedExpenseItem = React.memo(({ 
  expense, 
  onDelete, 
  showDate, 
  themeColors 
}: { 
  expense: Expense; 
  onDelete: (expense: Expense) => void; 
  showDate: boolean; 
  themeColors: any; 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      onDelete(expense);
    });
  };

  const predefinedCategory = predefinedCategories.find(cat => cat.name === expense.category);

  return (
    <Animated.View
      style={[
        styles.expenseItem,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim
        }
      ]}
    >
      <ThemedView style={styles.expenseItemContent}>
        <View style={styles.expenseMain}>
          <View style={[
            styles.categoryIconContainer,
            { backgroundColor: `${predefinedCategory?.color || themeColors.tint}20` }
          ]}>
            <IconSymbol 
              name={predefinedCategory?.icon || 'tag'} 
              size={20} 
              color={predefinedCategory?.color || themeColors.tint}
            />
          </View>
          
          <View style={styles.expenseDetails}>
            <ThemedText style={styles.expenseDescription}>
              {expense.description || expense.category}
            </ThemedText>
            
            <View style={styles.expenseMetadata}>
              <View style={[
                styles.categoryContainer,
                { backgroundColor: `${predefinedCategory?.color || themeColors.tint}20` }
              ]}>
                <ThemedText style={[
                  styles.categoryText,
                  { color: predefinedCategory?.color || themeColors.tint }
                ]}>
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
          onPress={() => {
            Alert.alert(
              'Удаление расхода',
              `Вы уверены, что хотите удалить этот расход?`,
              [
                {
                  text: 'Отмена',
                  style: 'cancel',
                },
                {
                  text: 'Удалить',
                  style: 'destructive',
                  onPress: handleDelete,
                },
              ]
            );
          }}
        >
          <IconSymbol name="trash" size={18} color="rgba(255, 59, 48, 0.8)" />
        </TouchableOpacity>
      </ThemedView>
    </Animated.View>
  );
});

export function ExpensesList({ expenses, onDeleteItem, showDate = false }: ExpensesListProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  if (expenses.length === 0) {
    return null;
  }

  const renderItem = ({ item }: { item: Expense }) => (
    <AnimatedExpenseItem
      expense={item}
      onDelete={onDeleteItem}
      showDate={showDate}
      themeColors={themeColors}
    />
  );

  return (
    <FlatList
      data={expenses}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  expenseItem: {
    marginBottom: 10,
  },
  expenseItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
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
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
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