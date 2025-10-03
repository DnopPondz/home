"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useMemo, useState } from "react";
import Image from "next/image";
import {
  Home,
  Users,
  Tag,
  Shield,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  Clipboard,
  Star,
  LogOut,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const MENU_ITEMS = [
  {
    icon: Shield,
    label: "Dashboard",
    href: "/page/admin/dashboard",
    roles: ["admin", "tech"],
  },
  {
    icon: Tag,
    label: "My Service",
    href: "/page/admin/myservice",
    roles: ["admin"],
  },
  {
    icon: Bell,
    label: "Service Order & History",
    href: "/page/admin/service",
    roles: ["admin", "tech"],
  },
  {
    icon: Star,
    label: "Customer Review",
    href: "/page/admin/history",
    roles: ["admin", "tech"],
  },
  {
    icon: Users,
    label: "User Management",
    href: "/page/admin/manage",
    roles: ["admin"],
  },
  {
    icon: Clipboard,
    label: "My Employee",
    href: "/page/admin/setting",
    roles: ["admin", "tech"],
  },
];

const normalizeRoles = (role) => {
  if (!role) return [];
  return Array.isArray(role) ? role : [role];
};

const thaiNameFallback = (user) => {
  if (!user) return "";
  if (user.name) return user.name;
  if (user.firstName || user.lastName) {
    return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  }
  return "ผู้ดูแลระบบ";
};

const AdminSidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const availableMenuItems = useMemo(() => {
    const roles = normalizeRoles(user?.role);
    if (roles.length === 0) return [];
    return MENU_ITEMS.filter((item) =>
      item.roles.some((role) => roles.includes(role))
    );
  }, [user?.role]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        logout();
        window.location.replace(data.redirectTo);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside
      className={`relative h-full bg-gradient-to-t from-blue-900 to-blue-950 text-white shadow-xl transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between border-b border-blue-700 p-4">
        <div className="flex items-center space-x-3 rounded-2xl bg-blue-100 p-3 shadow-sm shadow-blue-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 shadow-lg">
            <Home className="h-6 w-6 text-blue-600" aria-hidden="true" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-blue-700">HomeServices</h1>
              <p className="text-xs text-blue-500">Admin Panel</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className={`text-blue-300 transition hover:text-white focus:outline-none focus-visible:ring ${
            collapsed
              ? "absolute right-[-12px] top-4 rounded-full bg-blue-800 p-1 shadow-lg"
              : "rounded-full border border-blue-700 p-1"
          }`}
          aria-label={collapsed ? "เปิดแถบเมนู" : "ย่อแถบเมนู"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-2" aria-label="เมนูผู้ดูแลระบบ">
        {availableMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.href} aria-current={isActive ? "page" : undefined}>
              <div
                className={`flex items-center rounded-lg px-3 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-700 text-white shadow-lg"
                    : "text-blue-100 hover:bg-blue-800/60 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {!collapsed && <span className="ml-3 font-medium">{item.label}</span>}
              </div>
            </Link>
          );
        })}
        {availableMenuItems.length === 0 && (
          <p className="rounded-lg bg-blue-900/60 px-3 py-3 text-sm text-blue-100/80">
            ไม่พบสิทธิ์ในการเข้าถึงเมนู
          </p>
        )}
      </nav>

      <div className="border-t border-blue-800 bg-blue-900/50 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
            <Image
              src={user?.avatar || "/navbar-img/user1.jpg"}
              alt="User Avatar"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-blue-900 bg-emerald-400" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{thaiNameFallback(user)}</p>
              <p className="text-xs text-blue-200">{user?.email}</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-800/60 px-3 py-2 text-sm text-blue-100 transition hover:bg-blue-700 hover:text-white"
          >
            <LogOut size={16} />
            <span>ออกจากระบบ</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;
