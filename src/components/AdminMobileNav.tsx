import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, Users, Settings, BarChart2 } from 'lucide-react';

const AdminMobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center z-50">
      <button
        onClick={() => navigate('/admin')}
        className={`flex flex-col items-center ${isActive('/admin') ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <Home size={24} />
        <span className="text-xs mt-1">Dashboard</span>
      </button>
      
      <button
        onClick={() => navigate('/admin/create-event')}
        className={`flex flex-col items-center ${isActive('/admin/create') ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <Plus size={24} />
        <span className="text-xs mt-1">Create</span>
      </button>

      <button
        onClick={() => navigate('/admin/users')}
        className={`flex flex-col items-center ${isActive('/admin/users') ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <Users size={24} />
        <span className="text-xs mt-1">Users</span>
      </button>

      <button
        onClick={() => navigate('/admin/analytics')}
        className={`flex flex-col items-center ${isActive('/admin/analytics') ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <BarChart2 size={24} />
        <span className="text-xs mt-1">Analytics</span>
      </button>

      <button
        onClick={() => navigate('/admin/settings')}
        className={`flex flex-col items-center ${isActive('/admin/settings') ? 'text-blue-500' : 'text-gray-500'}`}
      >
        <Settings size={24} />
        <span className="text-xs mt-1">Settings</span>
      </button>
    </nav>
  );
};

export default AdminMobileNav;