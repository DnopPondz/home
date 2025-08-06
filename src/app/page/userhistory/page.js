"use client";

import React, { useContext, useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { AuthContext } from "@/app/context/AuthContext.js";

const UserHistory = () => {
  const { user } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistoryServices = async () => {
      if (!user?.userId) {
        console.warn("❌ No user ID found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`/api/bookings/user/${user.userId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        let bookings = [];
        if (Array.isArray(response.data)) {
          bookings = response.data;
        } else if (
          response.data.bookings &&
          Array.isArray(response.data.bookings)
        ) {
          bookings = response.data.bookings;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          bookings = response.data.data;
        }

        // แก้ไขส่วนนี้ - ดึงแค่ booking ที่เป็น completed และ rejected เท่านั้น
        const filtered = bookings.filter(
          (booking) =>
            booking.status === "completed" || booking.status === "rejected"
        );
        setServices(filtered);
      } catch (err) {
        if (err.response?.status === 400) {
          setError("ข้อมูลผู้ใช้ไม่ถูกต้อง");
        } else if (err.response?.status === 404) {
          setError("ไม่พบข้อมูลการจอง");
        } else if (err.response?.status === 500) {
          setError("เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
        } else {
          setError("ไม่สามารถโหลดข้อมูลได้");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryServices();
  }, [user]);

  const handleViewDetails = (service) => {
    setSelectedService(service);
    setShowDetails(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
      case "เสร็จสิ้น":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
      case "ยกเลิก":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "เสร็จสิ้น":
        return "bg-green-100 text-green-800";
      case "rejected":
      case "ยกเลิก":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "เสร็จสิ้น";
      case "rejected":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  const filteredServices =
    filterStatus === "all"
      ? services
      : services.filter((service) =>
          filterStatus === "completed"
            ? service.status === "completed" || service.status === "เสร็จสิ้น"
            : service.status === "rejected" || service.status === "ยกเลิก"
        );

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">ประวัติการซ่อม</h1>
          <p className="text-center mt-2 text-blue-100">
            ดูประวัติการใช้บริการที่ผ่านมา
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                เมนูหลัก
              </h2>
              <nav className="space-y-2">
                <Link
                  href="/page/userdata"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  ข้อมูลผู้ใช้งาน
                </Link>
                <Link
                  href="/page/userlist"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  รายการคำสั่งซ่อม
                </Link>
                <Link
                  href="/page/userhistory"
                  className="flex items-center px-4 py-3 text-blue-600 bg-blue-50 rounded-lg font-medium"
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  ประวัติการซ่อม
                </Link>
              </nav>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                สถิติการใช้บริการ
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">เสร็จสิ้น</span>
                  <span className="font-semibold text-green-600">
                    {
                      services.filter(
                        (s) =>
                          s.status === "completed" || s.status === "เสร็จสิ้น"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ยกเลิก</span>
                  <span className="font-semibold text-red-600">
                    {
                      services.filter(
                        (s) => s.status === "rejected" || s.status === "ยกเลิก"
                      ).length
                    }
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">รวมทั้งหมด</span>
                    <span className="font-semibold text-blue-600">
                      {services.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {!showDetails ? (
              <div>
                {/* Filter Tabs */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                      ประวัติการใช้บริการ
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Filter className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilterStatus("all")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filterStatus === "all"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      ทั้งหมด ({services.length})
                    </button>
                    <button
                      onClick={() => setFilterStatus("completed")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filterStatus === "completed"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      เสร็จสิ้น (
                      {
                        services.filter(
                          (s) =>
                            s.status === "completed" || s.status === "เสร็จสิ้น"
                        ).length
                      }
                      )
                    </button>
                    <button
                      onClick={() => setFilterStatus("cancelled")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filterStatus === "cancelled"
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      ยกเลิก (
                      {
                        services.filter(
                          (s) =>
                            s.status === "rejected" || s.status === "ยกเลิก"
                        ).length
                      }
                      )
                    </button>
                  </div>
                </div>

                {/* Service History List */}
                <div className="space-y-6">
                  {loading ? (
                    // Loading State - แสดงแค่ไอคอนหมุน
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                    </div>
                  ) : (
                    filteredServices.map((service, index) => (
                      <div
                        key={service.id || index}
                        className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              {service.serviceName || service.service || "-"}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  วันที่บริการ: {service.bookingDate} เวลา{" "}
                                  {service.serviceTime}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                              <MapPin className="w-4 h-4" />
                              <span>{service.customerLocation}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
                              <User className="w-4 h-4" />
                              <span>ลูกค้า: {service.customerName}</span>
                            </div>
                            {service.rating && (
                              <div className="mb-2">
                                {renderStars(service.rating)}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(
                                service.status
                              )}`}
                            >
                              {getStatusIcon(service.status)}
                              <span>{getStatusText(service.status)}</span>
                            </span>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <p className="text-sm text-gray-600 mb-1">
                                รายการ:
                              </p>
                              <p className="text-gray-800 mb-2">
                                {service.detail}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500 mb-1">
                                ราคารวม:
                              </div>
                              <div className="text-2xl font-bold text-gray-800 mb-3">
                                {service.estimatedPrice}
                              </div>
                              <button
                                onClick={() => handleViewDetails(service)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                              >
                                <Eye className="w-4 h-4" />
                                <span>ดูรายละเอียด</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {!loading && filteredServices.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                      <div className="text-gray-400 mb-4">
                        <FileText className="w-12 h-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        ไม่พบข้อมูล
                      </h3>
                      <p className="text-gray-500">
                        ไม่มีประวัติการใช้บริการในหมวดหมู่นี้
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Service Details View */
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    รายละเอียดประวัติการใช้บริการ
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    ← กลับ
                  </button>
                </div>

                {selectedService && (
                  <div className="space-y-6">
                    {/* Service Info */}
                    <div
                      className={`p-6 rounded-lg ${
                        selectedService.status === "completed" ||
                        selectedService.status === "เสร็จสิ้น"
                          ? "bg-green-50"
                          : "bg-red-50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4
                            className={`font-semibold text-lg ${
                              selectedService.status === "completed" ||
                              selectedService.status === "เสร็จสิ้น"
                                ? "text-green-800"
                                : "text-red-800"
                            }`}
                          >
                            {selectedService.title}
                          </h4>
                          <p
                            className={`${
                              selectedService.status === "completed" ||
                              selectedService.status === "เสร็จสิ้น"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            รหัสคำสั่ง: {selectedService.id}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(
                            selectedService.status
                          )}`}
                        >
                          {getStatusIcon(selectedService.status)}
                          <span>{getStatusText(selectedService.status)}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p
                            className={`text-sm mb-1 ${
                              selectedService.status === "completed" ||
                              selectedService.status === "เสร็จสิ้น"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            วันที่-เวลาบริการ:
                          </p>
                          <p
                            className={`font-medium ${
                              selectedService.status === "completed" ||
                              selectedService.status === "เสร็จสิ้น"
                                ? "text-green-800"
                                : "text-red-800"
                            }`}
                          >
                            {selectedService.bookingDate} เวลา{" "}
                            {selectedService.serviceTime}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`text-sm mb-1 ${
                              selectedService.status === "completed" ||
                              selectedService.status === "เสร็จสิ้น"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            สถานที่:
                          </p>
                          <p
                            className={`font-medium ${
                              selectedService.status === "completed" ||
                              selectedService.status === "เสร็จสิ้น"
                                ? "text-green-800"
                                : "text-red-800"
                            }`}
                          >
                            {selectedService.customerLocation}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>ข้อมูลลูกค้า</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            ชื่อ-นามสกุล:
                          </p>
                          <p className="text-gray-800 font-medium">
                            {selectedService.customerName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            เบอร์โทรศัพท์:
                          </p>
                          <p className="text-gray-800 font-medium flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{selectedService.customerPhone}</span>
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-600 mb-1">อีเมล:</p>
                          <p className="text-gray-800 font-medium flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{selectedService.customerEmail}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>รายละเอียดบริการ</span>
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            รายการงาน:
                          </p>
                          <p className="text-gray-800">
                            {selectedService.details || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            หมายเหตุจากลูกค้า:
                          </p>
                          <p className="text-gray-800">
                            {selectedService.bookingNotes || "-"}
                          </p>
                        </div>
                        {selectedService.technician && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              ช่างผู้ให้บริการ:
                            </p>
                            <p className="text-gray-800">
                              {selectedService.technician}
                            </p>
                          </div>
                        )}
                        {selectedService.cancelReason && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              เหตุผลที่ยกเลิก:
                            </p>
                            <p className="text-red-600">
                              {selectedService.cancelReason}
                            </p>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="text-lg font-semibold text-gray-800">
                            ราคารวม:
                          </span>
                          <span className="text-2xl font-bold text-green-600">
                            {selectedService.estimatedPrice} 
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating and Review */}
                    {selectedService.rating && (
                      <div className="border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-800 mb-4">
                          การประเมินบริการ
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">คะแนน:</p>
                            {renderStars(selectedService.rating)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              ความคิดเห็น:
                            </p>
                            <p className="text-gray-800">
                              {selectedService.review}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <Clock className="w-5 h-5" />
                        <span>ประวัติการดำเนินการ</span>
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              สร้างคำสั่งซ่อม
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedService.createdDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              selectedService.status === "completed" ||
                              selectedService.status === "เสร็จสิ้น"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {selectedService.status === "completed" ||
                              selectedService.status === "เสร็จสิ้น"
                                ? "งานเสร็จสิ้น"
                                : "งานถูกยกเลิก"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {selectedService.status === "completed" ||
                              selectedService.status === "เสร็จสิ้น"
                                ? selectedService.completedDate ||
                                  selectedService.serviceCategory
                                : selectedService.cancelledDate ||
                                  selectedService.serviceCategory}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHistory;
