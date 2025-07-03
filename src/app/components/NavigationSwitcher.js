'use client';

import { usePathname } from 'next/navigation';
import Navbar from './navbar';
import AdminSidebar from './adminSidebar';

export default function NavigationSwitcher() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/page/admin');

  if (isAdminPage) {
    // แสดง Sidebar ในหน้า Admin
    return (
      <div className="hidden">
        <AdminSidebar />
      </div>
    );
  }

  // แสดง Navbar ปกติ
  return (
    <div className="font-prompt sticky top-0 z-50">
      <Navbar />
    </div>
  );
}
