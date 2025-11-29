import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  LayoutDashboard,
  FileText,
  Settings,
  Building,
  Bed,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import UsersManager from './UsersManager';
import ContentManager from './ContentManager';
import PropertyOwnerApprovals from './PropertyOwnerApprovals';
import AdminDashboard from './AdminDashboard';
import StaysManager from './StaysManager';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'users', label: 'Users', icon: <Users className="h-5 w-5" /> },
  { id: 'property-owners', label: 'Property Owners', icon: <Building className="h-5 w-5" /> },
  { id: 'stays', label: 'Stays', icon: <Bed className="h-5 w-5" /> },
  { id: 'content', label: 'Content', icon: <FileText className="h-5 w-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  // Extract the tab from the URL
  const currentPath = location.pathname.split('/').filter(Boolean);
  const activeTab = currentPath.length > 1 ? currentPath[1] : 'dashboard';

  const handleTabChange = (tabId: string) => {
    navigate(`/admin/${tabId}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UsersManager />;
      case 'property-owners':
        return <PropertyOwnerApprovals />;
      case 'stays':
        return <StaysManager />;
      case 'content':
        return <ContentManager />;
      case 'settings':
        return <div>Settings Panel (Coming Soon)</div>;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-xl font-bold text-primary-deep">Admin Panel</h1>
        </div>
        <nav className="mt-4">
          <ul>
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center w-full px-6 py-3 text-left hover:bg-gray-100 ${activeTab === tab.id ? 'bg-primary-50 text-primary-deep font-medium border-r-4 border-primary-deep' : 'text-gray-700'
                    }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight className="ml-auto h-4 w-4" />}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-auto p-6">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 