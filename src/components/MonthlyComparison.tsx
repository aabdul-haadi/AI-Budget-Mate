import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction } from '../types/transaction';
import { formatCurrency } from '../utils/dateUtils';

interface MonthlyComparisonProps {
  transactions: Transaction[];
  darkMode: boolean;
}

export function MonthlyComparison({ transactions, darkMode }: MonthlyComparisonProps) {
  // Auto-update to current year
  const getCurrentYear = () => new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  // Get available years from transactions
  const availableYears = [...new Set([
    getCurrentYear(), // Always include current year
    ...transactions.map(t => new Date(t.date).getFullYear())
  ])].sort((a, b) => b - a);

  // Generate monthly data for the selected year
  const monthlyData = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const monthStr = `${selectedYear}-${month.toString().padStart(2, '0')}`;
    
    const monthTransactions = transactions.filter(t => t.date.startsWith(monthStr));
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savings = income - expenses;

    return {
      month: new Date(selectedYear, index).toLocaleDateString('en-US', { month: 'short' }),
      monthNumber: month,
      income,
      expenses,
      savings,
      transactionCount: monthTransactions.length,
      isCurrentMonth: selectedYear === getCurrentYear() && month === new Date().getMonth() + 1
    };
  });

  // Calculate year-over-year comparison if previous year data exists
  const previousYearData = availableYears.includes(selectedYear - 1) ? 
    Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthStr = `${selectedYear - 1}-${month.toString().padStart(2, '0')}`;
      
      const monthTransactions = transactions.filter(t => t.date.startsWith(monthStr));
      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      return { income, expenses, savings: income - expenses };
    }) : null;

  // Calculate totals and averages
  const yearTotals = monthlyData.reduce((acc, month) => ({
    income: acc.income + month.income,
    expenses: acc.expenses + month.expenses,
    savings: acc.savings + month.savings
  }), { income: 0, expenses: 0, savings: 0 });

  const monthsWithData = monthlyData.filter(m => m.transactionCount > 0).length;
  const averages = monthsWithData > 0 ? {
    income: yearTotals.income / monthsWithData,
    expenses: yearTotals.expenses / monthsWithData,
    savings: yearTotals.savings / monthsWithData
  } : { income: 0, expenses: 0, savings: 0 };

  // Find best and worst months
  const bestSavingsMonth = monthlyData.reduce((best, current) => 
    current.savings > best.savings ? current : best
  );
  const worstSavingsMonth = monthlyData.reduce((worst, current) => 
    current.savings < worst.savings ? current : worst
  );

  const chartTextColor = darkMode ? '#E5E7EB' : '#374151';
  const gridColor = darkMode ? '#374151' : '#E5E7EB';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Monthly Progress Comparison
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your financial progress month by month • Auto-updates monthly
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className={`p-2 rounded-lg border transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            } focus:outline-none`}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year} {year === getCurrentYear() ? '(Current)' : ''}
              </option>
            ))}
          </select>
          {selectedYear === getCurrentYear() && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              darkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600'
            }`}>
              Live
            </span>
          )}
        </div>
      </div>

      {/* Year Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className={`p-6 rounded-lg border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Income
            </span>
          </div>
          <p className={`text-2xl font-bold text-green-600 mb-1`}>
            {formatCurrency(yearTotals.income, 'PKR ')}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Monthly Avg: {formatCurrency(averages.income, 'PKR ')}
          </p>
        </div>

        <div className={`p-6 rounded-lg border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="h-8 w-8 text-red-600" />
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Expenses
            </span>
          </div>
          <p className={`text-2xl font-bold text-red-600 mb-1`}>
            {formatCurrency(yearTotals.expenses, 'PKR ')}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Monthly Avg: {formatCurrency(averages.expenses, 'PKR ')}
          </p>
        </div>

        <div className={`p-6 rounded-lg border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            {yearTotals.savings >= 0 ? (
              <ArrowUpRight className="h-8 w-8 text-green-600" />
            ) : (
              <ArrowDownRight className="h-8 w-8 text-red-600" />
            )}
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Net Savings
            </span>
          </div>
          <p className={`text-2xl font-bold mb-1 ${
            yearTotals.savings >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(yearTotals.savings, 'PKR ')}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Monthly Avg: {formatCurrency(averages.savings, 'PKR ')}
          </p>
        </div>
      </div>

      {/* Best/Worst Months */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <h3 className={`text-lg font-semibold text-green-600`}>
              Best Savings Month
            </h3>
            {bestSavingsMonth.isCurrentMonth && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                This Month!
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {bestSavingsMonth.month}
              </p>
              <p className="text-green-600 font-semibold">
                {formatCurrency(bestSavingsMonth.savings, 'PKR ')}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className={`p-6 rounded-lg border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <h3 className={`text-lg font-semibold text-red-600`}>
              Challenging Month
            </h3>
            {worstSavingsMonth.isCurrentMonth && (
              <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                This Month
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {worstSavingsMonth.month}
              </p>
              <p className="text-red-600 font-semibold">
                {formatCurrency(worstSavingsMonth.savings, 'PKR ')}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Monthly Comparison Chart */}
      <div className={`p-6 rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Monthly Income vs Expenses ({selectedYear})
          </h3>
          {selectedYear === getCurrentYear() && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              Auto-updating
            </span>
          )}
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="month" 
                tick={{ fill: chartTextColor, fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: chartTextColor, fontSize: 12 }}
                tickFormatter={(value) => `PKR ${value}`}
              />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  formatCurrency(value, 'PKR '), 
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
                contentStyle={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  border: `1px solid ${darkMode ? '#4B5563' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: chartTextColor
                }}
              />
              <Bar dataKey="income" fill="#10B981" name="income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#EF4444" name="expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Savings Trend */}
      <div className={`p-6 rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Savings Trend ({selectedYear})
          </h3>
          {selectedYear === getCurrentYear() && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              darkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-600'
            }`}>
              Real-time
            </span>
          )}
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis 
                dataKey="month" 
                tick={{ fill: chartTextColor, fontSize: 12 }}
              />
              <YAxis 
                tick={{ fill: chartTextColor, fontSize: 12 }}
                tickFormatter={(value) => `PKR ${value}`}
              />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value, 'PKR '), 'Savings']}
                contentStyle={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  border: `1px solid ${darkMode ? '#4B5563' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: chartTextColor
                }}
              />
              <Line 
                type="monotone" 
                dataKey="savings" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={(props) => {
                  const isCurrentMonth = monthlyData[props.payload?.monthNumber - 1]?.isCurrentMonth;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={isCurrentMonth ? 6 : 4}
                      fill={isCurrentMonth ? '#10B981' : '#3B82F6'}
                      strokeWidth={2}
                      stroke={isCurrentMonth ? '#10B981' : '#3B82F6'}
                    />
                  );
                }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}