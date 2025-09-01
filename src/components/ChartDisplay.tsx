import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../types/transaction';
import { getMonthYear, formatCurrency } from '../utils/dateUtils';

interface ChartDisplayProps {
  transactions: Transaction[];
  darkMode: boolean;
}

export function ChartDisplay({ transactions, darkMode }: ChartDisplayProps) {
  const expenses = transactions.filter(t => t.type === 'expense');
  
  // Category-wise expenses for pie chart
  const categoryData = expenses.reduce((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // Month-wise expenses for bar chart
  const monthlyData = expenses.reduce((acc, transaction) => {
    const month = getMonthYear(transaction.date);
    acc[month] = (acc[month] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({
      month: month.substring(5) + '/' + month.substring(2, 4), // MM/YY format
      amount
    }));

  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  const chartTextColor = darkMode ? '#E5E7EB' : '#374151';
  const gridColor = darkMode ? '#374151' : '#E5E7EB';

  if (expenses.length === 0) {
    return (
      <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <p>No expense data to display charts</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Pie Chart */}
      <div className={`p-6 rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Expenses by Category
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value, 'PKR '), 'Amount']}
                contentStyle={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  border: `1px solid ${darkMode ? '#4B5563' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: chartTextColor
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className={`p-6 rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Monthly Expenses
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
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
                formatter={(value: any) => [formatCurrency(value, 'PKR '), 'Expenses']}
                contentStyle={{
                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                  border: `1px solid ${darkMode ? '#4B5563' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: chartTextColor
                }}
              />
              <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}