import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, ExpenseFilter } from '../types/expenses';

const EXPENSES_STORAGE_KEY = 'expenses';

export class ExpenseService {
  /**
   * Сохраняет новый расход
   */
  static async addExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const expenses = await this.getExpenses();
    
    // Создаем новый расход с уникальным ID
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    
    await AsyncStorage.setItem(
      EXPENSES_STORAGE_KEY,
      JSON.stringify([...expenses, newExpense])
    );
    
    return newExpense;
  }

  /**
   * Получает все расходы
   */
  static async getExpenses(): Promise<Expense[]> {
    try {
      const expensesJson = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
      return expensesJson ? JSON.parse(expensesJson) : [];
    } catch (error) {
      console.error('Ошибка при получении расходов:', error);
      return [];
    }
  }

  /**
   * Удаляет расход по ID
   */
  static async deleteExpense(id: string): Promise<void> {
    const expenses = await this.getExpenses();
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    
    await AsyncStorage.setItem(
      EXPENSES_STORAGE_KEY,
      JSON.stringify(updatedExpenses)
    );
  }

  /**
   * Обновляет существующий расход
   */
  static async updateExpense(updatedExpense: Expense): Promise<void> {
    const expenses = await this.getExpenses();
    const updatedExpenses = expenses.map(expense => 
      expense.id === updatedExpense.id ? updatedExpense : expense
    );
    
    await AsyncStorage.setItem(
      EXPENSES_STORAGE_KEY,
      JSON.stringify(updatedExpenses)
    );
  }

  /**
   * Фильтрует расходы по заданным критериям
   */
  static async filterExpenses(filter: ExpenseFilter): Promise<Expense[]> {
    const expenses = await this.getExpenses();
    
    return expenses.filter(expense => {
      // Фильтрация по дате
      if (filter.startDate && expense.timestamp < filter.startDate) return false;
      if (filter.endDate && expense.timestamp > filter.endDate) return false;
      
      // Фильтрация по категории
      if (filter.category && expense.category !== filter.category) return false;
      
      // Фильтрация по сумме
      if (filter.minAmount && expense.amount < filter.minAmount) return false;
      if (filter.maxAmount && expense.amount > filter.maxAmount) return false;
      
      return true;
    });
  }
} 