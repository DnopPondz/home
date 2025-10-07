"use client"

// pages/admin/dashboard.js หรือ app/admin/dashboard/page.js
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import NavigationSwitcher from '../../../components/NavigationSwitcher';

const normalizeId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value.$oid) return value.$oid;
    if (value.toString && typeof value.toString === 'function') return value.toString();
  }
  return String(value);
};

const parseBookingDate = (booking) => {
  const candidates = [
    booking?.completedAt,
    booking?.completedDate,
    booking?.bookingDate,
    booking?.date,
    booking?.createdAt,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (typeof candidate === 'object') {
      if (candidate.$date) {
        const parsed = new Date(candidate.$date);
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
      if (candidate.seconds) {
        const parsed = new Date(candidate.seconds * 1000);
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }
    }

    if (typeof candidate === 'number') {
      const parsed = new Date(candidate);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    if (typeof candidate === 'string') {
      // Handle DD/MM/YYYY strings commonly used in the admin panels
      const ddMmYyyyMatch = candidate.match(/^(\d{1,2})[\/](\d{1,2})[\/](\d{4})$/);
      if (ddMmYyyyMatch) {
        const [, day, month, year] = ddMmYyyyMatch;
        const parsed = new Date(Number(year), Number(month) - 1, Number(day));
        if (!Number.isNaN(parsed.getTime())) return parsed;
      }

      const parsed = new Date(candidate);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  return null;
};

const parseAmount = (booking) => {
  const candidates = [
    booking?.amount,
    booking?.totalAmount,
    booking?.totalPrice,
    booking?.amountPaid,
    booking?.estimatedPrice,
    booking?.serviceDetails?.price,
    booking?.price,
    booking?.paymentDetails?.amount,
  ];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;

    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }

    if (typeof candidate === 'object') {
      if (typeof candidate.$numberDecimal === 'string') {
        const decimalValue = Number(candidate.$numberDecimal);
        if (!Number.isNaN(decimalValue)) {
          return decimalValue;
        }
      }
      if (candidate.amount && Number.isFinite(Number(candidate.amount))) {
        const nested = Number(candidate.amount);
        if (!Number.isNaN(nested)) return nested;
      }
    }

    const numeric = Number(String(candidate).replace(/[^0-9.-]/g, ''));
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }

  return 0;
};

const normalizeText = (value) =>
  (value || '')
    .toString()
    .trim()
    .toLowerCase();

const inferAmountFromService = (booking, servicesMap) => {
  const serviceId = normalizeId(booking?.serviceId);
  if (!serviceId) return 0;

  const service = servicesMap.get(serviceId);
  if (!service?.priceOptions || !Array.isArray(service.priceOptions)) {
    return 0;
  }

  const bookingPriceOptionId = normalizeId(booking?.priceOptionId);
  const bookingOptionText = normalizeText(
    booking?.selectedOption ||
      booking?.priceOption ||
      booking?.priceLabel ||
      booking?.serviceOption
  );

  const matchedOption = service.priceOptions.find((option) => {
    const optionId = normalizeId(option?._id || option?.id || option?.value);
    if (optionId && bookingPriceOptionId && optionId === bookingPriceOptionId) {
      return true;
    }

    const optionText = normalizeText(
      option?.option || option?.label || option?.name || option?.title
    );
    return Boolean(optionText) && Boolean(bookingOptionText) && optionText === bookingOptionText;
  });

  if (!matchedOption) return 0;

  const optionPrice = Number(
    String(
      matchedOption?.price || matchedOption?.amount || matchedOption?.value
    ).replace(/[^0-9.-]/g, '')
  );

  return Number.isNaN(optionPrice) ? 0 : optionPrice;
};

const formatCurrency = (value) => {
  if (!value || Number.isNaN(Number(value))) return '฿0';
  try {
    return Number(value).toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    });
  } catch (error) {
    return `${Number(value).toLocaleString()} ฿`;
  }
};

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
    totalSales7Days: 0,
    weeklyBookingCount: 0,
    salesByService: [],
    loading: true,
    error: null,
  });

  const [lastUpdated, setLastUpdated] = useState('');

  const fetchDashboardData = async () => {
    try {
      setDashboardData((prev) => ({ ...prev, loading: true, error: null }));

      const [servicesRes, bookingsRes, usersRes] = await Promise.all([
        axios.get('/api/services'),
        axios.get('/api/bookings'),
        axios.get('/api/users'),
      ]);

      const servicesData = servicesRes.data || [];
      const bookingsData = bookingsRes.data || [];
      const usersData = usersRes.data || [];

      const servicesMap = new Map(
        servicesData.map((service) => [normalizeId(service?._id), service])
      );

      const now = new Date();
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 6);

      const techUsers = usersData.filter((user) => user.role === 'tech');
      const customerUsers = usersData.filter((user) => user.role === 'user');

      const activeBookings = bookingsData.filter(
        (booking) => booking.status !== 'completed' && booking.status !== 'rejected'
      );

      const completedBookings = bookingsData.filter(
        (booking) => booking.status === 'completed' || booking.status === 'rejected'
      );

      const successfulBookings = bookingsData.filter(
        (booking) => booking.status === 'completed'
      );

      const cancelledBookings = bookingsData.filter(
        (booking) => booking.status === 'rejected'
      );

      const pendingBookings = bookingsData.filter(
        (booking) => booking.status === 'pending'
      );

      const acceptBookings = bookingsData.filter(
        (booking) => booking.status === 'accepted'
      );

      const weeklySalesMap = new Map();
      let weeklySalesTotal = 0;
      let weeklySalesCount = 0;

      bookingsData.forEach((booking) => {
        if (!booking) return;

        const bookingStatus = (booking.status || '').toLowerCase();
        const paymentStatus = (booking.paymentStatus || '').toLowerCase();

        const statusQualified = [
          'completed',
          'accepted',
          'paid',
          'success',
          'successful',
          'done',
        ].includes(bookingStatus);

        const paymentQualified = [
          'paid',
          'awaiting_verification',
          'cash_on_delivery',
          'completed',
          'success',
        ].includes(paymentStatus);

        if (!statusQualified && !paymentQualified) {
          return;
        }

        const bookingDate = parseBookingDate(booking);
        if (!bookingDate) return;
        if (bookingDate < startDate || bookingDate > now) return;

        const serviceId = normalizeId(booking.serviceId);
        const service = servicesMap.get(serviceId);
        const serviceName =
          booking.serviceName ||
          booking.serviceCategory ||
          service?.name ||
          service?.serviceType ||
          'บริการอื่นๆ';

        const amount = parseAmount(booking) || inferAmountFromService(booking, servicesMap);
        if (!amount || amount <= 0) return;

        weeklySalesTotal += amount;
        weeklySalesCount += 1;

        const current = weeklySalesMap.get(serviceName) || { serviceName, amount: 0, count: 0 };
        current.amount += amount;
        current.count += 1;
        weeklySalesMap.set(serviceName, current);
      });

      const salesByService = Array.from(weeklySalesMap.values()).sort(
        (a, b) => b.amount - a.amount
      );

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
        totalSales7Days: weeklySalesTotal,
        weeklyBookingCount: weeklySalesCount,
        salesByService,
        loading: false,
        error: null,
      });

      setLastUpdated(new Date().toLocaleString('th-TH'));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData((prev) => ({
        ...prev,
        loading: false,
        error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const topSales = useMemo(
    () => dashboardData.salesByService.slice(0, 4),
    [dashboardData.salesByService]
  );

  const maxTopSale = useMemo(() => {
    if (!topSales.length) return 0;
    return Math.max(...topSales.map((sale) => sale.amount));
  }, [topSales]);

  const barColors = [
    'from-blue-500 to-sky-300',
    'from-emerald-500 to-lime-300',
    'from-indigo-500 to-purple-300',
    'from-amber-500 to-orange-300',
  ];

  const statCards = [
    {
      title: 'บริการทั้งหมด',
      value: dashboardData.totalServices,
      description: 'จำนวนบริการที่เปิดให้จอง',
      iconBg: 'bg-blue-100 text-blue-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      title: 'งานที่กำลังดำเนินการ',
      value: dashboardData.totalBookings,
      description: `กำลังติดตาม ${dashboardData.pendingBookings} งาน`,
      iconBg: 'bg-emerald-100 text-emerald-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      title: 'งานที่เสร็จแล้ว',
      value: dashboardData.completedBookings,
      description: `${dashboardData.successfulBookings} งานสำเร็จ • ${dashboardData.cancelledBookings} งานถูกยกเลิก`,
      iconBg: 'bg-teal-100 text-teal-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: 'ยอดขาย 7 วันที่ผ่านมา',
      value: formatCurrency(dashboardData.totalSales7Days),
      description: `${dashboardData.weeklyBookingCount} งานที่มีการชำระเงิน`,
      iconBg: 'bg-amber-100 text-amber-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m-7-6a9 9 0 1118 0 9 9 0 01-18 0z"
          />
        </svg>
      ),
      highlight: true,
    },
    {
      title: 'จำนวนช่างเทคนิค',
      value: dashboardData.totalTechs,
      description: `${dashboardData.acceptBookings} งานที่รับแล้ว`,
      iconBg: 'bg-orange-100 text-orange-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      title: 'จำนวนลูกค้า',
      value: dashboardData.totalCustomers,
      description: `${dashboardData.totalUsers} ผู้ใช้ทั้งหมดในระบบ`,
      iconBg: 'bg-indigo-100 text-indigo-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200">
      <NavigationSwitcher />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col gap-8">
          <div className="bg-white/80 backdrop-blur rounded-3xl border border-slate-100 shadow-sm px-6 py-6 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500">ภาพรวมระบบ</p>
                <h1 className="text-3xl font-bold text-slate-900 mt-1">แดชบอร์ดผู้ดูแลระบบ</h1>
                <p className="text-slate-500 mt-2">
                  จัดการบริการและติดตามยอดขายของคุณได้แบบเรียลไทม์
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-500">
                  {lastUpdated && <span>อัปเดตล่าสุด: {lastUpdated}</span>}
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={dashboardData.loading}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  <svg
                    className={`h-4 w-4 ${dashboardData.loading ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9H4m0 0V4m16 16v-5h-.581m0 0A8.003 8.003 0 014.582 15H4m16 5h-5"
                    />
                  </svg>
                  {dashboardData.loading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}
                </button>
              </div>
            </div>
          </div>

          {dashboardData.error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-red-700">
              <p>{dashboardData.error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {statCards.map((card, index) => (
              <div
                key={card.title}
                className={`relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  card.highlight ? 'ring-2 ring-blue-100' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className={`inline-flex rounded-full ${card.iconBg} p-3`}>{card.icon}</div>
                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                    <p className="text-3xl font-semibold text-slate-900">
                      {dashboardData.loading
                        ? '...'
                        : typeof card.value === 'number'
                          ? card.value.toLocaleString()
                          : card.value}
                    </p>
                    <p className="text-sm text-slate-500">{card.description}</p>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-300">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">ยอดขายย้อนหลัง 7 วัน</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    ดูบริการที่ทำยอดขายสูงสุดในรอบสัปดาห์ พร้อมจำนวนงานที่ปิดได้
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {formatCurrency(dashboardData.totalSales7Days)}
                </span>
              </div>

              {!topSales.length ? (
                <div className="mt-8 flex h-40 flex-col items-center justify-center text-slate-400">
                  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 11V7a4 4 0 018 0v4m-1 10H6a2 2 0 01-2-2V9a2 2 0 012-2h3m2 0h1"
                    />
                  </svg>
                  <p className="mt-2 text-sm">ยังไม่มีข้อมูลยอดขายในช่วง 7 วันที่ผ่านมา</p>
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
                  {topSales.map((service, index) => {
                    const barHeight = maxTopSale ? Math.max((service.amount / maxTopSale) * 100, 12) : 12;
                    const gradient = barColors[index % barColors.length];

                    return (
                      <div key={service.serviceName} className="flex flex-col items-center">
                        <div className="flex h-48 w-full items-end justify-center rounded-3xl bg-slate-100/80 p-3">
                          <div
                            className={`w-3/4 rounded-2xl bg-gradient-to-t ${gradient}`}
                            style={{ height: `${barHeight}%` }}
                          />
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-sm font-semibold text-slate-700 line-clamp-2">
                            {service.serviceName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {service.count.toLocaleString()} งาน • {formatCurrency(service.amount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">สรุปภาพรวม</h2>
              <p className="text-sm text-slate-500 mt-1">
                ตัวเลขสำคัญที่ช่วยให้คุณเห็นภาพรวมการดำเนินงานในตอนนี้
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-blue-50/80 p-4">
                  <p className="text-sm font-medium text-blue-600">บริการทั้งหมด</p>
                  <p className="text-2xl font-semibold text-blue-900 mt-1">
                    {dashboardData.totalServices.toLocaleString()} รายการ
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    เพิ่มบริการใหม่เพื่อขยายโอกาสทางธุรกิจ
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50/80 p-4">
                  <p className="text-sm font-medium text-emerald-600">สถานะงาน</p>
                  <p className="text-sm text-emerald-700 mt-1">
                    รอดำเนินการ {dashboardData.pendingBookings.toLocaleString()} งาน
                  </p>
                  <p className="text-sm text-emerald-700">
                    รับงานแล้ว {dashboardData.acceptBookings.toLocaleString()} งาน
                  </p>
                  <p className="text-sm text-emerald-700">
                    เสร็จสิ้น {dashboardData.successfulBookings.toLocaleString()} งาน
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50/80 p-4">
                  <p className="text-sm font-medium text-amber-600">ลูกค้า & ผู้ใช้</p>
                  <p className="text-sm text-amber-700 mt-1">
                    ลูกค้า {dashboardData.totalCustomers.toLocaleString()} คน
                  </p>
                  <p className="text-sm text-amber-700">
                    ช่างเทคนิค {dashboardData.totalTechs.toLocaleString()} คน
                  </p>
                  <p className="text-xs text-amber-500 mt-2">
                    ทั้งหมด {dashboardData.totalUsers.toLocaleString()} บัญชีที่ใช้งานอยู่
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}