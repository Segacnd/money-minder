import { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseFilter } from '../types/expenses';
import { ExpenseService } from '../services/ExpenseService';
import { SortOption } from '@/components/ExpenseSortSelector';
import { ExpenseFilterOptions } from '@/components/ExpenseFilters';

// Проверяет, относится ли timestamp к указанной дате
const isDateEqual = (timestamp: number, date: Date): boolean => {
  const expenseDate = new Date(timestamp);
  return (
    expenseDate.getDate() === date.getDate() &&
    expenseDate.getMonth() === date.getMonth() &&
    expenseDate.getFullYear() === date.getFullYear()
  );
};

// Сортирует расходы согласно выбранной опции сортировки
const sortExpenses = (expenses: Expense[], sortOption: SortOption): Expense[] => {
  const expensesCopy = [...expenses];
  
  switch (sortOption) {
    case SortOption.NEWEST:
      return expensesCopy.sort((a, b) => b.timestamp - a.timestamp);
    case SortOption.OLDEST:
      return expensesCopy.sort((a, b) => a.timestamp - b.timestamp);
    case SortOption.HIGHEST_AMOUNT:
      return expensesCopy.sort((a, b) => b.amount - a.amount);
    case SortOption.LOWEST_AMOUNT:
      return expensesCopy.sort((a, b) => a.amount - b.amount);
    case SortOption.CATEGORY_ASC:
      return expensesCopy.sort((a, b) => a.category.localeCompare(b.category));
    case SortOption.CATEGORY_DESC:
      return expensesCopy.sort((a, b) => b.category.localeCompare(a.category));
    default:
      return expensesCopy;
  }
};

// Фильтрует расходы в соответствии с указанными фильтрами
const applyFilters = (expenses: Expense[], filters: ExpenseFilterOptions): Expense[] => {
  return expenses.filter(expense => {
    // Фильтрация по категории
    if (filters.category && !expense.category.toLowerCase().includes(filters.category.toLowerCase())) {
      return false;
    }
    
    // Фильтрация по минимальной сумме
    if (filters.minAmount !== undefined && expense.amount < filters.minAmount) {
      return false;
    }
    
    // Фильтрация по максимальной сумме
    if (filters.maxAmount !== undefined && expense.amount > filters.maxAmount) {
      return false;
    }
    
    return true;
  });
};

