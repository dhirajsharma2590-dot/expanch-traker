import { Transaction, TransactionType, CategoryType, Bill, UserProfile } from './types';
import { ShoppingBag, Coffee, Zap, Car, HeartPulse, Briefcase, Music } from 'lucide-react';

export const MOCK_USER: UserProfile = {
  name: "Alex Johnson",
  avatarUrl: "https://picsum.photos/100/100",
  totalBalance: 59765.00,
  notificationPreferences: {
    billReminders: true,
    budgetAlerts: true,
    weeklyReports: false
  },
  currency: 'USD'
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    title: 'Puma Store',
    amount: 952,
    date: new Date(2024, 3, 5).toISOString(),
    type: TransactionType.EXPENSE,
    category: CategoryType.SHOPPING,
  },
  {
    id: '2',
    title: 'Nike Super Store',
    amount: 475,
    date: new Date(2024, 3, 5).toISOString(),
    type: TransactionType.EXPENSE,
    category: CategoryType.SHOPPING,
  },
  {
    id: '3',
    title: 'Uber Ride',
    amount: 24.50,
    date: new Date(2024, 3, 4).toISOString(),
    type: TransactionType.EXPENSE,
    category: CategoryType.TRANSPORT,
  },
  {
    id: '4',
    title: 'Monthly Salary',
    amount: 7000,
    date: new Date(2024, 3, 1).toISOString(),
    type: TransactionType.INCOME,
    category: CategoryType.SALARY,
  },
  {
    id: '5',
    title: 'Whole Foods',
    amount: 124.30,
    date: new Date(2024, 3, 6).toISOString(),
    type: TransactionType.EXPENSE,
    category: CategoryType.FOOD,
  },
    {
    id: '6',
    title: 'Netflix Subscription',
    amount: 15.99,
    date: new Date(2024, 3, 7).toISOString(),
    type: TransactionType.EXPENSE,
    category: CategoryType.ENTERTAINMENT,
  }
];

export const INITIAL_BILLS: Bill[] = [
  {
    id: '101',
    title: 'Electricity Bill',
    amount: 145.20,
    dueDate: new Date(2024, 3, 15).toISOString(),
    isPaid: false,
  },
  {
    id: '102',
    title: 'Internet - Fiber',
    amount: 60.00,
    dueDate: new Date(2024, 3, 20).toISOString(),
    isPaid: false,
  },
  {
    id: '103',
    title: 'House Rent',
    amount: 2500.00,
    dueDate: new Date(2024, 3, 1).toISOString(),
    isPaid: true,
  }
];

export const INITIAL_BUDGETS: Record<CategoryType, number> = {
  [CategoryType.FOOD]: 500,
  [CategoryType.SHOPPING]: 1000,
  [CategoryType.TRANSPORT]: 200,
  [CategoryType.BILLS]: 500,
  [CategoryType.HEALTH]: 300,
  [CategoryType.SALARY]: 0,
  [CategoryType.ENTERTAINMENT]: 150,
  [CategoryType.OTHER]: 200
};

export const CHART_DATA_MOCK = [
  { name: 'Jan', income: 4000, expense: 2400 },
  { name: 'Feb', income: 3000, expense: 1398 },
  { name: 'Mar', income: 2000, expense: 9800 },
  { name: 'Apr', income: 2780, expense: 3908 },
  { name: 'May', income: 1890, expense: 4800 },
  { name: 'Jun', income: 2390, expense: 3800 },
  { name: 'Jul', income: 3490, expense: 4300 },
];

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  [CategoryType.FOOD]: '#FF6B6B',
  [CategoryType.SHOPPING]: '#4ECDC4',
  [CategoryType.TRANSPORT]: '#45B7D1',
  [CategoryType.BILLS]: '#FFBE0B',
  [CategoryType.HEALTH]: '#FB5607',
  [CategoryType.SALARY]: '#8338EC',
  [CategoryType.ENTERTAINMENT]: '#3A86FF',
  [CategoryType.OTHER]: '#95A5A6'
};

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];