"use client"

// pages/admin/dashboard.js หรือ app/admin/dashboard/page.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import NavigationSwitcher from '../../../components/NavigationSwitcher';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalServices: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalTechs: 0,
    totalCustomers: 0,
    loading: true,
    error: null
  });

  const [lastUpdated, setLastUpdated] = useState('');

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

      setDashboardData({
        totalServices: servicesData.length || 0,
        totalBookings: bookingsData.length || 0,
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

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ฟังก์ชันรีเฟรชข้อมูล
  const handleRefresh = () => {
    fetchDashboardData();
  };

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
                  disabled={dashboardData.loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {dashboardData.loading ? 'กำลังโหลด...' : 'รีเฟรช'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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

              {/* Total Bookings */}
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

            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">สรุปข้อมูลระบบ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 font-semibold">บริการ</div>
                  <div className="text-gray-700">มีบริการทั้งหมด {dashboardData.totalServices} รายการ</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-semibold">การจอง</div>
                  <div className="text-gray-700">มีการจองทั้งหมด {dashboardData.totalBookings} ครั้ง</div>
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