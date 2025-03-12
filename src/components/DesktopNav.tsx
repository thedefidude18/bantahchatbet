import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { Twitter, Send } from 'lucide-react';

const DesktopNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const menuItems = [
    {
      id: 'events',
      path: '/events',
      icon: <img src="/src/eventssvg.svg" alt="Events Icon" className="w-7 h-7" />,
      label: 'Events',
    },
    {
      id: 'games',
      path: '/games',
      icon: <img src="/src/gamessvg.svg" alt="Games Icon" className="w-8 h-8" />,
      label: 'Challenge',
    },
    {
      id: 'create',
      path: '/create',
      icon: <img src="/src/create.png" alt="Create Icon" className="w-10 h-10" />,
      label: 'Create',
      isMain: true,
    },
    {
      id: 'myevents',
      path: '/myevents',
      icon: <img src="/src/listsvg.svg" alt="My Events Icon" className="w-8 h-8" />,
      label: 'My Events',
    },
    {
      id: 'profile',
      path: '/profile',
      icon: currentUser?.avatar_url ? (
        <img 
          src={currentUser.avatar_url} 
          alt="Profile" 
          className="w-8 h-8 rounded-full object-cover border-2 border-transparent"
          style={{
            borderColor: location.pathname === '/profile' ? '#CCFF00' : 'transparent'
          }}
        />
      ) : (
        <img src="/src/avatar.svg" alt="Profile Icon" className="w-8 h-8" />
      ),
      label: 'Profile',
    },
  ];

  const socialLinks = [
    { 
      icon: (
        <Send className="w-6 h-6" /> // Telegram icon
      ),
      label: 'Telegram', 
      url: 'https://t.me/yourtelegram' 
    },
    { 
      icon: (
        <Twitter className="w-6 h-6" /> // Twitter icon
      ),
      label: 'Twitter', 
      url: 'https://twitter.com/yourtwitter' 
    },
    { 
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-6 h-6"
        >
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      ), // Discord icon
      label: 'Discord', 
      url: 'https://discord.gg/yourdiscord' 
    },
  ];

  return (
    <div className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[240px] bg-light-bg shadow-lg flex-col z-50">
      {/* Logo Section */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8 text-[#CCFF00]" />
          <span className="text-black font-bold text-xl">Bantah</span>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                isActive ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <div className={`${isActive ? 'text-[#CCFF00]' : 'text-white/100'}`}>
                {item.icon}
              </div>
              <span className={`font-medium ${
                isActive ? 'text-[#CCFF00]' : 'text-black/80'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Social Links Section */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex justify-center gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/10 rounded-full transition-all text-white/60 hover:text-white"
              aria-label={social.label}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DesktopNav;
