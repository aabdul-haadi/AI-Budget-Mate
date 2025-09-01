import React, { useState } from 'react';
import { Moon, Sun, Download, Upload, Trash2, DollarSign, Edit3 } from 'lucide-react';
import { AppSettings } from '../types/transaction';
import { toast } from 'react-toastify';

interface SettingsProps {
  settings: AppSettings;
  userProfile?: any;
  onUpdateSettings: (settings: AppSettings) => void;
  onUpdateUsername?: (username: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateCurrency?: (currency: string, password: string) => Promise<{ success: boolean; error?: string }>;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onExportData: () => void;
  onImportData: (data: any) => void;
  onClearData: () => void;
}

export function Settings({
  settings,
  userProfile,
  onUpdateSettings,
  onUpdateUsername,
  onUpdateCurrency,
  darkMode,
  onToggleDarkMode,
  onExportData,
  onImportData,
  onClearData
}: SettingsProps) {
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(userProfile?.username || '');
  const [showCurrencyConfirm, setShowCurrencyConfirm] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCurrencyChange = (currency: string) => {
    if (userProfile?.currency_changed) {
      toast.error('Currency has already been changed and cannot be modified again.');
      return;
    }

    if (currency === settings.currency) return;

    setSelectedCurrency(currency);
    setShowCurrencyConfirm(true);
  };

  const confirmCurrencyChange = async () => {
    if (!onUpdateCurrency || !password) {
      toast.error('Please enter your password to confirm.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onUpdateCurrency(selectedCurrency, password);
      if (result.success) {
        toast.success(`Currency changed to ${selectedCurrency}. This change is permanent.`);
        setShowCurrencyConfirm(false);
        setPassword('');
      } else {
        toast.error(result.error || 'Failed to update currency');
      }
    } catch (error) {
      toast.error('Failed to update currency');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameUpdate = async () => {
    if (!onUpdateUsername || !newUsername.trim()) {
      toast.error('Please enter a valid username.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onUpdateUsername(newUsername.trim());
      if (result.success) {
        toast.success('Your username has been updated. The next time you can update your username will be after 15 days.');
        setEditingUsername(false);
      } else {
        toast.error(result.error || 'Failed to update username');
      }
    } catch (error) {
      toast.error('Failed to update username');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        onImportData(data);
        toast.success('Data imported successfully!');
      } catch (error) {
        toast.error('Invalid file format. Please select a valid JSON file.');
      }
    };
    reader.readAsText(file);

    // Reset the input
    event.target.value = '';
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      onClearData();
      toast.success('All data cleared successfully!');
    }
  };

  const currencies = [
    { code: 'PKR', name: 'Pakistani Rupee' },
    { code: 'AED', name: 'Dubai Dirham' },
    { code: '$', name: 'US Dollar' },
    { code: '€', name: 'Euro' },
    { code: '£', name: 'British Pound' },
    { code: '₹', name: 'Indian Rupee' },
    { code: 'C$', name: 'Canadian Dollar' },
    { code: 'A$', name: 'Australian Dollar' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Settings
        </h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Customize your budget tracker experience
        </p>
      </div>

      {/* Appearance Settings */}
      <div className={`p-6 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Appearance
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Dark Mode
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Toggle between light and dark themes
              </p>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`p-3 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Settings */}
      <div className={`p-6 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          User Profile
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Username
              </h3>
              {editingUsername ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className={`flex-1 p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none`}
                    placeholder="Enter new username"
                  />
                  <button
                    onClick={handleUsernameUpdate}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded transition-colors"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingUsername(false);
                      setNewUsername(userProfile?.username || '');
                    }}
                    className={`px-4 py-2 rounded border transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {userProfile?.username || 'Not set'}
                </p>
              )}
            </div>
            {!editingUsername && (
              <button
                onClick={() => setEditingUsername(true)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Currency Settings */}
      <div className={`p-6 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Currency
        </h2>

        {userProfile?.currency_changed && (
          <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
              ⚠️ Currency has been permanently changed and cannot be modified again.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Currency
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  disabled={userProfile?.currency_changed}
                  className={`p-3 rounded-lg border text-left transition-colors ${settings.currency === currency.code ? 'bg-blue-500 border-blue-500 text-white' : userProfile?.currency_changed ? 'opacity-50 cursor-not-allowed border-gray-400 text-gray-400' : darkMode ? 'border-gray-600 text-gray-300 hover:border-blue-400 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{currency.code}</div>
                      <div className="text-xs opacity-75">{currency.name}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className={`p-6 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Data Management
        </h2>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onExportData}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>

            <div className="flex-1">
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className={`w-full px-4 py-3 rounded-lg border-2 border-dashed transition-colors cursor-pointer flex items-center justify-center gap-2 ${darkMode ? 'border-gray-600 text-gray-300 hover:border-blue-400 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:border-blue-500 hover:bg-blue-50'}`}
              >
                <Upload className="h-4 w-4" />
                Import Data
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-600">
            <button
              onClick={handleClearAllData}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </button>
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              This will permanently delete all your transactions, budgets, and goals.
            </p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className={`p-6 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          About
        </h2>

        <div className="space-y-2">
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong>Budget Tracker</strong> - A comprehensive personal finance management tool
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Version 1.0.0
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </div>

      {/* Currency Confirmation Modal */}
      {showCurrencyConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full p-6 rounded-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Confirm Currency Change
            </h3>
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to change your currency to {selectedCurrency}? This change will be permanent and cannot be undone. Please verify your password to proceed.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`w-full p-3 rounded border mb-4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'} focus:outline-none`}
            />
            <div className="flex gap-2">
              <button
                onClick={confirmCurrencyChange}
                disabled={isLoading || !password}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded transition-colors"
              >
                {isLoading ? 'Updating...' : 'Confirm Change'}
              </button>
              <button
                onClick={() => {
                  setShowCurrencyConfirm(false);
                  setPassword('');
                  setSelectedCurrency('');
                }}
                className={`flex-1 py-2 px-4 rounded border transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
