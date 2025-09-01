import React, { useState } from 'react';
import { Plus, Target, Calendar, TrendingUp, Trash2, Edit3 } from 'lucide-react';
import { SavingsGoal } from '../types/transaction';
import { formatCurrency, formatDate } from '../utils/dateUtils';
import { toast } from 'react-toastify';

interface GoalTrackerProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  onDeleteGoal: (id: string) => void;
  darkMode: boolean;
}

interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number; // Changed from targetAmount
  current_amount: number;
  targetDate: string;
  createdAt: string;
}

export function GoalTracker({ goals, onAddGoal, onUpdateGoal, onDeleteGoal, darkMode }: GoalTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    target_amount: '', // Changed from targetAmount
    current_amount: '',
    targetDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.title || !formData.target_amount || !formData.targetDate) {
        toast.error('Please fill in all required fields');
        return;
      }

      const targetAmount = parseFloat(formData.target_amount); // Changed from targetAmount
      const currentAmount = parseFloat(formData.current_amount) || 0;

      if (isNaN(targetAmount) || targetAmount <= 0) {
        toast.error('Please enter a valid target amount greater than 0');
        return;
      }

      if (isNaN(currentAmount) || currentAmount < 0) {
        toast.error('Current amount must be a valid number (0 or greater)');
        return;
      }

      if (currentAmount > targetAmount) {
        toast.error('Current amount cannot be greater than target amount');
        return;
      }

      const targetDate = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (targetDate < today) {
        toast.error('Target date must be today or in the future');
        return;
      }

      if (editingGoal) {
        onUpdateGoal(editingGoal.id, {
          title: formData.title.trim(),
          target_amount: targetAmount, // Changed from targetAmount
          current_amount: currentAmount,
          targetDate: formData.targetDate
        });
        toast.success('Goal updated successfully!');
      } else {
        onAddGoal({
          title: formData.title.trim(),
          target_amount: targetAmount, // Changed from targetAmount
          current_amount: currentAmount,
          targetDate: formData.targetDate
        });
        toast.success('Goal added successfully!');
      }

      resetForm();
    } catch (error) {
      console.error('Goal form error:', error);
      toast.error('An error occurred while saving the goal. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', target_amount: '', current_amount: '', targetDate: '' }); // Changed from targetAmount
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      target_amount: goal.target_amount.toString(), // Changed from targetAmount
      current_amount: goal.current_amount.toString(),
      targetDate: goal.targetDate
    });
    setShowForm(true);
  };

  const handleContribute = (goalId: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) {
        toast.error('Goal not found');
        return;
      }
      
      if (amount <= 0) {
        toast.error('Contribution amount must be greater than 0');
        return;
      }
      
      const newAmount = Math.min(goal.current_amount + amount, goal.target_amount); // Changed from targetAmount
      
      if (newAmount === goal.current_amount) {
        toast.info('Goal is already completed!');
        return;
      }
      
      onUpdateGoal(goalId, { current_amount: newAmount });
      
      if (newAmount >= goal.target_amount) { // Changed from targetAmount
        toast.success(`🎉 Congratulations! You've completed your goal: ${goal.title}!`);
      } else {
        toast.success(`Added ${formatCurrency(amount, 'PKR ')} to ${goal.title}!`);
      }
    } catch (error) {
      console.error('Contribution error:', error);
      toast.error('Failed to add contribution. Please try again.');
    }
  };

  const getProgressPercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate: string): number => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const inputClassName = `w-full p-3 rounded-lg border-2 transition-colors ${
    darkMode 
      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
  } focus:outline-none`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Savings Goals
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Goal
        </button>
      </div>

      {showForm && (
        <div className={`p-6 rounded-lg border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingGoal ? 'Edit Goal' : 'New Savings Goal'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputClassName}
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Target Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.target_amount} // Changed from targetAmount
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })} // Changed from targetAmount
                  className={inputClassName}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.current_amount}
                  onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                  className={inputClassName}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Target Date *
                </label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className={inputClassName}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className={`px-6 py-2 rounded-lg border transition-colors ${
                  darkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {goals.length === 0 ? (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No savings goals yet</p>
          <p className="text-sm">Set your first savings goal to start tracking your progress!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = getProgressPercentage(goal.current_amount, goal.target_amount); // Changed from targetAmount
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const isCompleted = goal.current_amount >= goal.target_amount; // Changed from targetAmount
            
            return (
              <div
                key={goal.id}
                className={`p-6 rounded-lg border ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } ${isCompleted ? 'ring-2 ring-green-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {goal.title}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Target: {formatCurrency(goal.target_amount, 'PKR ')} // Changed from targetAmount
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(goal)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                          : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {formatCurrency(goal.current_amount, 'PKR ')} saved
                    </span>
                    <span className={`font-medium ${
                      isCompleted ? 'text-green-600' : darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className={`w-full h-3 rounded-full ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {daysRemaining > 0 
                          ? `${daysRemaining} days left`
                          : daysRemaining === 0 
                          ? 'Due today'
                          : `${Math.abs(daysRemaining)} days overdue`
                        }
                      </span>
                    </div>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {formatDate(goal.targetDate)}
                    </span>
                  </div>

                  {!isCompleted && (
                    <div className="flex gap-2 pt-2">
                      {[25, 50, 100].map(amount => (
                        <button
                          key={amount}
                          onClick={() => handleContribute(goal.id, amount)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm transition-colors"
                        >
                          +PKR {amount}
                        </button>
                      ))}
                    </div>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium pt-2">
                      <TrendingUp className="h-4 w-4" />
                      Goal Completed! 🎉
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}