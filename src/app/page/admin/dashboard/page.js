"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import NavigationSwitcher from '../../../components/NavigationSwitcher';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalServices: 0,
    totalBookings: 0,
    completedBookings: 0,
    successfulBookings: 0,
    cancelledBookings: 0,
    pendingBookings: 0,
    acceptBookings: 0,
    totalUsers: 0,
    totalTechs: 0,
    totalCustomers: 0,
    loading: true,
    error: null
  });

  const [lastUpdated, setLastUpdated] = useState('');
  const [salesRange, setSalesRange] = useState('month');
  const [salesData, setSalesData] = useState({
    services: [],
    totalRevenue: 0,
    totalBookings: 0,
    startDate: null,
    endDate: null,
    loading: true,
    error: null
  });

  const formatCurrency = useCallback((value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '฿0';
    }

    return value.toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    });
  }, []);

  const formatDateRange = useCallback((start, end) => {
    if (!start || !end) return '';

    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return '';
    }

    return `${startDate.toLocaleDateString('th-TH', options)} - ${endDate.toLocaleDateString('th-TH', options)}`;
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      const [servicesRes, bookingsRes, usersRes] = await Promise.all([
        axios.get('/api/services'),
        axios.get('/api/bookings'),
        axios.get('/api/users')
      ]);

      const servicesData = servicesRes.data;
      const bookingsData = bookingsRes.data;
      const usersData = usersRes.data;

      const techUsers = usersData.filter(user => user.role === 'tech') || [];
      const customerUsers = usersData.filter(user => user.role === 'user') || [];

      const activeBookings = bookingsData.filter(booking =>
        booking.status !== "completed" && booking.status !== "rejected"
      ) || [];

      const completedBookings = bookingsData.filter(booking =>
        booking.status === "completed" || booking.status === "rejected"
      ) || [];

      const successfulBookings = bookingsData.filter(booking =>
        booking.status === "completed"
      ) || [];

      const cancelledBookings = bookingsData.filter(booking =>
        booking.status === "rejected"
      ) || [];

      const pendingBookings = bookingsData.filter(booking =>
        booking.status === "pending"
      ) || [];

      const acceptBookings = bookingsData.filter(booking =>
        booking.status === "accepted"
      ) || [];

      setDashboardData({
        totalServices: servicesData.length || 0,
        totalBookings: activeBookings.length,
        completedBookings: completedBookings.length,
        successfulBookings: successfulBookings.length,
        cancelledBookings: cancelledBookings.length,
        acceptBookings: acceptBookings.length,
        pendingBookings: pendingBookings.length,
        totalUsers: usersData.length || 0,
        totalTechs: techUsers.length,
        totalCustomers: customerUsers.length,
        loading: false,
        error: null
      });

      setLastUpdated(new Date().toLocaleString('th-TH'));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      }));
    }
  }, []);

  const loadSalesData = useCallback(async (range) => {
    try {
      setSalesData(prev => ({ ...prev, loading: true, error: null }));

      const response = await axios.get('/api/admin/sales', {
        params: { range }
      });

      const {
        services = [],
        totalRevenue = 0,
        totalBookings = 0,
        startDate = null,
        endDate = null
      } = response.data || {};

      setSalesData({
        services,
        totalRevenue,
        totalBookings,
        startDate,
        endDate,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setSalesData(prev => ({
        ...prev,
        loading: false,
        error: 'เกิดข้อผิดพลาดในการโหลดข้อมูลยอดขาย'
      }));
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    loadSalesData(salesRange);
  }, [salesRange, loadSalesData]);

  const handleRefresh = useCallback(() => {
    fetchDashboardData();
    loadSalesData(salesRange);
  }, [fetchDashboardData, loadSalesData, salesRange]);

  const timeRangeOptions = useMemo(() => [
    { value: 'week', label: '7 วัน' },
    { value: 'month', label: '1 เดือน' },
    { value: 'year', label: '1 ปี' }
  ], []);

  const chartPalette = useMemo(
    () => ['#e74c3c', '#f39c12', '#9b59b6', '#27ae60', '#3498db', '#ff6b6b', '#16a085', '#e67e22'],
    []
  );

  const toRgba = useCallback((hex, alpha = 1) => {
    if (typeof hex !== 'string') return `rgba(56, 189, 248, ${alpha})`;

    let sanitized = hex.trim();

    if (sanitized.startsWith('#')) {
      sanitized = sanitized.slice(1);
    }

    if (sanitized.length === 3) {
      sanitized = sanitized
        .split('')
        .map((char) => char + char)
        .join('');
    }

    if (sanitized.length !== 6) {
      return `rgba(56, 189, 248, ${alpha})`;
    }

    const r = parseInt(sanitized.slice(0, 2), 16);
    const g = parseInt(sanitized.slice(2, 4), 16);
    const b = parseInt(sanitized.slice(4, 6), 16);

    if ([r, g, b].some((value) => Number.isNaN(value))) {
      return `rgba(56, 189, 248, ${alpha})`;
    }

    return `rgba(${r}, ${g}, ${b}, ${Math.min(Math.max(alpha, 0), 1)})`;
  }, []);

  const chartMeta = useMemo(() => {
    const numericRevenues = salesData.services.map((service) =>
      typeof service.totalRevenue === 'number' ? service.totalRevenue : 0
    );

    const maxRevenue = numericRevenues.reduce((max, revenue) => (revenue > max ? revenue : max), 0);

    if (maxRevenue <= 0) {
      return { maxRevenue: 0, step: 0, gridLines: [] };
    }

    const divisions = 4;
    const rawStep = maxRevenue / divisions;
    const gridLines = Array.from({ length: divisions + 1 }, (_, index) =>
      index === divisions ? maxRevenue : rawStep * index
    );

    return { maxRevenue, step: rawStep, gridLines };
  }, [salesData.services]);

  const statCards = useMemo(
    () => [
      {
        key: 'totalServices',
        label: 'บริการทั้งหมด',
        accent: 'from-sky-500 to-blue-500',
        value: dashboardData.totalServices,
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        )
      },
      {
        key: 'totalBookings',
        label: 'การจองทั้งหมด',
        accent: 'from-emerald-500 to-teal-500',
        value: dashboardData.totalBookings,
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        )
      },
      {
        key: 'completedBookings',
        label: 'การจบงาน',
        accent: 'from-cyan-500 to-indigo-500',
        value: dashboardData.completedBookings,
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        )
      },
      {
        key: 'totalUsers',
        label: 'ผู้ใช้ทั้งหมด',
        accent: 'from-fuchsia-500 to-purple-500',
        value: dashboardData.totalUsers,
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        )
      },
      {
        key: 'totalTechs',
        label: 'ช่างทั้งหมด',
        accent: 'from-amber-500 to-orange-500',
        value: dashboardData.totalTechs,
        icon: (
          <>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </>
        )
      },
      {
        key: 'totalCustomers',
        label: 'ลูกค้าทั้งหมด',
        accent: 'from-blue-500 to-indigo-500',
        value: dashboardData.totalCustomers,
        icon: (
          <>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </>
        )
      }
    ],
    [dashboardData]
  );

  const insightCards = useMemo(
    () => [
      {
        title: 'งานที่รอดำเนินการ',
        value: dashboardData.pendingBookings,
        description: 'คำสั่งจองที่ต้องติดตาม',
        accent: 'bg-white/70 border border-orange-200/80 text-orange-600'
      },
      {
        title: 'งานที่รับแล้ว',
        value: dashboardData.acceptBookings,
        description: 'ทีมช่างกำลังเตรียมการ',
        accent: 'bg-white/70 border border-teal-200/80 text-teal-600'
      },
      {
        title: 'งานสำเร็จ',
        value: dashboardData.successfulBookings,
        description: 'บริการที่ปิดงานเรียบร้อย',
        accent: 'bg-white/70 border border-blue-200/80 text-blue-600'
      },
      {
        title: 'งานยกเลิก',
        value: dashboardData.cancelledBookings,
        description: 'การจองที่ถูกยกเลิก',
        accent: 'bg-white/70 border border-rose-200/80 text-rose-600'
      }
    ],
    [dashboardData]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800">
      <NavigationSwitcher />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        <header className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur shadow-xl ring-1 ring-slate-200/70">
          <div className="absolute inset-y-0 right-0 w-2/5 bg-gradient-to-l from-blue-400/30 via-indigo-400/20 to-transparent" />
          <div className="relative px-6 py-8 lg:px-10 lg:py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-500 font-semibold">Admin Insight</p>
                <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
                  ภาพรวมการให้บริการทั้งหมดในระบบ
                </h1>
                <p className="mt-4 max-w-xl text-base text-slate-600">
                  ตรวจสอบยอดการจองและรายได้จากแต่ละบริการ พร้อมเลือกดูข้อมูลย้อนหลังตามช่วงเวลาที่ต้องการ
                  เพื่อวางแผนและตัดสินใจได้อย่างมั่นใจ
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={dashboardData.loading || salesData.loading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:shadow-xl disabled:opacity-70"
                >
                  <span>{dashboardData.loading || salesData.loading ? 'กำลังโหลดข้อมูล' : 'รีเฟรชข้อมูล'}</span>
                </button>
                {lastUpdated && (
                  <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-xs text-slate-500">
                    <p className="font-semibold text-slate-700">อัปเดตล่าสุด</p>
                    <p>{lastUpdated}</p>
                  </div>
                )}
              </div>
            </div>

            {dashboardData.error && (
              <div className="mt-6 rounded-2xl border border-rose-200/70 bg-rose-50/80 px-5 py-4 text-sm text-rose-700 shadow-sm">
                <p>{dashboardData.error}</p>
              </div>
            )}
          </div>
        </header>

        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 lg:gap-6">
            {statCards.map((card, index) => (
              <div
                key={card.key}
                className="group relative overflow-hidden rounded-3xl bg-white/80 p-6 shadow-lg shadow-slate-200/60 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-gradient-to-br ${card.accent} blur-3xl`} />
                <div className="relative flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-gradient-to-br from-slate-100 via-white to-white p-3 shadow-inner">
                      <svg className="h-7 w-7 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {card.icon}
                      </svg>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                      {dashboardData.loading ? '…' : Number(card.value || 0).toLocaleString('th-TH')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white/80 p-6 lg:p-10 shadow-lg shadow-slate-200/70 ring-1 ring-slate-100/70">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">ยอดขายตามบริการ</h2>
              <p className="mt-1 text-sm text-slate-500">
                {formatDateRange(salesData.startDate, salesData.endDate) || 'เลือกช่วงเวลาเพื่อดูยอดขายย้อนหลัง'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {timeRangeOptions.map((option) => {
                const isActive = salesRange === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSalesRange(option.value)}
                    disabled={salesData.loading && isActive}
                    className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-blue-200/70 bg-blue-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">ยอดขายรวม</p>
              <p className="mt-3 text-3xl font-bold text-blue-900">{formatCurrency(salesData.totalRevenue)}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">จำนวนคำสั่งจอง</p>
              <p className="mt-3 text-3xl font-bold text-emerald-900">
                {Number(salesData.totalBookings || 0).toLocaleString('th-TH')}
              </p>
            </div>
            <div className="rounded-2xl border border-violet-200/70 bg-violet-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">บริการที่มีคำสั่งจอง</p>
              <p className="mt-3 text-3xl font-bold text-violet-900">
                {salesData.services.length.toLocaleString('th-TH')}
              </p>
            </div>
          </div>

          <div className="mt-10">
            {salesData.loading ? (
              <div className="flex h-72 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 text-sm text-slate-500">
                กำลังโหลดข้อมูลยอดขาย...
              </div>
            ) : salesData.error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                {salesData.error}
              </div>
            ) : salesData.services.length === 0 ? (
              <div className="flex h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 text-sm text-slate-500">
                <p>ไม่มีข้อมูลยอดขายในช่วงเวลาที่เลือก</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-inner">
                    <div className="flex flex-col gap-4">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-indigo-600">ภาพรวมยอดขายบริการ</h3>
                        <p className="text-xs uppercase tracking-widest text-rose-500">จำนวนยอดขาย (บาท)</p>
                      </div>
                      <div className="relative mt-4 grid grid-cols-[60px_minmax(0,1fr)] gap-4">
                        <div className="flex flex-col justify-between py-2 text-right text-xs font-semibold text-slate-400">
                          {chartMeta.gridLines
                            .slice()
                            .reverse()
                            .map((value) => (
                              <span key={`axis-${value}`}>{value === 0 ? '0' : formatCurrency(value).replace('฿', '')}</span>
                            ))}
                        </div>
                        <div className="relative overflow-hidden">
                          <div className="absolute inset-0 flex flex-col justify-between py-2">
                            {chartMeta.gridLines
                              .slice()
                              .reverse()
                              .map((value, index) => (
                                <div
                                  key={`grid-${value}-${index}`}
                                  className={`h-px w-full ${index === chartMeta.gridLines.length - 1 ? 'opacity-0' : 'bg-slate-100'}`}
                                />
                              ))}
                          </div>
                          <div className="relative flex items-end justify-around gap-4 pb-6">
                            {salesData.services.map((service, index) => {
                              const revenue = typeof service.totalRevenue === 'number' ? service.totalRevenue : 0;
                              const bookingsCount = Number(service.totalBookings || 0);
                              const key = service.serviceId || service.serviceName || index;
                              const heightPercent = chartMeta.maxRevenue > 0
                                ? Math.min((revenue / chartMeta.maxRevenue) * 100, 100)
                                : 0;
                              const barColor = chartPalette[index % chartPalette.length];
                              const gradient = `linear-gradient(180deg, ${toRgba(barColor, 0.95)} 0%, ${toRgba(
                                barColor,
                                0.7
                              )} 65%, ${toRgba(barColor, 0.95)} 100%)`;

                              return (
                                <div key={key} className="flex w-36 flex-col items-center gap-3">
                                  <div className="text-xs font-semibold text-slate-500">{formatCurrency(revenue)}</div>
                                  <div className="flex h-48 w-full items-end">
                                    <div
                                      className="relative flex w-full items-end justify-center rounded-t-3xl transition-all duration-300"
                                      style={{ height: `${Math.min(heightPercent, 100)}%` }}
                                    >
                                      <div
                                        className="w-full rounded-t-3xl shadow-lg"
                                        style={{ background: gradient, border: `1px solid ${toRgba(barColor, 0.35)}`, boxShadow: `0 16px 30px -18px ${toRgba(barColor, 0.85)}` }}
                                      />
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm font-semibold text-slate-700 leading-tight break-words">
                                      {service.serviceName || 'ไม่ระบุบริการ'}
                                    </p>
                                    <p className="text-xs text-slate-400">{bookingsCount.toLocaleString('th-TH')} งาน</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 lg:gap-8">
          <div className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-lg shadow-slate-200/70">
            <h3 className="text-xl font-semibold text-slate-900">ภาพรวมสถานะงาน</h3>
            <p className="mt-2 text-sm text-slate-500">สรุปสถานะของการจองทั้งหมดในระบบล่าสุด</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {insightCards.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-2xl p-5 shadow-inner transition-transform duration-200 hover:-translate-y-1 ${item.accent}`}
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-2 text-2xl font-bold">{Number(item.value || 0).toLocaleString('th-TH')}</p>
                  <p className="mt-1 text-xs text-current/80">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 p-6 shadow-xl text-white">
            <h3 className="text-xl font-semibold">ข้อมูลสรุประบบ</h3>
            <p className="mt-2 text-sm text-white/70">
              ใช้ข้อมูลเชิงลึกเพื่อวางแผนทรัพยากรและเตรียมทีมช่างให้พร้อมสำหรับงานในอนาคต
            </p>
            <div className="mt-6 space-y-5 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                <span className="font-medium">จำนวนบริการทั้งหมด</span>
                <span className="font-semibold">{dashboardData.totalServices.toLocaleString('th-TH')}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                <span className="font-medium">การจองทั้งหมด</span>
                <span className="font-semibold">{dashboardData.totalBookings.toLocaleString('th-TH')}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                <span className="font-medium">ทีมช่าง</span>
                <span className="font-semibold">{dashboardData.totalTechs.toLocaleString('th-TH')}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                <span className="font-medium">ลูกค้า</span>
                <span className="font-semibold">{dashboardData.totalCustomers.toLocaleString('th-TH')}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
