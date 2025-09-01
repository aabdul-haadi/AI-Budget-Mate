import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function formatCurrency(amount: number, currency = 'PKR'): string {
  const prefix = currency === 'PKR' ? 'PKR ' : currency;
  return `${prefix}${Math.abs(amount).toLocaleString('en-PK', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
}

export function getMonthYear(date: string | Date): string {
  return format(new Date(date), 'yyyy-MM');
}

export function filterTransactionsByDateRange(
  transactions: any[], 
  range: 'week' | 'month' | 'all'
) {
  const now = new Date();
  
  switch (range) {
    case 'week':
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      return transactions.filter(t => 
        isWithinInterval(new Date(t.date), { start: weekStart, end: weekEnd })
      );
    
    case 'month':
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      return transactions.filter(t => 
        isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
      );
    
    default:
      return transactions;
  }
}