"use client";

import React, { useContext, useState, useEffect } from "react";
import {
  Calendar, MapPin, Clock, User, Phone, Mail, Eye, FileText, CheckCircle, XCircle, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { AuthContext } from "@/app/context/AuthContext.js";

const ServiceListPage = () => {
  const { user } = useContext(AuthContext);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!user?._id) {
        console.log("❌ No user ID found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // ✅ ปรับปรุงการจัดการ customerId
        let customerId = user._id;
        
        // จัดการกรณีที่ _id เป็น object หรือ string
        if (typeof customerId === "object") {
          customerId = customerId.$oid || customerId.toString();
        }

        console.log("🔍 Fetching bookings for customerId:", customerId);

        const response = await axios.get(`/api/userbooking?customerId=${customerId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("✅ API Response:", response.data);

        // ✅ ปรับปรุงการกรองข้อมูล
        const bookings = response.data || [];
        const filtered = bookings.filter((booking) => booking.status !== "success");
        
        console.log("📊 Filtered bookings:", filtered);
        setServices(filtered);
      } catch (err) {
        console.error("❌ Error fetching bookings:", err);
        
        // ✅ ปรับปรุงการจัดการ error
        if (err.response?.status === 400) {
          setError("ข้อมูลผู้ใช้ไม่ถูกต้อง");
        } else if (err.response?.status === 500) {
          setError("เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
        } else {
          setError("ไม่สามารถโหลดข้อมูลได้");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [user]);

  const getBookingStats = () => {
    const stats = { pending: 0, inProgress: 0, completed: 0, cancelled: 0 };
    services.forEach((s) => {
      switch (s.status) {
        case "รอดำเนินการ": stats.pending++; break;
        case "กำลังดำเนินการ": stats.inProgress++; break;
        case "เสร็จสิ้น": stats.completed++; break;
        case "ยกเลิก": stats.cancelled++; break;
        default: stats.pending++; break;
      }
    });
    return stats;
  };

  const bookingStats = getBookingStats();

  const getStatusIcon = (status) => {
    switch (status) {
      case "เสร็จสิ้น": return <CheckCircle className="w-4 h-4" />;
      case "กำลังดำเนินการ": return <AlertCircle className="w-4 h-4" />;
      case "ยกเลิก": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (color) => {
    switch (color) {
      case "green": return "bg-green-100 text-green-800";
      case "blue": return "bg-blue-100 text-blue-800";
      case "red": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.name) return user.name;
    return user?.email || "ผู้ใช้งาน";
  };

  const handleViewDetails = (service) => {
    setSelectedService(service);
    setShowDetails(true);
  };

  // ✅ เพิ่ม debug info
  console.log("🔍 Current user:", user);
  console.log("📊 Services count:", services.length);
  console.log("⏳ Loading:", loading);
  console.log("❌ Error:", error);

  return (
    <div className="min-h-screen bg-gray-50">
      {!user ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">กรุณาเข้าสู่ระบบ</h2>
            <p className="text-gray-600">คุณต้องเข้าสู่ระบบเพื่อดูรายการคำสั่งซ่อม</p>
            <Link
              href="/page/login"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-8">
            <div className="container mx-auto px-4">
              <h1 className="text-3xl font-bold text-center">รายการคำสั่งซ่อมของคุณ</h1>
              <p className="text-center mt-2 text-blue-100">
                ดูรายละเอียดการจองของ {getDisplayName()}
              </p>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <div className="lg:w-1/4 space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">เมนูหลัก</h2>
                  <nav className="space-y-2">
                    <Link href="/page/userdata" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                      <User className="w-5 h-5 mr-3" />
                      ข้อมูลผู้ใช้งาน
                    </Link>
                    <Link href="/page/userlist" className="flex items-center px-4 py-3 text-blue-600 bg-blue-50 rounded-lg font-medium">
                      <FileText className="w-5 h-5 mr-3" />
                      รายการคำสั่งซ่อม
                    </Link>
                    <Link href="/page/userhistory" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                      <Clock className="w-5 h-5 mr-3" />
                      ประวัติการซ่อม
                    </Link>
                  </nav>
                </div>

                {/* User Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">ข้อมูลผู้ใช้</h3>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{getDisplayName()}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">ออนไลน์</span>
                  </div>
                </div>

                {/* Booking Stats */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">สถิติการจองของคุณ</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">รอดำเนินการ</span>
                      <span className="font-semibold text-yellow-600">{bookingStats.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">กำลังดำเนินการ</span>
                      <span className="font-semibold text-blue-600">{bookingStats.inProgress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">เสร็จสิ้น</span>
                      <span className="font-semibold text-green-600">{bookingStats.completed}</span>
                    </div>
                    {bookingStats.cancelled > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">ยกเลิก</span>
                        <span className="font-semibold text-red-600">{bookingStats.cancelled}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between">
                        <span className="text-gray-800 font-medium">รวมทั้งหมด</span>
                        <span className="font-bold text-gray-800">{services.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:w-3/4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">เกิดข้อผิดพลาด</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      โหลดใหม่
                    </button>
                  </div>
                ) : showDetails ? (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">รายละเอียดบริการ</h2>
                      <button
                        onClick={() => setShowDetails(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>
                    {selectedService && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริการ</label>
                            <p className="text-gray-800">{selectedService.serviceName}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                            <div className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(selectedService.statusColor || "yellow")}`}>
                              {getStatusIcon(selectedService.status)}
                              <span className="ml-2">{selectedService.status}</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">วันที่บริการ</label>
                            <p className="text-gray-800">{selectedService.bookingDate || "-"}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">เวลา</label>
                            <p className="text-gray-800">{selectedService.bookingTime || "-"}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ราคา</label>
                            <p className="text-gray-800 font-semibold">{selectedService.estimatedPrice} ฿</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ลูกค้า</label>
                            <p className="text-gray-800">{selectedService.customerName || "-"}</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
                          <p className="text-gray-800">{selectedService.customerLocation || "-"}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
                          <p className="text-gray-800">{selectedService.details || selectedService.serviceCategory || "-"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">ไม่มีรายการจอง</h3>
                    <p className="text-gray-600 mb-4">คุณยังไม่มีรายการคำสั่งซ่อมในขณะนี้</p>
                    <Link href="/booking" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      จองบริการ
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {services.map((s) => (
                      <div key={s._id} className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{s.serviceName}</h3>
                            <div className="text-sm text-gray-600 mb-2 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              วันที่บริการ: {s.bookingDate || "-"} เวลา {s.bookingTime || "-"}
                            </div>
                            <div className="text-sm text-gray-600 mb-2 flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {s.customerLocation || "-"}
                            </div>
                            <div className="text-sm text-gray-600 mb-2 flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {s.customerName || "-"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(s.statusColor || "yellow")}`}>
                              {getStatusIcon(s.status)}
                              <span className="ml-2">{s.status}</span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4 flex justify-between items-end">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">รายละเอียด:</p>
                            <p className="text-gray-800">{s.details || s.serviceCategory}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">ราคารวม:</div>
                            <div className="text-2xl font-bold text-gray-800 mb-2">{s.estimatedPrice} ฿</div>
                            <button
                              onClick={() => handleViewDetails(s)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              ดูรายละเอียด
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceListPage;