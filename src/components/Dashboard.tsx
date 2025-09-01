import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Heart } from 'lucide-react';
import { Transaction, SavingsGoal } from '../types/transaction';
import { formatCurrency } from '../utils/dateUtils';
import { ChartDisplay } from './ChartDisplay';

interface DashboardProps {
  transactions: Transaction[];
  goals: SavingsGoal[];
  charityDonations?: any[];
  darkMode: boolean;
  onTabChange?: (tab: string) => void;
}

export function Dashboard({ transactions, goals, charityDonations = [], darkMode, onTabChange }: DashboardProps) {
  // Get current month dynamically
  const getCurrentMonth = () => {
    return new Date().toISOString().substring(0, 7); // YYYY-MM format
  };

  const [currentMonth] = useState(getCurrentMonth());  // useState hook here

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = totalIncome - totalExpenses;

  // Filter transactions for current month (auto-updates)
  const monthlyTransactions = transactions.filter(t => {
    const transactionMonth = t.date.substring(0, 7);
    return transactionMonth === getCurrentMonth();
  });
  
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Get month name for display
  const getMonthName = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  const totalGoalAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalGoalProgress = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);

  // Calculate charity (5% of monthly income by default)
  const charityPercentage = 5;
  const suggestedCharity = (monthlyIncome * charityPercentage) / 100;
  
  // Calculate donated amount for current month
  const currentMonthDonations = charityDonations
    .filter(d => d.month_year === getCurrentMonth())
    .reduce((sum, d) => sum + d.amount, 0);
  
  const remainingCharity = Math.max(0, suggestedCharity - currentMonthDonations);

  const stats = [
    {
      title: 'Total Income',
      value: totalIncome,
      monthly: monthlyIncome,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Expenses',
      value: totalExpenses,
      monthly: monthlyExpenses,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Net Savings',
      value: savings,
      monthly: monthlyIncome - monthlyExpenses,
      icon: DollarSign,
      color: savings >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: savings >= 0 ? 'bg-green-100' : 'bg-red-100',
    },
    {
      title: 'Goals Progress',
      value: totalGoalProgress,
      monthly: totalGoalAmount,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      isGoal: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Dashboard
        </h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Overview of your financial status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          
          return (
            <div
              key={stat.title}
              className={`p-4 sm:p-6 rounded-xl border transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:bg-gray-800/70' 
                  : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} shadow-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              
              <h3 className={`text-xs sm:text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.title}
              </h3>
              
              <p className={`text-lg sm:text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stat.isGoal 
                  ? `${formatCurrency(stat.value, 'PKR ')} / ${formatCurrency(stat.monthly, 'PKR ')}`
                  : formatCurrency(stat.value, 'PKR ')
                }
              </p>
              
              {!stat.isGoal && (
                <p className={`text-xs sm:text-sm ${
                  stat.monthly >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(stat.monthly, 'PKR ')} in {getMonthName()}
                </p>
              )}
              
              {stat.isGoal && totalGoalAmount > 0 && (
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {((totalGoalProgress / totalGoalAmount) * 100).toFixed(1)}% complete
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Charity Card */}
      {monthlyIncome > 0 && (
        <div 
          onClick={() => onTabChange?.('charity')}
          className={`p-6 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] bg-gradient-to-r ${
            darkMode 
              ? 'from-green-800/50 to-emerald-800/50 border-green-700 hover:from-green-700/60 hover:to-emerald-700/60 hover:shadow-green-500/20' 
              : 'from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 hover:shadow-green-500/20'
          } group`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500 shadow-lg group-hover:shadow-xl group-hover:bg-green-400 transition-all duration-300">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Monthly Charity (Sadaqah)
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {charityPercentage}% of monthly income • {currentMonthDonations > 0 ? `PKR ${currentMonthDonations.toLocaleString()} donated` : 'No donations yet'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold transition-all duration-300 ${
                remainingCharity === 0 ? 'text-green-600' : 'text-green-600 group-hover:text-green-500'
              }`}>
                {formatCurrency(remainingCharity, 'PKR ')}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {remainingCharity === 0 ? 'Completed! 🎉' : 'Remaining to donate'}
              </p>
            </div>
          </div>
          <div className={`mt-4 p-3 rounded-lg ${
            darkMode ? 'bg-gray-800/50' : 'bg-white/50'
          }`}>
            <p className={`text-sm italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              "Transform your income into blessings — Share your wealth, and watch it multiply with Allah's mercy."
            </p>
          </div>
        </div>
      )}
      {/* Recent Transactions */}
      <div className={`p-4 sm:p-6 rounded-xl border shadow-lg ${
        darkMode 
          ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700' 
          : 'bg-white/80 backdrop-blur-sm border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Transactions
          </h2>
          <span className={`text-sm px-3 py-1 rounded-full ${
            darkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'
          }`}>
            {getMonthName()}
          </span>
        </div>
        
        {transactions.length === 0 ? (
          <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No transactions yet. Add your first transaction to get started!
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {transaction.category}
                    </p>
                    <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold text-sm sm:text-base ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, 'PKR ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts */}
      <ChartDisplay transactions={transactions} darkMode={darkMode} />
    </div>
  );
}
