'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Home, Users, Tag, Shield, Settings, BarChart3, Bell, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Image from 'next/image';

const AdminSidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const pathname = usePathname();

    const [collapsed, setCollapsed] = useState(false); // toggle sidebar

    const menuItems = [
        { icon: Shield, label: 'ADMIN', href: '/page/admin/dashboard' },
        { icon: Users, label: 'USERS', href: '/page/admin/manage' },
        { icon: Tag, label: 'Promotion Code', href: '/page/admin/promotion' },
        { icon: BarChart3, label: 'Analytics', href: '/page/admin/analytics' },
        { icon: Settings, label: 'Settings', href: '/page/admin/settings' }
    ];

 const handleLogout = async () => {
  try {
    const res = await fetch("/api/logout", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      logout(); // ล้าง context
      window.location.replace(data.redirectTo); // replace แทน href
    } else {
      console.error(data.message);
    }
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

    return (
        <div className={`bg-gradient-to-b from-blue-900 to-blue-800 h-full text-white shadow-xl flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
            {/* Header */}
            <div className="p-4 border-b border-blue-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Home className="w-6 h-6 text-white" />
                    </div>
                    {!collapsed && (
                        <div>
                            <h1 className="text-lg font-bold">HomeServices</h1>
                            <p className="text-xs text-blue-300">Admin Panel</p>
                        </div>
                    )}
                </div>
                {/* Toggle Button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-blue-300 hover:text-white transition"
                >
                    {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 mt-6 px-2 space-y-1">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link href={item.href} key={index}>
                            <div
                                className={`
                                    flex items-center px-3 py-3 rounded-lg cursor-pointer transition-all duration-200
                                    ${isActive ? 'bg-blue-700 text-white shadow-lg' : 'text-blue-200 hover:text-white hover:bg-blue-700/50'}
                                `}
                            >
                                <Icon className="w-5 h-5" />
                                {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom User Info */}
            <div className="p-4 border-t border-blue-700 bg-blue-900/50 flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                        <Image
                            src={user?.avatar || '/navbar-img/user1.jpg'}
                            alt="User Avatar"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                    {!collapsed && (
                        <div className="flex-1">
                            <div className="text-sm font-medium text-white">
                                {user?.name || `${user?.firstName} ${user?.lastName}`}
                            </div>
                            <div className="text-xs text-blue-300">{user?.email}</div>
                        </div>
                    )}
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>

                {!collapsed && (
                    <button
                        onClick={handleLogout}
                        className="w-full text-left text-sm text-red-300 hover:text-red-500 transition-colors cursor-pointer"
                    >
                        ออกจากระบบ
                    </button>
                )}
            </div>
        </div>
    );
};

export default AdminSidebar;
