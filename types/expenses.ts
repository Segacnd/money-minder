export interface Expense {
  id: string;
  amount: number;
  category: string;
  timestamp: number; // Хранение временной метки в миллисекундах
  description?: string;
}

export interface ExpenseFilter {
  startDate?: number;
  endDate?: number;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
} 