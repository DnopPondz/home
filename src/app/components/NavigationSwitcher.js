'use client';

import { usePathname } from 'next/navigation';
import Navbar from './navbar';

export default function NavigationSwitcher() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/page/admin');

  if (isAdminPage) {
    // Avoid rendering the sidebar twice on admin pages (layout already includes it)
    return null;
  }

  // แสดง Navbar ปกติ
  return (
    <div className="font-prompt sticky top-0 z-50">
      <Navbar />
    </div>
  );
}
