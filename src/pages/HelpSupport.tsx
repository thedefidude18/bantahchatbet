import React from 'react';
import PageHeader from '../components/PageHeader';

// ...existing imports...

const HelpSupport: React.FC = () => {
  // ...existing code...
  return (
    <div className="min-h-screen bg-[#1a1b2e]">
      <PageHeader title="Help & Support" hasBackButton />
      // ...rest of the component...
    </div>
  );
};

export default HelpSupport;