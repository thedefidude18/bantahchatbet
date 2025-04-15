import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  MessageSquare,
  Wallet,
  LogIn,
  Search,
  ArrowLeft
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { useMessageNotifications } from '../hooks/useMessageNotifications';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useWallet } from '../contexts/WalletContext';
import { formatNaira, formatUSD, convertNGNtoUSD } from '../utils/currency';

interface HeaderProps {
  title?: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
  showSearch?: boolean;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showMenu = true,
  onMenuClick,
  showSearch = false,
  showBackButton = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, login } = useAuth();
  const { unreadCount } = useNotification();
  const { unreadMessages, pendingFriendRequests } = useMessageNotifications();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { wallet } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const balance = wallet?.real_balance || 0;
  const usdEquivalent = convertNGNtoUSD(balance);

  const totalMessageCount = unreadMessages + pendingFriendRequests;

  const formatNumber = (num, currency) => {
    if (num >= 1_000_000) return currency + (num / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
    if (num >= 1_000) return currency + (num / 1_000).toFixed(2).replace(/\.00$/, '') + 'K';
    return currency + num.toFixed(2).replace(/\.00$/, '');
  };

  const shouldHideTitle = () => {
    const noTitlePaths = ['/events', '/games'];
    return noTitlePaths.includes(location.pathname);
  };

  // Check if dark mode is enabled (assuming a 'dark' class on the root element)
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <header className="sticky top-0 z-50 bg-white bg-opacity-95 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Logo always visible on left */}
            <Logo className="w-8 h-8" />
            {/* Conditionally show back button or title on mobile */}
            {isMobile && (
              <div className="flex items-center">
                {showBackButton && (
                  <button onClick={() => navigate(-1)} className="text-white mr-2">
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                )}
                {title && !shouldHideTitle() && (
                  <span className="font-bold text-xl text-white">{title}</span>
                )}
              </div>
            )}
          </div>

          {/* Center Section - Search Bar (Desktop Only) */}
          {showSearch && !isMobile && (
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                {/* Messages */}
                <button
                  onClick={() => handleNavigate('/messages')}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                  aria-label="Messages"
                >
                  <img
                    src="/messages-brutal.svg"
                    alt="messages-brutal"
                    className="h-7 w-7 opacity-80 hover:opacity-100 transition-opacity"
                  />
                  {(unreadMessages + pendingFriendRequests) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                      {unreadMessages + pendingFriendRequests}
                    </span>
                  )}
                </button>

                {/* Leaderboard */}
                <button
                  onClick={() => handleNavigate('/leaderboard')}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                  aria-label="Leaderboard"
                >
                  <img
                    src="/leaderboard_icon.png"
                    alt="Leaderboard"
                    className="h-5 w-5 opacity-80 hover:opacity-100 transition-opacity"
                  />
                </button>

                {/* Notifications */}
                <button
                  onClick={() => handleNavigate('/notifications')}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
                  aria-label="Notifications"
                >
                  <img
                    src="/notify22.svg"
                    alt="Notifications"
                    className="h-7 w-7"
                  />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">{unreadCount}</span>}
                </button>

                {/* Wallet */}
                <button
  onClick={() => handleNavigate('/wallet')}  className="flex items-center gap-1 px-3 py-1.5 bg-[#CCFF00] text-black font-semibold rounded-full hover:bg-[#CCFF00]/80 transition-colors"  aria-label="Wallet" >  <span className="text-sm font-bold">    {formatNumber(balance, '₦')}    <span className="text-[10px] opacity-60 ml-0.5">      ({formatNumber(parseFloat(usdEquivalent), '$')})    </span>  </span></button>
              </>
            ) : (
              <button
                onClick={() => login()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
