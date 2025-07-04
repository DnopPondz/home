"use client"

import React, { useState } from 'react';
import { Search, Eye, X, Star } from 'lucide-react';

const History = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
    const [showDetailPopup, setShowDetailPopup] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    
    // Mock data for completed/rejected jobs
    const [historyJobs] = useState([
        {
            id: 1,
            customerName: "ลำแสง",
            date: "25/04/2563 เวลา 13:00 น.",
            jobCode: "AD04071205",
            price: "1,550.00 ฿",
            status: "completed",
            jobType: "สำหรับ 9,000 - 18,000 BTU, ติดตั้ง 2 เครื่อง",
            address: "444/4 ถนนโชตนา เขตบางเขน จงอรุณ กรุงเทพ",
            customerPhone: "080 000 1233",
            technician: "ช่าง อินเตอร์เน็ตเพจ",
            rating: 4,
            feedback: "เก่งมากเลยน่าหา พร้อมวิ่งเพราะขาดเปาไฟคลิป"
        },
        {
            id: 2,
            customerName: "ค่าแรงจารวจกันงาน",
            date: "25/04/2563 เวลา 13:00 น.",
            jobCode: "AD04071205",
            price: "1,550.00 ฿",
            status: "completed",
            jobType: "สำหรับ 9,000 - 18,000 BTU, ติดตั้ง 2 เครื่อง",
            address: "444/4 ถนนโชตนา เขตบางเขน จงอรุณ กรุงเทพ",
            customerPhone: "080 000 1233",
            technician: "ช่าง อินเตอร์เน็ตเพจ",
            rating: 5,
            feedback: "บริการดีมาก ทำงานเรียบร้อย"
        },
        {
            id: 3,
            customerName: "ติดตั้งเครื่องปรับอากาศ",
            date: "25/04/2563 เวลา 13:00 น.",
            jobCode: "AD04071205",
            price: "1,550.00 ฿",
            status: "rejected",
            jobType: "สำหรับ 9,000 - 18,000 BTU, ติดตั้ง 2 เครื่อง",
            address: "444/4 ถนนโชตนา เขตบางเขน จงอรุณ กรุงเทพ",
            customerPhone: "080 000 1233",
            technician: "ช่าง อินเตอร์เน็ตเพจ",
            rating: 0,
            feedback: "งานถูกปฏิเสธ"
        },
        {
            id: 4,
            customerName: "ลำแสง",
            date: "25/04/2563 เวลา 13:00 น.",
            jobCode: "AD04071205",
            price: "1,550.00 ฿",
            status: "completed",
            jobType: "สำหรับ 9,000 - 18,000 BTU, ติดตั้ง 2 เครื่อง",
            address: "444/4 ถนนโชตนา เขตบางเขน จงอรุณ กรุงเทพ",
            customerPhone: "080 000 1233",
            technician: "ช่าง อินเตอร์เน็ตเพจ",
            rating: 3,
            feedback: "ทำงานตรงเวลา"
        },
        {
            id: 5,
            customerName: "ลำแสง",
            date: "25/04/2563 เวลา 13:00 น.",
            jobCode: "AD04071205",
            price: "1,550.00 ฿",
            status: "completed",
            jobType: "สำหรับ 9,000 - 18,000 BTU, ติดตั้ง 2 เครื่อง",
            address: "444/4 ถนนโชตนา เขตบางเขน จงอรุณ กรุงเทพ",
            customerPhone: "080 000 1233",
            technician: "ช่าง อินเตอร์เน็ตเพจ",
            rating: 5,
            feedback: "ดีเยี่ยม!"
        },
        {
            id: 6,
            customerName: "ติดตั้งเครื่องปรับอากาศ",
            date: "25/04/2563 เวลา 13:00 น.",
            jobCode: "AD04071205",
            price: "1,550.00 ฿",
            status: "rejected",
            jobType: "สำหรับ 9,000 - 18,000 BTU, ติดตั้ง 2 เครื่อง",
            address: "444/4 ถนนโชตนา เขตบางเขน จงอรุณ กรุงเทพ",
            customerPhone: "080 000 1233",
            technician: "ช่าง อินเตอร์เน็ตเพจ",
            rating: 0,
            feedback: "งานถูกปฏิเสธ"
        },
        {
            id: 7,
            customerName: "ติดตั้งเครื่องปรับอากาศ",
            date: "25/04/2563 เวลา 13:00 น.",
            jobCode: "AD04071205",
            price: "1,550.00 ฿",
            status: "rejected",
            jobType: "สำหรับ 9,000 - 18,000 BTU, ติดตั้ง 2 เครื่อง",
            address: "444/4 ถนนโชตนา เขตบางเขน จงอรุณ กรุงเทพ",
            customerPhone: "080 000 1233",
            technician: "ช่าง อินเตอร์เน็ตเพจ",
            rating: 0,
            feedback: "งานถูกปฏิเสธ"
        },
        {
            id: 8,
            customerName: "ติดตั้งเครื่องปรับอากาศ",
            date: "25/04/2563 เวลา 13:00 น.",
            jobCode: "AD04071205",
            price: "1,550.00 ฿",
            status: "rejected",
            jobType: "สำหรับ 9,000 - 18,000 BTU, ติดตั้ง 2 เครื่อง",
            address: "444/4 ถนนโชตนา เขตบางเขน จงอรุณ กรุงเทพ",
            customerPhone: "080 000 1233",
            technician: "ช่าง อินเตอร์เน็ตเพจ",
            rating: 0,
            feedback: "งานถูกปฏิเสธ"
        },
        {
            id: 9,
            customerName: "ติดตั้งเครื่องปรับอากาศ",
            date: "25/04/2563 เวลา 13:00 น.",
            jobCode: "AD04071205",
            price: "1,550.00 ฿",
            status: "rejected",
            jobType: "สำหรับ 9,000 - 18,000 BTU, ติดตั้ง 2 เครื่อง",
            address: "444/4 ถนนโชตนา เขตบางเขน จงอรุณ กรุงเทพ",
            customerPhone: "080 000 1233",
            technician: "ช่าง อินเตอร์เน็ตเพจ",
            rating: 0,
            feedback: "งานถูกปฏิเสธ"
        }
    ]);

    const filteredJobs = historyJobs.filter(job => {
        const matchesSearch = job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.jobCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ทั้งหมด' || 
                            (filterStatus === 'เสร็จแล้ว' && job.status === 'completed') ||
                            (filterStatus === 'ปฏิเสธ' && job.status === 'rejected');
        return matchesSearch && matchesFilter;
    });

    const getStatusText = (status) => {
        return status === 'completed' ? 'เสร็จแล้ว' : 'ปฏิเสธ';
    };

    const getStatusColor = (status) => {
        return status === 'completed' ? 'text-green-600' : 'text-red-600';
    };

    const handleViewJob = (job) => {
        setSelectedJob(job);
        setShowDetailPopup(true);
    };

    const closeDetailPopup = () => {
        setShowDetailPopup(false);
        setSelectedJob(null);
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`w-4 h-4 ${
                    index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
            />
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <h1 className="text-xl font-semibold text-gray-800">ประวัติการล่วง</h1>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="ค้นหาจากการล่วงหาชื่อ"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ทั้งหมด">ทั้งหมด</option>
                        <option value="เสร็จแล้ว">เสร็จแล้ว</option>
                        <option value="ปฏิเสธ">ปฏิเสธ</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">ชื่อลูกค้า</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">วันเวลาที่ดำเนินการ</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">รหัสคำสั่งซื้อ</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">ราคารวม</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">สถานะ</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredJobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{job.customerName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{job.date}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{job.jobCode}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{job.price}</td>
                                        <td className={`px-6 py-4 text-sm font-medium ${getStatusColor(job.status)}`}>
                                            {getStatusText(job.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <button 
                                                onClick={() => handleViewJob(job)}
                                                className="text-blue-600 hover:text-blue-800 flex items-center"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                ดู
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Empty State */}
                {filteredJobs.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-500">
                            <div className="text-lg font-medium mb-2">ไม่พบข้อมูล</div>
                            <div className="text-sm">ไม่มีประวัติการทำงานที่ตรงกับการค้นหา</div>
                        </div>
                    </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <div className="text-2xl font-bold text-gray-800">
                            {historyJobs.length}
                        </div>
                        <div className="text-sm text-gray-600">งานทั้งหมด</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {historyJobs.filter(job => job.status === 'completed').length}
                        </div>
                        <div className="text-sm text-gray-600">งานที่เสร็จแล้ว</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <div className="text-2xl font-bold text-red-600">
                            {historyJobs.filter(job => job.status === 'rejected').length}
                        </div>
                        <div className="text-sm text-gray-600">งานที่ปฏิเสธ</div>
                    </div>
                </div>
            </div>

            {/* Job Detail Popup */}
            {showDetailPopup && selectedJob && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm  flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
                        <button 
                            onClick={closeDetailPopup}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="mb-6 mt-5 ">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">สำเนาอร์</h3>
                                <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    {selectedJob.status === 'completed' ? 'เสร็จสิ้น' : 'ถูกปฏิเสธ'}
                                </span>
                            </div>
                            
                            <div className="space-y-3 text-sm">
                                <div className="flex">
                                    <span className="text-gray-600 w-24 flex-shrink-0">ชื่อลูกค้า:</span>
                                    <span className="text-gray-800">{selectedJob.customerName}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-24 flex-shrink-0">งานขอร้อง:</span>
                                    <span className="text-gray-800">{selectedJob.jobType}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-24 flex-shrink-0">วันเวลาที่ต้องการ:</span>
                                    <span className="text-gray-800">{selectedJob.date}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-24 flex-shrink-0">สถานที่:</span>
                                    <span className="text-gray-800">{selectedJob.address}</span>
                                    <button className="text-blue-600 text-xs ml-1">
                                        🔗 ดูแผนที่
                                    </button>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-24 flex-shrink-0">รหัสคำสั่งซื้อ:</span>
                                    <span className="text-gray-800">{selectedJob.jobCode}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-24 flex-shrink-0">ราคารวม:</span>
                                    <span className="text-gray-800 font-semibold">{selectedJob.price}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-24 flex-shrink-0">ผู้ใช้บริการ:</span>
                                    <span className="text-gray-800">{selectedJob.technician}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-24 flex-shrink-0">เบอร์ติดต่อ:</span>
                                    <span className="text-gray-800">{selectedJob.customerPhone}</span>
                                </div>
                            </div>
                        </div>
                        
                        {selectedJob.status === 'completed' && (
                            <div className="border-t pt-4">
                                <div className="mb-3">
                                    <span className="text-sm text-gray-600">คะแนนความพึงพอใจ:</span>
                                    <div className="flex items-center mt-1">
                                        {renderStars(selectedJob.rating)}
                                        <span className="ml-2 text-sm text-gray-600">({selectedJob.rating}/5)</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600">ความคิดเห็นจากลูกค้า:</span>
                                    <p className="text-sm text-gray-800 mt-1 bg-gray-50 p-2 rounded">
                                        {selectedJob.feedback}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;