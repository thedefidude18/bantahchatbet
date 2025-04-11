import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { Twitter, Send, ArrowRight } from 'lucide-react';

const DesktopNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    {
      id: 'events',
      path: '/events',
      icon: <img src="/eventssvg.svg" alt="Events Icon" className="w-7 h-7" />, // Increased icon size
      label: 'Events',
    },
    {
      id: 'games',
      path: '/games',
      icon: <img src="/gamessvg.svg" alt="Games Icon" className="w-8 h-8" />, // Increased icon size
      label: 'Challenge',
    },
    {
      id: 'create',
      path: '/create',
      icon: <img src="/create.png" alt="Create Icon" className="w-10 h-10" />, // Increased icon size
      label: 'Create',
      isMain: true,
    },
    {
      id: 'myevents',
      path: '/myevents',
      icon: <img src="/listsvg.svg" alt="My Events Icon" className="w-8 h-8" />, // Increased icon size
      label: 'My Events',
    },
    {
      id: 'profile',
      path: '/profile',
      icon: currentUser?.avatar_url ? (
        <img
          src={currentUser.avatar_url}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border-2 border-transparent" // Increased avatar size
          style={{
            borderColor: location.pathname === '/profile' ? '#CCFF00' : 'transparent',
          }}
        />
      ) : (
        <img src="/avatar.svg" alt="Profile Icon" className="w-8 h-8" /> // Increased icon size
      ),
      label: 'Profile',
    },
  ];

  const socialLinks = [
    {
      icon: <Send className="w-6 h-6" />, // Increased icon size
      label: 'Telegram',
      url: 'https://t.me/yourtelegram',
    },
    {
      icon: <Twitter className="w-6 h-6" />, // Increased icon size
      label: 'Twitter',
      url: 'https://twitter.com/yourtwitter',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6" // Increased icon size
        >
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      ),
      label: 'Discord',
      url: 'https://discord.gg/yourdiscord',
    },
  ];

  useEffect(() => {
    if (navRef.current) {
      navRef.current.style.width = isMenuOpen ? '220px' : '70px'; // Increased width
    }
  }, [isMenuOpen]);

  return (
    <div
      ref={navRef}
      className="hidden lg:flex fixed left-0 top-0 bottom-0 bg-light-bg border-r border-gray-200 flex-col z-40 items-start transition-all duration-300 ease-in-out overflow-hidden" // items-start for left alignment
      style={{ width: '70px' }} // Initial width
    >
      {/* Logo at the top */}
      <div className="w-full h-[70px] flex items-center justify-center hover:bg-white/10 transition-all"> {/* Increased height */}
        <Logo className="w-8 h-8 text-[#CCFF00]" /> {/* Increased logo size */}
      </div>

      {/* Menu Items with Arrow */}
      <nav className="flex-1 w-full mt-2">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <div key={item.id} className="relative w-full">
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-3 py-3 rounded-xl mb-2 transition-all ${ // Increased padding and margin
                  isActive ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div className={`${isActive ? 'text-[#CCFF00]' : 'text-black/80'}`}>
                  {item.icon}
                </div>
                {isMenuOpen && (
                  <span className={`ml-3 font-medium text-sm ${
                    isActive ? 'text-[#CCFF00]' : 'text-black/80'
                  }`}>
                    {item.label}
                  </span>
                )}
              </button>
              {index === 0 && (
                <button
                  onClick={toggleMenu}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-light-bg hover:bg-white/10 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  style={{ width: '30px', height: '30px', marginRight: '-15px' }}
                >
                  <ArrowRight
                    className={`w-5 h-5 text-black/80 transition-transform duration-300 ${
                      isMenuOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {/* Social Links Section at the very bottom */}
      <div className="px-3 py-3 border-t border-gray-200 mt-auto w-full">
        <div className="flex flex-col items-center gap-3 w-full"> {/* Increased gap */}
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/10 rounded-full transition-all text-black/60 hover:text-black" // Increased padding
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