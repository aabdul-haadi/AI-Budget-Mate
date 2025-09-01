import React from 'react';
import { Moon, Sun, User, LogOut, Menu } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: { email?: string; user_metadata?: { full_name?: string } } | null;
  userProfile?: { username?: string } | null;
  onLogout: () => void;
  onTabChange: (tab: string) => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  darkMode, 
  onToggleDarkMode, 
  user, 
  userProfile,
  onLogout,
  onTabChange,
  onToggleSidebar
}) => {
  const getUserDisplayName = () => {
    if (!user) return '';
    
    // Priority: userProfile.username > email prefix > 'User'
    if (userProfile?.username) {
      return userProfile.username;
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  return (
    <nav className={`px-4 py-4 shadow-lg fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md ${
      darkMode 
        ? 'bg-gray-900/95 text-white border-b border-gray-700' 
        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-b border-indigo-500'
    }`}>
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleSidebar}
            className="sm:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-lg">💰</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              BudgetMate
            </h1>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex space-x-1">
          <button 
            onClick={() => onTabChange('dashboard')}
            className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
          >
            Dashboard
          </button>
          <button 
            onClick={() => onTabChange('add')}
            className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
          >
            Add
          </button>
          <button 
            onClick={() => onTabChange('comparison')}
            className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
          >
            Progress
          </button>
          <button 
            onClick={() => onTabChange('advisor')}
            className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
          >
            AI
          </button>
          <button 
            onClick={() => onTabChange('reports')}
            className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
          >
            Reports
          </button>
          <button 
            onClick={() => onTabChange('settings')}
            className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 font-medium"
          >
            Settings
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* User info and logout */}
          {user && (
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-lg bg-white/10">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium truncate max-w-24">
                  {getUserDisplayName()}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg hover:bg-red-500/20 text-red-300 hover:text-red-200 transition-all duration-200"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};