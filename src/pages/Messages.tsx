import React from 'react';
import PageHeader from '../components/PageHeader';
import MobileFooterNav from '../components/MobileFooterNav';
import ChatList from '../components/ChatList';

const Messages: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1a1b2e]">
      <PageHeader title="Messages" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ChatList />
      </div>

      <MobileFooterNav />
    </div>
  );
};

export default Messages;
