import React, { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types/transaction';
import { toast } from 'react-toastify';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  darkMode: boolean;
}

export function TransactionForm({ onAddTransaction, darkMode }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    onAddTransaction({
      amount,
      type: formData.type,
      category: formData.category,
      date: formData.date,
      notes: formData.notes
    });

    setFormData({
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });

    toast.success(`${formData.type === 'income' ? 'Income' : 'Expense'} added successfully!`);
  };

  const inputClassName = `w-full p-3 rounded-lg border-2 transition-colors ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
  } focus:outline-none`;

  const selectClassName = `w-full p-3 rounded-lg border-2 transition-colors ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
  } focus:outline-none`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Amount *
          </label>
          <div className="relative">
<span className="absolute left-3 top-3.5 h-5 w-5 text-gray-400">₨</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={`${inputClassName} pl-10`}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Type *
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.type === 'income'
                  ? 'bg-green-500 border-green-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:border-green-400'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-green-500'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.type === 'expense'
                  ? 'bg-red-500 border-red-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:border-red-400'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-red-500'
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className={selectClassName}
            required
          >
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={inputClassName}
            required
          />
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className={`${inputClassName} resize-none`}
          rows={3}
          placeholder="Add any notes or description..."
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="h-5 w-5" />
        Add {formData.type === 'income' ? 'Income' : 'Expense'}
      </button>
    </form>
  );
}