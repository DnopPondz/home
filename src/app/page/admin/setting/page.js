"use client"

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Phone, Mail, MapPin, Calendar, Users, Activity } from 'lucide-react';
import axios from 'axios';

const SettingService = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [completedJobs, setCompletedJobs] = useState(0);


useEffect(() => {
  const fetchCompletedJobs = async () => {
    try {
      const res = await axios.get("/api/bookings?status=completed");
      setCompletedJobs(res.data.length);  // สมมติว่า API ส่ง array ของ booking กลับมา
    } catch (error) {
      console.error('ไม่สามารถโหลดข้อมูลงานที่เสร็จได้:', error);
    }
  };

  fetchCompletedJobs();
}, []);

  const serviceOptions = [
    // 'สีทองสีรี',
    // 'ติดผึ้งเพลง', 
    // 'ท่อกวามสอเตอร์ชัน',
    // 'ย้อนแดร์',
    // 'ย้อนแดร์ย้อนร่าง',
    // 'ติดจัดเจเหน็ด',
    // 'ติดจัดเจเล้อลอี',
    // 'ติดจัดเจเร่อง',
    'ไม่มีการกรอง'
  ];

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/users");
        
        // Filter users with role "tech"
        const techUsers = res.data.filter(user => user.role === 'tech');
        setUsers(techUsers);
        setFilteredUsers(techUsers);
      } catch (error) {
        console.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้:', error);
        // showNotification("ไม่สามารถโหลดข้อมูลผู้ใช้ได้", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term and selected services
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    if (selectedServices.length > 0) {
      filtered = filtered.filter(user =>
        user.services && selectedServices.some(service => user.services.includes(service))
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, selectedServices, users]);

  const handleServiceFilter = (service) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลช่าง...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">จัดการข้อมูลช่าง</h1>
          <p className="text-gray-600">รายการช่างทั้งหมด จัดการข้อมูลและบริการของช่าง</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ช่างทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ช่างที่ใช้งาน</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">งานที่เสร็จ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.reduce((sum, user) => sum + (completedJobs || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">★</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length > 0 ? 
                    (users.reduce((sum, user) => sum + (user.rating || 0), 0) / users.length).toFixed(1) : 
                    '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ อีเมล หรือเบอร์โทร..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="h-4 w-4" />
              เพิ่มช่างใหม่
            </button> */}
          </div>

          {/* Service Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">กรองตามบริการ:</h3>
            <div className="flex flex-wrap gap-2">
              {serviceOptions.map(service => (
                <button
                  key={service}
                  onClick={() => handleServiceFilter(service)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedServices.includes(service)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Technicians Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div key={user._id || user.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full overflow-hidden">
                      {user.imageUrl ? (
                        <img 
                          src={user.imageUrl} 
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {user.firstName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{user.firstName} {user.lastName}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ใช้งาน
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {/* <button className="text-blue-600 hover:text-blue-800">
                      <Edit className="h-4 w-4" />
                    </button> */}
                    {/* <button className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                    </button> */}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {user.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {user.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    เข้าร่วมเมื่อ {new Date(user.createdAt).toLocaleDateString('th-TH')}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">บริการที่ให้:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.services && user.services.length > 0 ? (
                      user.services.map((service, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                          {service}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm">ยังไม่มีบริการที่กำหนด</span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">{user.description || 'ยังไม่มีข้อมูลรายละเอียด'}</p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm">
                    <span className="text-gray-600">งานที่เสร็จ: </span>
                    <span className="font-semibold">{user.completedJobs || 0}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">คะแนน: </span>
                    <span className="font-semibold">{user.rating || '5'}</span>
                    {user.rating && (
                      <span className="text-yellow-500 ml-1">{getRatingStars(user.rating)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบช่างที่ตรงกับเงื่อนไขการค้นหา</h3>
            <p className="text-gray-600">ลองเปลี่ยนคำค้นหาหรือเครื่องมือกรองข้อมูล</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingService;