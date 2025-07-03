'use client';

import { usePathname } from 'next/navigation';
import Navbar from './navbar';
import { Home, Users, Tag, Shield, Settings, BarChart3, Bell } from 'lucide-react';

const AdminSidebar = () => {
    const menuItems = [
        { icon: Shield, label: 'ADMIN', active: false },
        { icon: Users, label: 'USERS', active: false },
        { icon: Tag, label: 'Promotion Code', active: true },
        { icon: BarChart3, label: 'Analytics', active: false },
        { icon: Settings, label: 'Settings', active: false }
    ];

    return (
        <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 h-full text-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-blue-700 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Home className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">HomeServices</h1>
                        <p className="text-xs text-blue-300">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 mt-6 px-3">
                <div className="space-y-1">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className="group">
                                <div className={`
                                    flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-200
                                    ${item.active 
                                        ? 'bg-blue-700 text-white shadow-lg' 
                                        : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                                    }
                                `}>
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Stats Section */}
                <div className="mt-8">
                    <div className="bg-blue-800/50 rounded-lg p-4 border border-blue-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-200">Today's Stats</span>
                            <Bell className="w-4 h-4 text-blue-300" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-xs text-blue-300">New Users</span>
                                <span className="text-xs font-semibold text-white">24</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-blue-300">Active Services</span>
                                <span className="text-xs font-semibold text-white">156</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Bottom section */}
            <div className="p-4 border-t border-blue-700 bg-blue-900/50 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-sm font-bold text-white">A</span>
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-white">Admin User</div>
                        <div className="text-xs text-blue-300">Administrator</div>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};

export default function NavigationSwitcher({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/page/admin');

  if (isAdminPage) {
    return (
      <div className="h-screen flex bg-gray-50">
        {/* Sidebar - Fixed width */}
        <AdminSidebar />
        
        {/* Main content area - Takes remaining space */}
        <div className="">
          {/* Content - Scrollable */}
          <main className="">
            <div className="">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // แสดง Navbar ปกติสำหรับหน้าอื่นๆ
  return (
    <div className="">
      <div className="">
        <Navbar />
      </div>
      <main className="">
        {children}
      </main>
    </div>
  );
}