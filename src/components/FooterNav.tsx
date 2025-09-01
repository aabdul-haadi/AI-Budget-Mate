import React from 'react';
import { BarChart3, PlusCircle, Target, FileText, Settings, Bot, TrendingUp, Heart } from 'lucide-react';

interface FooterNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  darkMode: boolean;
}

export function FooterNav({ activeTab, onTabChange, darkMode }: FooterNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'add', label: 'Add', icon: PlusCircle },
    { id: 'charity', label: 'Charity', icon: Heart },
    { id: 'advisor', label: 'AI', icon: Bot },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 border-t transition-all duration-300 backdrop-blur-md ${
      darkMode 
        ? 'bg-gray-900/95 border-gray-700' 
        : 'bg-white/95 border-gray-200'
    } lg:hidden shadow-lg`}>
      <div className="flex safe-area-pb">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 transition-all duration-200 ${
                isActive
                  ? darkMode
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-indigo-600 bg-indigo-50'
                  : darkMode
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
              <span className="text-xs font-medium truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* Branding for mobile */}
      <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-t-lg text-xs ${
        darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
      }`}>
        <a href="https://samcreative-solutions.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
          SAM CREATIVE
        </a>
      </div>
    </nav>
  );
}