import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TawkMessenger from '../components/TawkMessenger';
import MobileFooterNav from '../components/MobileFooterNav';

const Help: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1b2e]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="ml-4 text-xl font-bold">Help & Support</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 relative pb-[72px] lg:pb-0">
        <TawkMessenger />
      </div>

      <div className="lg:hidden">
        <MobileFooterNav />
      </div>
    </div>
  );
};

export default Help;
