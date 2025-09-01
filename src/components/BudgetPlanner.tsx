import React, { useState } from 'react';
import { Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { Budget, Transaction, EXPENSE_CATEGORIES } from '../types/transaction';
import { formatCurrency } from '../utils/dateUtils';
import { toast } from 'react-toastify';

interface BudgetPlannerProps {
  budgets: Budget;
  transactions: Transaction[];
  onUpdateBudgets: (budgets: Budget) => void;
  darkMode: boolean;
}

export function BudgetPlanner({ budgets, transactions, onUpdateBudgets, darkMode }: BudgetPlannerProps) {
  const [editingBudgets, setEditingBudgets] = useState<Budget>(budgets);

  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM format
  const currentMonthExpenses = transactions.filter(t => 
    t.type === 'expense' && t.date.startsWith(currentMonth)
  );

  const getCategorySpent = (category: string): number => {
    return currentMonthExpenses
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleBudgetChange = (category: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setEditingBudgets(prev => ({ ...prev, [category]: numAmount }));
  };

  const handleSave = () => {
    onUpdateBudgets(editingBudgets);
    toast.success('Budget limits updated successfully!');
  };

  const getProgressPercentage = (spent: number, budget: number): number => {
    if (budget <= 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = (spent: number, budget: number) => {
    if (budget <= 0) return null;
    if (spent >= budget) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    if (spent >= budget * 0.8) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const inputClassName = `w-full p-2 rounded border transition-colors ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
  } focus:outline-none`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Budget Planner
        </h2>
        <button
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Budgets
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EXPENSE_CATEGORIES.map(category => {
          const spent = getCategorySpent(category);
          const budget = editingBudgets[category] || 0;
          const percentage = getProgressPercentage(spent, budget);
          
          return (
            <div
              key={category}
              className={`p-4 rounded-lg border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {category}
                </h3>
                {getStatusIcon(spent, budget)}
              </div>

              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Monthly Budget
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingBudgets[category] || ''}
                    onChange={(e) => handleBudgetChange(category, e.target.value)}
                    className={inputClassName}
                    placeholder="0.00"
                  />
                </div>

                {budget > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Spent: {formatCurrency(spent)}
                      </span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className={`w-full h-2 rounded-full ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div
                        className={`h-full rounded-full transition-all ${getProgressColor(percentage)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="text-sm">
                      {spent >= budget ? (
                        <span className="text-red-500 font-medium">
                          Over budget by {formatCurrency(spent - budget, 'PKR ')}
                        </span>
                      ) : (
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {formatCurrency(budget - spent, 'PKR ')} remaining
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}