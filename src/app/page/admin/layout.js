'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/app/components/adminSidebar.js';

const PAGE_META = {
  '/page/admin/dashboard': {
    title: 'แดชบอร์ดภาพรวม',
    description: 'ตรวจสอบสถิติและภาพรวมการให้บริการทั้งหมดแบบเรียลไทม์',
  },
  '/page/admin/myservice': {
    title: 'บริการของฉัน',
    description: 'จัดการบริการที่เปิดให้ลูกค้าเลือกใช้งาน',
  },
  '/page/admin/service': {
    title: 'คำสั่งบริการ',
    description: 'ติดตามสถานะคำสั่งและปรับการดำเนินงานของทีมให้รวดเร็ว',
  },
  '/page/admin/history': {
    title: 'รีวิวลูกค้า',
    description: 'รับฟังความคิดเห็นของลูกค้าเพื่อนำไปพัฒนาบริการ',
  },
  '/page/admin/manage': {
    title: 'จัดการผู้ใช้',
    description: 'บริหารจัดการสิทธิ์และข้อมูลผู้ใช้งานระบบทั้งหมด',
  },
  '/page/admin/setting': {
    title: 'ทีมของฉัน',
    description: 'ดูแลข้อมูลทีมงานและบทบาทของผู้ร่วมงาน',
  },
};

const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const formatSegmentLabel = (segment) =>
  segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const pageMeta = useMemo(() => {
    const normalizedPath = pathname.replace(/\/$/, '');
    return (
      PAGE_META[normalizedPath] || {
        title: 'แดชบอร์ดผู้ดูแลระบบ',
        description: 'จัดการระบบหลังบ้านและดูภาพรวมการให้บริการได้จากที่เดียว',
      }
    );
  }, [pathname]);

  const breadcrumbs = useMemo(() => {
    if (!pathname.startsWith('/page/admin')) return [];

    const segments = pathname.replace('/page/admin', '').split('/').filter(Boolean);
    const crumbs = [
      { label: 'แดชบอร์ด', href: '/page/admin/dashboard' },
    ];

    let currentPath = '/page/admin';
    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      crumbs.push({
        label: formatSegmentLabel(segment),
        href: currentPath,
      });
    });

    return crumbs;
  }, [pathname]);

  const todayLabel = useMemo(() => thaiDateFormatter.format(new Date()), []);

  const lastCrumbIndex = breadcrumbs.length - 1;

  return (
    <div className="h-screen flex bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">พื้นที่ผู้ดูแลระบบ</p>
              <h1 className="text-2xl font-semibold text-slate-900">{pageMeta.title}</h1>
              <p className="mt-1 text-sm text-slate-500 max-w-3xl">{pageMeta.description}</p>
              {breadcrumbs.length > 1 && (
                <nav className="mt-3" aria-label="Breadcrumb">
                  <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
                    {breadcrumbs.map((crumb, index) => {
                      const isLast = index === lastCrumbIndex;
                      return (
                        <li key={crumb.href} className="flex items-center gap-1">
                          {index > 0 && <span className="text-slate-400">/</span>}
                          {isLast ? (
                            <span className="font-medium text-slate-700">{crumb.label}</span>
                          ) : (
                            <a
                              href={crumb.href}
                              className="transition-colors hover:text-blue-600"
                            >
                              {crumb.label}
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </nav>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/60 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                {todayLabel}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