export function useExpenses() {
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [displayedExpenses, setDisplayedExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для сортировки и фильтрации
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return {
      startDate: start,
      endDate: end
    };
  });
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [filterOptions, setFilterOptions] = useState<ExpenseFilterOptions>({});
  
  // Загрузка всех расходов
  const loadExpenses = useCallback(async (showOnlyToday: boolean = false) => {
    try {
      setLoading(true);
      const loadedExpenses = await ExpenseService.getExpenses();
      setAllExpenses(loadedExpenses);
      setError(null);
      
      // Обновляем отображаемые расходы с учетом текущих фильтров и сортировки
      updateDisplayedExpenses(loadedExpenses, selectedDate, sortOption, {
        ...filterOptions,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }, showOnlyToday);
    } catch (err) {
      console.error('Ошибка при загрузке расходов:', err);
      setError('Не удалось загрузить расходы');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, sortOption, filterOptions, dateRange]);
  
  // Обновление отображаемых расходов с учетом фильтров и сортировки
  const updateDisplayedExpenses = useCallback((
    expenses: Expense[],
    date: Date,
    sort: SortOption,
    filters: ExpenseFilterOptions,
    showOnlyToday: boolean = false
  ) => {
    let filtered = [...expenses];

    // Фильтрация по дате
    if (showOnlyToday) {
      // Для главной страницы - только сегодняшние расходы
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.timestamp);
        return (
          expenseDate.getDate() === date.getDate() &&
          expenseDate.getMonth() === date.getMonth() &&
          expenseDate.getFullYear() === date.getFullYear()
        );
      });
    } else if (filters.startDate && filters.endDate) {
      // Для истории - фильтрация по периоду, если он указан
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.timestamp);
        return expenseDate >= filters.startDate! && expenseDate <= filters.endDate!;
      });
    }

    // Фильтрация по категории
    if (filters.category) {
      filtered = filtered.filter(expense => expense.category === filters.category);
    }

    // Фильтрация по сумме
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(expense => expense.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(expense => expense.amount <= filters.maxAmount!);
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (sort) {
        case 'date-desc':
          return b.timestamp - a.timestamp;
        case 'date-asc':
          return a.timestamp - b.timestamp;
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });
    
    setDisplayedExpenses(filtered);
  }, []);
  
  // Добавление нового расхода
  const addExpense = useCallback(async (expenseData: Omit<Expense, 'id' | 'timestamp'>, showOnlyToday: boolean = false) => {
    try {
      setLoading(true);
      // Добавляем текущую временную метку
      const newExpense = await ExpenseService.addExpense({
        ...expenseData,
        timestamp: Date.now(),
      });
      
      // Обновляем список всех расходов
      const updatedExpenses = [newExpense, ...allExpenses];
      setAllExpenses(updatedExpenses);
      
      // Обновляем отображаемые расходы
      updateDisplayedExpenses(updatedExpenses, selectedDate, sortOption, filterOptions, showOnlyToday);
      
      return true;
    } catch (err) {
      console.error('Ошибка при добавлении расхода:', err);
      setError('Не удалось добавить расход');
      return false;
    } finally {
      setLoading(false);
    }
  }, [allExpenses, selectedDate, sortOption, filterOptions, updateDisplayedExpenses]);
  
  // Удаление расхода
  const deleteExpense = useCallback(async (id: string, showOnlyToday: boolean = false) => {
    try {
      setLoading(true);
      await ExpenseService.deleteExpense(id);
      
      // Обновляем список всех расходов
      const updatedExpenses = allExpenses.filter(expense => expense.id !== id);
      setAllExpenses(updatedExpenses);
      
      // Обновляем отображаемые расходы
      updateDisplayedExpenses(updatedExpenses, selectedDate, sortOption, filterOptions, showOnlyToday);
      
      return true;
    } catch (err) {
      console.error('Ошибка при удалении расхода:', err);
      setError('Не удалось удалить расход');
      return false;
    } finally {
      setLoading(false);
    }
  }, [allExpenses, selectedDate, sortOption, filterOptions, updateDisplayedExpenses]);
  
  // Обновление расхода
  const updateExpense = useCallback(async (updatedExpense: Expense, showOnlyToday: boolean = false) => {
    try {
      setLoading(true);
      await ExpenseService.updateExpense(updatedExpense);
      
      // Обновляем список всех расходов
      const updatedExpenses = allExpenses.map(expense =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      );
      setAllExpenses(updatedExpenses);
      
      // Обновляем отображаемые расходы
      updateDisplayedExpenses(updatedExpenses, selectedDate, sortOption, filterOptions, showOnlyToday);
      
      return true;
    } catch (err) {
      console.error('Ошибка при обновлении расхода:', err);
      setError('Не удалось обновить расход');
      return false;
    } finally {
      setLoading(false);
    }
  }, [allExpenses, selectedDate, sortOption, filterOptions, updateDisplayedExpenses]);
  
  // Изменение даты для фильтрации
  const changeSelectedDate = useCallback((date: Date) => {
    setSelectedDate(date);
    updateDisplayedExpenses(allExpenses, date, sortOption, filterOptions);
  }, [allExpenses, sortOption, filterOptions, updateDisplayedExpenses]);
  
  // Изменение периода дат
  const changeDateRange = useCallback((startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
    updateDisplayedExpenses(allExpenses, selectedDate, sortOption, {
      ...filterOptions,
      startDate,
      endDate
    });
  }, [allExpenses, selectedDate, sortOption, filterOptions, updateDisplayedExpenses]);
  
  // Изменение сортировки
  const changeSortOption = useCallback((option: SortOption) => {
    setSortOption(option);
    updateDisplayedExpenses(allExpenses, selectedDate, option, filterOptions);
  }, [allExpenses, selectedDate, filterOptions, updateDisplayedExpenses]);
  
  // Изменение фильтров
  const changeFilters = useCallback((filters: ExpenseFilterOptions) => {
    setFilterOptions(filters);
    updateDisplayedExpenses(allExpenses, selectedDate, sortOption, filters);
  }, [allExpenses, selectedDate, sortOption, updateDisplayedExpenses]);
  
  // Расчет общей суммы расходов за период
  const getTotal = useCallback((): number => {
    return displayedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [displayedExpenses]);
  
  // Загрузка расходов при первом рендере
  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);
  
  return {
    allExpenses,
    expenses: displayedExpenses,
    loading,
    error,
    addExpense,
    deleteExpense,
    updateExpense,
    loadExpenses,
    selectedDate,
    changeSelectedDate,
    dateRange,
    changeDateRange,
    sortOption,
    changeSortOption,
    filterOptions,
    changeFilters,
    getTotal,
  };
} 