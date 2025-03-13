import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { SplashScreenProvider } from './contexts/SplashScreenContext';
import { ToastProvider } from './contexts/ToastContext';
import { WalletProvider } from './contexts/WalletContext';
import { SettingsProvider } from './contexts/SettingsContext';
import DesktopNav from './components/DesktopNav';
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
    <ToastProvider>
      <AuthProvider>
        <WalletProvider>
          <SocketProvider>
            <SettingsProvider>
              <SplashScreenProvider>
                <div className="flex">
                  {!isAuthPage && <DesktopNav />}
                  <main className="flex-1">
                    <Routes>
                      {/* Public routes */}
                      <Route path="/signin" element={<SignIn />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/privacy" element={<Privacy />} />

                      {/* Protected routes */}
                      <Route 
                        path="/events" 
                        element={
                          <ProtectedRoute>
                            <Events />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/wallet" 
                        element={
                          <ProtectedRoute>
                            <Wallet />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/games" element={
                        <ProtectedRoute>
                          <Games />
                        </ProtectedRoute>
                      } />
                      <Route path="/myevents" element={
                        <ProtectedRoute>
                          <MyEvents />
                        </ProtectedRoute>
                      } />
                      <Route path="/challenge/:id" element={
                        <ProtectedRoute>
                          <ChallengeDetails />
                        </ProtectedRoute>
                      } />
                      <Route path="/create" element={
                        <ProtectedRoute>
                          <Create />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings/profile" element={
                        <ProtectedRoute>
                          <ProfileSettings />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                      <Route path="/referral" element={
                        <ProtectedRoute>
                          <Referral />
                        </ProtectedRoute>
                      } />
                      <Route path="/leaderboard" element={
                        <ProtectedRoute>
                          <Leaderboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/messages" element={
                        <ProtectedRoute>
                          <Messages />
                        </ProtectedRoute>
                      } />
                      <Route path="/notifications" element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      } />
                      <Route path="/taxi-share" element={
                        <ProtectedRoute>
                          <TaxiShare />
                        </ProtectedRoute>
                      } />
                      <Route 
                        path="/challenge/:id/chat" 
                        element={
                          <ProtectedRoute>
                            <ChallengeChat />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Redirects */}
                      <Route path="/" element={<Navigate to="/events" replace />} />
                      <Route path="*" element={<Navigate to="/events" replace />} />
                    </Routes>
                    <PWAInstallPrompt />
                  </main>
                </div>
              </SplashScreenProvider>
            </SettingsProvider>
          </SocketProvider>
        </WalletProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
