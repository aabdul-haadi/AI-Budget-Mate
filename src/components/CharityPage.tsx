import React, { useState } from 'react';
import { Heart, ArrowLeft, BookOpen, Star } from 'lucide-react';
import { Transaction } from '../types/transaction';
import { formatCurrency } from '../utils/dateUtils';
import { toast } from 'react-toastify';

interface CharityPageProps {
  transactions: Transaction[];
  charityDonations?: any[];
  onAddDonation?: (amount: number) => void;
  darkMode: boolean;
  onGoBack: () => void;
}

export function CharityPage({ transactions, charityDonations = [], onAddDonation, darkMode, onGoBack }: CharityPageProps) {
  const [charityPercentage, setCharityPercentage] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate monthly income
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const suggestedCharity = (monthlyIncome * charityPercentage) / 100;
  
  // Calculate donated amount for current month
  const currentMonthDonations = charityDonations
    .filter(d => d.month_year === currentMonth)
    .reduce((sum, d) => sum + d.amount, 0);
  
  const remainingCharity = Math.max(0, suggestedCharity - currentMonthDonations);
  const customCharityAmount = parseFloat(customAmount) || 0;

  const handleQuickDonation = async (amount: number) => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      if (onAddDonation) {
        await onAddDonation(amount);
      } else {
        toast.success(`Alhamdulillah! PKR ${amount} donation recorded. May Allah accept your charity.`);
      }
    } catch (error) {
      toast.error('Failed to record donation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomDonation = async () => {
    if (isLoading) return;
    
    if (customCharityAmount > 0) {
      setIsLoading(true);
      try {
        if (onAddDonation) {
          await onAddDonation(customCharityAmount);
        } else {
          toast.success(`Alhamdulillah! PKR ${customCharityAmount} donation recorded. May Allah accept your charity.`);
        }
        setCustomAmount('');
      } catch (error) {
        toast.error('Failed to record donation. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Please enter a valid amount');
    }
  };

  const islamicQuotes = [
    {
      text: "The example of those who spend their wealth in the way of Allah is like that of a seed of grain which grows seven ears, each of which contains a hundred grains.",
      source: "Surah Al-Baqarah (2:261)",
      type: "Quran"
    },
    {
      text: "Charity does not decrease wealth, no one forgives another except that Allah increases his honor, and no one humbles himself for the sake of Allah except that Allah raises his status.",
      source: "Sahih Muslim",
      type: "Hadith"
    },
    {
      text: "Give charity without delay, for it stands in the way of calamity.",
      source: "Al-Tirmidhi",
      type: "Hadith"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onGoBack}
          className={`p-2 rounded-lg transition-colors ${
            darkMode
              ? 'text-gray-400 hover:text-white hover:bg-gray-700'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Charity & Donations (Sadaqah)
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Transform your income into blessings — Share your wealth, and watch it multiply with Allah's mercy
          </p>
        </div>
      </div>

      {/* Main Charity Card */}
      <div className={`p-8 rounded-xl border bg-gradient-to-r ${
        darkMode 
          ? 'from-green-800/30 to-emerald-800/30 border-green-700' 
          : 'from-green-50 to-emerald-50 border-green-200'
      }`}>
        <div className="text-center mb-6">
          <div className="p-4 rounded-full bg-green-500 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Monthly Charity Calculation
          </h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Based on your monthly income of {formatCurrency(monthlyIncome, 'PKR ')}
          </p>
        </div>

        {/* Percentage Selector */}
        <div className="mb-6">
          <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Charity Percentage
          </label>
          <div className="flex gap-2 justify-center">
            {[2.5, 5, 10, 15].map(percentage => (
              <button
                key={percentage}
                onClick={() => setCharityPercentage(percentage)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  charityPercentage === percentage
                    ? 'bg-green-500 text-white'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {percentage}%
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Amount */}
        <div className="text-center mb-6">
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {remainingCharity === 0 ? 'Monthly Charity Completed! 🎉' : 'Remaining Monthly Charity'}
          </p>
          <p className="text-4xl font-bold text-green-600 mb-2">
            {formatCurrency(remainingCharity, 'PKR ')}
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {charityPercentage}% of monthly income • PKR {currentMonthDonations.toLocaleString()} donated this month
          </p>
        </div>

        {/* Quick Donation Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[100, 500, 1000].map(amount => (
            <button
              key={amount}
              onClick={() => handleQuickDonation(amount)}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors font-semibold flex items-center justify-center"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                `PKR ${amount}`
              )}
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="flex gap-2">
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Enter custom amount"
            className={`flex-1 p-3 rounded-lg border transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:border-green-400' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
            } focus:outline-none`}
          />
          <button
            onClick={handleCustomDonation}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-semibold flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Donate'
            )}
          </button>
        </div>
      </div>

      {/* Islamic Quotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {islamicQuotes.map((quote, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl border ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              {quote.type === 'Quran' ? (
                <BookOpen className="h-5 w-5 text-green-600" />
              ) : (
                <Star className="h-5 w-5 text-blue-600" />
              )}
              <span className={`text-sm font-medium ${
                quote.type === 'Quran' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {quote.type}
              </span>
            </div>
            <p className={`text-sm mb-4 italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              "{quote.text}"
            </p>
            <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              — {quote.source}
            </p>
          </div>
        ))}
      </div>

      {/* Benefits of Charity */}
      <div className={`p-6 rounded-xl border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Benefits of Regular Charity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className={`font-medium text-green-600`}>Spiritual Benefits</h4>
            <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>• Purifies your wealth and soul</li>
              <li>• Increases Allah's blessings</li>
              <li>• Protection from calamities</li>
              <li>• Reward in the Hereafter</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className={`font-medium text-blue-600`}>Worldly Benefits</h4>
            <ul className={`text-sm space-y-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>• Helps those in need</li>
              <li>• Builds community support</li>
              <li>• Creates positive impact</li>
              <li>• Develops generous character</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}