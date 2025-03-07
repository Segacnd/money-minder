export interface Expense {
  id: string;
  amount: number;
  category: string;
  description?: string;
  timestamp: number;
  title: string;
  icon: string;
}

export interface ExpenseFilter {
  startDate?: number;
  endDate?: number;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
} 