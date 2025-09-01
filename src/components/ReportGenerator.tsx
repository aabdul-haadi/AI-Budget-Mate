import React, { useState } from 'react';
import { Download, Calendar, Filter, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Transaction } from '../types/transaction';
import { formatCurrency, formatDate, filterTransactionsByDateRange } from '../utils/dateUtils';
import { exportToPDF } from '../utils/exportToPDF';
import { toast } from 'react-toastify';

interface ReportGeneratorProps {
  transactions: Transaction[];
  darkMode: boolean;
}

export function ReportGenerator({ transactions, darkMode }: ReportGeneratorProps) {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredTransactions = filterTransactionsByDateRange(transactions, dateRange)
    .filter(t => selectedCategory === 'all' || t.category === selectedCategory);

  const categories = [...new Set(transactions.map(t => t.category))];

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = totalIncome - totalExpenses;

  const categoryBreakdown = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
      const filename = `budget-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      await exportToPDF('report-content', filename, {
        title: `Financial Report - ${getRangeLabel()}`,
        subtitle: `Generated on ${new Date().toLocaleDateString('en-PK')} | Currency: PKR`,
        addHeader: true,
        addFooter: true
      });
      toast.success('Report exported successfully!');
    } catch (error) {
      toast.error('Failed to export report. Please try again.');
      console.error('Export error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getRangeLabel = () => {
    switch (dateRange) {
      case 'week': return 'Last 7 Days';
      case 'month': return 'This Month';
      case 'all': return 'All Time';
      default: return 'Selected Period';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Financial Reports
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Generate and export detailed financial reports
          </p>
        </div>
        
        <button
          onClick={handleExportPDF}
          disabled={isGenerating || filteredTransactions.length === 0}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Export PDF'}
        </button>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Report Filters
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Date Range
            </label>
            <div className="flex gap-2">
              {[
                { value: 'week', label: 'Last 7 Days' },
                { value: 'month', label: 'This Month' },
                { value: 'all', label: 'All Time' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value as any)}
                  className={`px-3 py-2 rounded-lg border transition-colors text-sm ${
                    dateRange === option.value
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : darkMode
                      ? 'border-gray-600 text-gray-300 hover:border-blue-400'
                      : 'border-gray-300 text-gray-700 hover:border-blue-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Category Filter
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full p-2 rounded-lg border transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              } focus:outline-none`}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div id="report-content" className={`p-8 rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Financial Report - {getRangeLabel()}
          </h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Generated on {formatDate(new Date())}
          </p>
          {selectedCategory !== 'all' && (
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Category: {selectedCategory}
            </p>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className={`text-center p-6 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Total Income
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome, 'PKR ')}
            </p>
          </div>
          
          <div className={`text-center p-6 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Total Expenses
            </h3>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses, 'PKR ')}
            </p>
          </div>
          
          <div className={`text-center p-6 rounded-lg ${
            darkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <DollarSign className={`h-8 w-8 mx-auto mb-2 ${
              savings >= 0 ? 'text-green-600' : 'text-red-600'
            }`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Net Savings
            </h3>
            <p className={`text-2xl font-bold ${
              savings >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(savings, 'PKR ')}
            </p>
          </div>
        </div>

        {/* Category Breakdown */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Expense Breakdown by Category
            </h3>
            <div className="space-y-3">
              {Object.entries(categoryBreakdown)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                  
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {category}
                          </span>
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatCurrency(amount, 'PKR ')} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${
                          darkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Transaction List */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Transaction Details ({filteredTransactions.length} transactions)
          </h3>
          
          {filteredTransactions.length === 0 ? (
            <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No transactions found for the selected criteria.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date
                    </th>
                    <th className={`text-left py-3 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category
                    </th>
                    <th className={`text-left py-3 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Type
                    </th>
                    <th className={`text-right py-3 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => (
                      <tr
                        key={transaction.id}
                        className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}
                      >
                        <td className={`py-3 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {formatDate(transaction.date)}
                        </td>
                        <td className={`py-3 px-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {transaction.category}
                        </td>
                        <td className={`py-3 px-2`}>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className={`py-3 px-2 text-right font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, 'PKR ')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}