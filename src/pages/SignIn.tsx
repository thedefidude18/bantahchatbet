import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import backgroundVideo from '../new_background_video.mp4';
import Logo from '../components/Logo';  // Import the Logo component

const SignIn: React.FC = () => {
  const { currentUser, login, signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [isSignIn, setIsSignIn] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const video = document.querySelector('video');
    console.log('Video element:', video);
    console.log('Video source:', backgroundVideo);
    
    if (video) {
      video.addEventListener('loadeddata', () => {
        console.log('Video loaded successfully');
      });
      
      video.addEventListener('error', (e) => {
        console.error('Video loading error:', e);
      });
    }
  }, []);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.showError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.message.includes('Invalid login credentials')) {
        toast.showError('Invalid email or password');
      } else if (error.message.includes('Email not confirmed')) {
        toast.showError('Please verify your email address');
      } else {
        toast.showError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.showError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.showError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      toast.showSuccess('Please check your email to verify your account');
      setIsSignIn(true);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        toast.showError('An account with this email already exists');
      } else {
        toast.showError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleEmailForm = () => {
    setShowEmailForm(!showEmailForm);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-transparent">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 from-25% to-black/80"
        style={{ backgroundImage: 'linear-gradient(to bottom, transparent 25%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.8) 100%)' }}
      ></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 pt-32"> {/* Added pt-32 for top padding */}
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Logo and App name */}
          <div className="flex flex-col items-center mb-8">
            <Logo className="w-24 h-24 mb-4" /> {/* Added Bantah logo */}
            <h1 className="text-5xl font-['Lovely_Cute'] text-white mb-2">Bantah</h1>
            <p className="text-gray-300 mb-12">Real-Time Messaging</p>
          </div>

          {/* Auth options container */}
          <div className="w-full space-y-4"> {/* Increased space-y-3 to space-y-4 */}
            {/* Email login section with dropdown */}
            <div className="w-full max-w-[280px] mx-auto"> {/* Added max-w-[280px] and mx-auto */}
              <button
                onClick={toggleEmailForm}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white py-2.5 px-4 rounded-full font-medium hover:bg-white/20 transition-all flex justify-center items-center text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" />
                </svg>
                Sign in with Email
                <svg 
                  className={`w-4 h-4 ml-2 transition-transform duration-200 ${showEmailForm ? 'rotate-180' : ''}`} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              
              {/* Dropdown email form */}
              <div 
                className={`mt-3 overflow-hidden transition-all duration-300 ease-in-out ${
                  showEmailForm ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <form onSubmit={isSignIn ? handleEmailSignIn : handleSignUp} className="space-y-3">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.trim())}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-white/30 focus:border-white/30 text-white placeholder-white/50 text-sm"
                        placeholder="Email"
                      />
                    </div>

                    <div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-white/30 focus:border-white/30 text-white placeholder-white/50 text-sm"
                        placeholder="Password"
                      />
                    </div>

                    {!isSignIn && (
                      <div>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-white/30 focus:border-white/30 text-white placeholder-white/50 text-sm"
                          placeholder="Confirm Password"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-white/70">
                      <div className="flex items-center">
                        <input type="checkbox" id="remember" className="mr-1" />
                        <label htmlFor="remember">Remember me</label>
                      </div>
                      {isSignIn && (
                        <a href="#" className="text-white hover:text-white/80">Forgot password?</a>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-white/20 hover:bg-white/30 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm backdrop-blur-md"
                    >
                      {loading ? 'Processing...' : isSignIn ? 'Sign In' : 'Sign Up'}
                    </button>
                    
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setIsSignIn(!isSignIn)}
                        className="text-white/70 hover:text-white text-xs font-medium"
                      >
                        {isSignIn ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Social login buttons */}
            <div className="flex justify-center gap-3 mt-3">
              {/* Phone sign in button */}
              <button
                className="p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all border border-white/20"
                aria-label="Sign in with Phone"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
                </svg>
              </button>

              {/* TikTok sign in button */}
              <button
                className="p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all border border-white/20"
                aria-label="Sign in with TikTok"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 015.47 5.82a4.278 4.278 0 008.94 0zM8.9 16.1c-.16-.82-.25-1.65-.25-2.5 0-6.67 4.33-12.08 9.67-12.08S20 6.93 20 13.6c0 6.67-4.33 12.08-9.67 12.08-4.06 0-7.55-3.22-8.91-7.75l-1.4-.79v4.84l4.4-2.53c1.31 3.42 4.24 5.85 7.69 5.85 4.64 0 8.4-4.15 8.4-9.27s-3.76-9.27-8.4-9.27c-2.12 0-4.07.87-5.56 2.27l-1.84-1.84A10.97 10.97 0 014.54 3.3C8.02 3.3 11 5.45 12.22 8.38v7.72z"/>
                </svg>
              </button>

              {/* Facebook sign in button */}
              <button
                className="p-3 bg-[#1877F2] text-white rounded-full hover:bg-[#1865F2] transition-all shadow-md"
                aria-label="Sign in with Facebook"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Terms text */}
          <p className="text-xs text-gray-500 text-center mt-6">
            By tapping Sign In and using Bantah, you agree to our{' '}
            <a href="#" className="text-gray-700 hover:underline">Terms</a> and{' '}
            <a href="#" className="text-gray-700 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

