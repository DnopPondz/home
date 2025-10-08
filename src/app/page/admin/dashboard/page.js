"use client";

// pages/admin/dashboard.js หรือ app/admin/dashboard/page.js
import { useState, useEffect, useCallback } from 'react';
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

  const formatCurrency = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '฿0';
    }

    return value.toLocaleString('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    });
  };

  const formatDateRange = (start, end) => {
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
  };

  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      // เรียก API พร้อมกัน
      const [servicesRes, bookingsRes, usersRes] = await Promise.all([
        axios.get('/api/services'),
        axios.get('/api/bookings'),
        axios.get('/api/users')
      ]);

      // ดึงข้อมูลจาก response
      const servicesData = servicesRes.data;
      const bookingsData = bookingsRes.data;
      const usersData = usersRes.data;

      // กรองข้อมูล users ตาม role
      const techUsers = usersData.filter(user => user.role === 'tech') || [];
      const customerUsers = usersData.filter(user => user.role === 'user') || [];

      // กรองข้อมูลการจองตามสถานะ
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

      // อัปเดต timestamp หลังจากโหลดข้อมูลสำเร็จ
      setLastUpdated(new Date().toLocaleString('th-TH'));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
      }));
    }
  };

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

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    loadSalesData(salesRange);
  }, [salesRange, loadSalesData]);

  // ฟังก์ชันรีเฟรชข้อมูล
  const handleRefresh = () => {
    fetchDashboardData();
    loadSalesData(salesRange);
  };

  const timeRangeOptions = [
    { value: 'week', label: '7 วัน' },
    { value: 'month', label: '1 เดือน' },
    { value: 'year', label: '1 ปี' }
  ];

  const maxRevenue = salesData.services.reduce((max, service) => {
    const revenue = typeof service.totalRevenue === 'number' ? service.totalRevenue : 0;
    return revenue > max ? revenue : max;
  }, 0);

  return (
    <div>
      <NavigationSwitcher />
      
      {/* Main Content */}
      <div className="bg-gray-100 min-h-screen">
        <div className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h2>
                  <p className="text-gray-600">ภาพรวมของระบบจัดการบริการ</p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={dashboardData.loading || salesData.loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {dashboardData.loading || salesData.loading ? 'กำลังโหลด...' : 'รีเฟรช'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {dashboardData.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <p>{dashboardData.error}</p>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {/* Total Services */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">บริการทั้งหมด</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.loading ? '...' : dashboardData.totalServices.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Bookings (Active) */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">การจองทั้งหมด</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.loading ? '...' : dashboardData.totalBookings.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Completed Bookings */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-teal-100 text-teal-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className=" ml-4">
                    <h3 className="text-sm font-medium text-gray-500">การจบงาน</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.loading ? '...' : dashboardData.completedBookings.toLocaleString()}
                    </p>
                    {/* <div className=" space-x-4 mt-2 text-xs">
                      <span className="text-green-600">
                        สำเร็จ: {dashboardData.loading ? '...' : dashboardData.successfulBookings.toLocaleString()}
                      </span>
                      <span className="text-red-600">
                        ยกเลิก: {dashboardData.loading ? '...' : dashboardData.cancelledBookings.toLocaleString()}
                      </span>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Total Users */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">ผู้ใช้ทั้งหมด</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.loading ? '...' : dashboardData.totalUsers.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Techs */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">ช่างทั้งหมด</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.loading ? '...' : dashboardData.totalTechs.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Customers */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">ลูกค้าทั้งหมด</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.loading ? '...' : dashboardData.totalCustomers.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">ยอดขายตามบริการ</h3>
                  <p className="text-sm text-gray-500">
                    {formatDateRange(salesData.startDate, salesData.endDate) || 'เลือกช่วงเวลาที่ต้องการดูยอดขาย'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {timeRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSalesRange(option.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        salesRange === option.value
                          ? 'bg-blue-600 text-white border-blue-600 shadow'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                      }`}
                      disabled={salesData.loading && salesRange === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">ยอดขายรวม</p>
                  <p className="mt-1 text-2xl font-bold text-blue-900">{formatCurrency(salesData.totalRevenue)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">จำนวนคำสั่งจอง</p>
                  <p className="mt-1 text-2xl font-bold text-green-900">{Number(salesData.totalBookings || 0).toLocaleString('th-TH')}</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg md:col-span-1">
                  <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">บริการที่มีคำสั่งจอง</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-900">{salesData.services.length.toLocaleString('th-TH')}</p>
                </div>
              </div>

              <div className="mt-6">
                {salesData.loading ? (
                  <div className="h-56 flex items-center justify-center text-gray-500">กำลังโหลดข้อมูลยอดขาย...</div>
                ) : salesData.error ? (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {salesData.error}
                  </div>
                ) : salesData.services.length === 0 ? (
                  <div className="h-56 flex flex-col items-center justify-center text-gray-500 text-sm">
                    <p>ไม่มีข้อมูลยอดขายในช่วงเวลาที่เลือก</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="flex items-end gap-6 min-h-[14rem] pb-6">
                      {salesData.services.map((service) => {
                        const revenue = typeof service.totalRevenue === 'number' ? service.totalRevenue : 0;
                        const bookingsCount = Number(service.totalBookings || 0);
                        const key = service.serviceId || service.serviceName;
                        const heightPercent = maxRevenue > 0 ? Math.max((revenue / maxRevenue) * 100, revenue > 0 ? 8 : 0) : 0;

                        return (
                          <div key={key} className="flex flex-col items-center flex-1 min-w-[120px]">
                            <span className="text-xs text-gray-500 font-medium mb-2">
                              {formatCurrency(revenue)}
                            </span>
                            <div className="w-full max-w-[120px] h-48 bg-blue-50 rounded-lg relative overflow-hidden">
                              <div className="absolute inset-x-4 bottom-0 flex justify-center">
                                <div
                                  className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 shadow-md"
                                  style={{ height: `${Math.min(heightPercent, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="mt-3 text-center">
                              <p className="text-sm font-semibold text-gray-700 break-words">{service.serviceName || 'ไม่ระบุบริการ'}</p>
                              <p className="text-xs text-gray-500 mt-1">{bookingsCount.toLocaleString('th-TH')} งาน</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">สรุปข้อมูลระบบ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 font-semibold">บริการ</div>
                  <div className="text-gray-700">มีบริการทั้งหมด {dashboardData.totalServices} รายการ</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-semibold">การจอง</div>
                  <div className="text-gray-700">การจองทั้งหมด {dashboardData.totalBookings} ครั้ง</div>
                  <div className="text-xs text-gray-600 mt-1">
                    งานที่รอ {dashboardData.pendingBookings} | รับงานแล้ว {dashboardData.acceptBookings}
                  </div>
                </div>
                <div className="p-4 bg-teal-50 rounded-lg">
                  <div className="text-teal-600 font-semibold">การจบงาน</div>
                  <div className="text-gray-700">จบงานแล้ว {dashboardData.completedBookings} ครั้ง</div>
                  <div className="text-xs text-gray-600 mt-1">
                    สำเร็จ {dashboardData.successfulBookings} | ยกเลิก {dashboardData.cancelledBookings}
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-orange-600 font-semibold">ช่างเทคนิค</div>
                  <div className="text-gray-700">มีช่างทั้งหมด {dashboardData.totalTechs} คน</div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <div className="text-indigo-600 font-semibold">ลูกค้า</div>
                  <div className="text-gray-700">มีลูกค้าทั้งหมด {dashboardData.totalCustomers} คน</div>
                </div>
              </div>
              
              {/* Last Updated Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  {lastUpdated && `อัปเดตล่าสุด: ${lastUpdated}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}