"use client"

import React, { useState } from 'react';
import { Calendar, MapPin, Clock, User, Phone, Mail, Eye, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const ServiceListPage = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Sample service data - bookings that are already made
  const services = [
    {
      id: 'AD04071205',
      title: 'คำสั่งการซ่อมรถ',
      bookingDate: '25/04/2563',
      serviceTime: '13:00 น.',
      location: 'พยาอาม สยาม เซียมอาง',
      details: 'ล้างฝ้า 9:00 - 18:00 BTU, ต้องล้าง 2 เครื่อง',
      price: '1,550.00',
      status: 'รอดำเนินการ',
      statusColor: 'yellow',
      customerName: 'นาย สมชาย ใจดี',
      customerPhone: '081-234-5678',
      customerEmail: 'somchai@email.com',
      bookingNotes: 'ต้องการเริ่มงานเช้า เพราะมีนัดหมายบ่าย',
      createdDate: '23/04/2563 14:30',
      updatedDate: '24/04/2563 09:15'
    },
    {
      id: 'AD04071206',
      title: 'คำสั่งการซ่อมรถ',
      bookingDate: '26/04/2563',
      serviceTime: '14:00 น.',
      location: 'พยาอาม สยาม เซียมอาง',
      details: 'ล้างฝ้า 9:00 - 18:00 BTU, ต้องล้าง 2 เครื่อง',
      price: '1,550.00',
      status: 'รอดำเนินการ',
      statusColor: 'yellow',
      customerName: 'นาง สมหญิง รักดี',
      customerPhone: '082-345-6789',
      customerEmail: 'somying@email.com',
      bookingNotes: 'ติดต่อล่วงหน้า 1 ชั่วโมงก่อนถึง',
      createdDate: '24/04/2563 10:20',
      updatedDate: '25/04/2563 16:45'
    },
    {
      id: 'AD04071207',
      title: 'คำสั่งการซ่อมรถ',
      bookingDate: '27/04/2563',
      serviceTime: '15:00 น.',
      location: 'พยาอาม สยาม เซียมอาง',
      details: 'ล้างฝ้า 9:00 - 18:00 BTU, ต้องล้าง 2 เครื่อง',
      price: '1,550.00',
      status: 'กำลังดำเนินการ',
      statusColor: 'blue',
      customerName: 'นาย วิชัย มั่นใจ',
      customerPhone: '083-456-7890',
      customerEmail: 'wichai@email.com',
      bookingNotes: 'บ้านอยู่ซอย 5 ประตูสีเขียว',
      createdDate: '25/04/2563 11:30',
      updatedDate: '27/04/2563 08:00'
    },
    {
      id: 'AD04071208',
      title: 'คำสั่งการซ่อมรถ',
      bookingDate: '28/04/2563',
      serviceTime: '10:00 น.',
      location: 'พยาอาม สยาม เซียมอาง',
      details: 'ล้างฝ้า 9:00 - 18:00 BTU, ต้องล้าง 2 เครื่อง',
      price: '1,550.00',
      status: 'เสร็จสิ้น',
      statusColor: 'green',
      customerName: 'นาย ประเสริฐ ชัยชนะ',
      customerPhone: '084-567-8901',
      customerEmail: 'prasert@email.com',
      bookingNotes: 'ขอใบเสร็จรับเงินด้วย',
      createdDate: '26/04/2563 16:00',
      updatedDate: '28/04/2563 17:30'
    }
  ];

  const handleViewDetails = (service) => {
    setSelectedService(service);
    setShowDetails(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'เสร็จสิ้น':
        return <CheckCircle className="w-4 h-4" />;
      case 'กำลังดำเนินการ':
        return <AlertCircle className="w-4 h-4" />;
      case 'ยกเลิก':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (statusColor) => {
    switch (statusColor) {
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">รายการคำสั่งซ่อม</h1>
          <p className="text-center mt-2 text-blue-100">ดูรายละเอียดการจองที่มีอยู่</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">เมนูหลัก</h2>
              <nav className="space-y-2">
                <Link
                  href="/page/userdata"
                  className="flex items-center px-4 py-3 text-gray-700  rounded-lg font-medium"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  ข้อมูลผู้ใช้งาน
                </Link>
                <Link
                  href="/page/userlist"
                  className="flex items-center px-4 py-3 text-blue-600 bg-blue-50 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  รายการคำสั่งซ่อม
                </Link>
                <Link
                  href="/page/userhistory"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ประวัติการซ่อม
                </Link>
              </nav>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">สถิติการจอง</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">รอดำเนินการ</span>
                  <span className="font-semibold text-yellow-600">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">กำลังดำเนินการ</span>
                  <span className="font-semibold text-blue-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">เสร็จสิ้น</span>
                  <span className="font-semibold text-green-600">1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {!showDetails ? (
              <div className="space-y-6">
                {services.map((service) => (
                  <div key={service.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {service.title} : {service.id}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>วันที่บริการ: {service.bookingDate} เวลา {service.serviceTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{service.location}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
                          <User className="w-4 h-4" />
                          <span>ลูกค้า: {service.customerName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">สถานะ:</div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(service.statusColor)}`}>
                          {getStatusIcon(service.status)}
                          <span>{service.status}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">รายการ:</p>
                          <p className="text-gray-800 mb-2">{service.details}</p>
                          <p className="text-xs text-gray-500">จองเมื่อ: {service.createdDate}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-1">ราคารวม:</div>
                          <div className="text-2xl font-bold text-gray-800 mb-3">{service.price} ฿</div>
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
                ))}
              </div>
            ) : (
              /* Service Details View */
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">รายละเอียดการจอง</h3>
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
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-blue-800 text-lg">{selectedService.title}</h4>
                          <p className="text-blue-600">รหัสคำสั่ง: {selectedService.id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(selectedService.statusColor)}`}>
                          {getStatusIcon(selectedService.status)}
                          <span>{selectedService.status}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-blue-600 mb-1">วันที่-เวลาบริการ:</p>
                          <p className="text-blue-800 font-medium">{selectedService.bookingDate} เวลา {selectedService.serviceTime}</p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 mb-1">สถานที่:</p>
                          <p className="text-blue-800 font-medium">{selectedService.location}</p>
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
                          <p className="text-sm text-gray-600 mb-1">ชื่อ-นามสกุล:</p>
                          <p className="text-gray-800 font-medium">{selectedService.customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">เบอร์โทรศัพท์:</p>
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
                          <p className="text-sm text-gray-600 mb-1">รายการงาน:</p>
                          <p className="text-gray-800">{selectedService.details}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">หมายเหตุจากลูกค้า:</p>
                          <p className="text-gray-800">{selectedService.bookingNotes}</p>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="text-lg font-semibold text-gray-800">ราคารวม:</span>
                          <span className="text-2xl font-bold text-green-600">{selectedService.price} ฿</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <Clock className="w-5 h-5" />
                        <span>ประวัติการจอง</span>
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">สร้างคำสั่งซ่อม</p>
                            <p className="text-xs text-gray-500">{selectedService.createdDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">อัปเดตข้อมูลล่าสุด</p>
                            <p className="text-xs text-gray-500">{selectedService.updatedDate}</p>
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

export default ServiceListPage;