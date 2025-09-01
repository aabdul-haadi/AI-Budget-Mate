import React from 'react';
import { BarChart3, PlusCircle, Target, FileText, Settings, X, Bot, TrendingUp, Heart } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  darkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeTab, onTabChange, darkMode, isOpen, onClose }: SidebarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'add', label: 'Add Transaction', icon: PlusCircle },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'charity', label: 'Charity', icon: Heart },
    { id: 'comparison', label: 'Monthly Progress', icon: TrendingUp },
    { id: 'advisor', label: 'AI Advisor', icon: Bot },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 z-40 ${
        darkMode 
          ? 'bg-gray-900/95 backdrop-blur-md border-gray-700' 
          : 'bg-white/95 backdrop-blur-md border-gray-200'
      } border-r shadow-xl overflow-y-auto`}>
        <div className="p-6">
          <h2 className={`text-xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Navigation
          </h2>
          
          <nav className="space-y-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                    isActive
                      ? darkMode
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100/80'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-left">{tab.label}</span>
                </button>
              );
            })}
          </nav>
          
          {/* Branding */}
          <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="space-y-2 text-center">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Powered by
              </p>
              <a 
                href="https://samcreative-solutions.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`block text-sm font-semibold transition-colors ${
                  darkMode 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-indigo-600 hover:text-indigo-500'
                }`}
              >
                SAM CREATIVE
              </a>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Developed by Abdul Haadi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-72 z-50 transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        darkMode 
          ? 'bg-gray-900/95 backdrop-blur-md border-gray-700' 
          : 'bg-white/95 backdrop-blur-md border-gray-200'
      } border-r shadow-xl`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Navigation
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-all duration-200 ${
                darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="space-y-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                    isActive
                      ? darkMode
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100/80'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-left">{tab.label}</span>
                </button>
              );
            })}
          </nav>
          
          {/* Branding */}
          <div className={`mt-8 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="space-y-2 text-center">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Powered by
              </p>
              <a 
                href="https://samcreative-solutions.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`block text-sm font-semibold transition-colors ${
                  darkMode 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-indigo-600 hover:text-indigo-500'
                }`}
              >
                SAM CREATIVE
              </a>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Developed by Abdul Haadi
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}