import React from 'react';
import { useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { SplashScreenProvider } from './contexts/SplashScreenContext';
import { ToastProvider } from './contexts/ToastContext';
import { WalletProvider } from './contexts/WalletContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { SocketProvider } from './contexts/SocketContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AppRouter } from './router/config' ;
import PWAInstallPrompt from './components/PWAInstallPrompt';


// Import pages
import Events from './pages/Events';
import Games from './pages/Games';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Wallet from './pages/Wallet';
import SignIn from './pages/SignIn';
import Create from './pages/Create';
import Referral from './pages/Referral';
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import ChallengeDetails from './pages/ChallengeDetails';
import ProfileSettings from './pages/ProfileSettings';
import MyEvents from './pages/MyEvents';
import Leaderboard from './pages/Leaderboard';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import TaxiShare from './pages/TaxiShare';
import ChallengeChat from './pages/ChallengeChat';

const App: React.FC = () => {
  const location = useLocation();
  const isAuthPage = ['/signin', '/admin/signin'].includes(location.pathname);

  return (
      <SupabaseProvider>
        <AuthProvider>
          <ToastProvider>
            <SettingsProvider>
              <WalletProvider>
                <SocketProvider>
                  <SplashScreenProvider>
                  
                  </SplashScreenProvider>
                </SocketProvider>
              </WalletProvider>
            </SettingsProvider>
          </ToastProvider>
        </AuthProvider>
      </SupabaseProvider>
  );
};
          
export default App;
