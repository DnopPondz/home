"use client"

import React, { useState } from 'react';
import { User, Phone, MapPin, Clock, CheckCircle, X } from 'lucide-react';

const Service = () => {
    const [jobs, setJobs] = useState([
        {
            id: 1,
            customerName: "น้ำแข็งหลอดขาว",
            jobType: "สำหรับ 9,000 - 18,000 BTU, ติดตั้ง 2 เครื่อง",
            address: "444/4 ถนนโชตนา เขตบางเขน จงอรุณ กรุงเทพ",
            jobCode: "AD04071205",
            price: "1,550.00 ฿",
            status: "pending",
            timestamp: "25/04/2563 เวลา 13:00 น.",
            hasNote: true,
            isVerified: false
        },
        {
            id: 2,
            customerName: "น้ำแข็งหลอดขาว",
            jobType: "สำหรับ 9,000 - 18,000 BTU, ติดตั้ง 2 เครื่อง",
            address: "444/4 ถนนโชตนา เขตบางเขน จงอรุณ กรุงเทพ",
            jobCode: "AD04071205",
            price: "1,550.00 ฿",
            status: "pending",
            timestamp: "26/04/2563 เวลา 10:00 น.",
            hasNote: true,
            isVerified: true
        },
        {
            id: 3,
            customerName: "น้ำแข็งหลอดขาว",
            jobType: "สำหรับ 9,000 - 18,000 BTU, ติดตั้ง 2 เครื่อง",
            address: "444/4 ถนนโชตนา เขตบางเขน จงอรุณ กรุงเทพ",
            jobCode: "AD04071205",
            price: "1,550.00 ฿",
            status: "pending",
            timestamp: "25/04/2563 เวลา 13:00 น.",
            hasNote: true,
            isVerified: false
        }
    ]);

    const [showPopup, setShowPopup] = useState(false);
    const [popupData, setPopupData] = useState(null);

    const handleAcceptJob = (job) => {
        setPopupData({
            type: 'accept',
            title: 'ยืนยันการรับงาน?',
            message: `คุณรอรายการนี้ให้หรือไม่ "${job.jobType}" ในวันที่ ${job.timestamp}`,
            job: job
        });
        setShowPopup(true);
    };

    const handleRejectJob = (job) => {
        setPopupData({
            type: 'reject',
            title: 'ปฏิเสธการรับงาน?',
            message: `คุณต้องการปฏิเสธงานนี้ "${job.jobType}" ในวันที่ ${job.timestamp}`,
            job: job
        });
        setShowPopup(true);
    };

    const handleCompleteJob = (job) => {
        setPopupData({
            type: 'complete',
            title: 'จบงาน?',
            message: `คุณต้องการจบงานนี้ "${job.jobType}" หรือไม่`,
            job: job
        });
        setShowPopup(true);
    };

    const confirmAction = () => {
        if (popupData.type === 'accept') {
            setJobs(jobs.map(job => 
                job.id === popupData.job.id ? { ...job, status: 'accepted' } : job
            ));
        } else if (popupData.type === 'reject') {
            setJobs(jobs.filter(job => job.id !== popupData.job.id));
        } else if (popupData.type === 'complete') {
            setJobs(jobs.filter(job => job.id !== popupData.job.id));
        }
        setShowPopup(false);
        setPopupData(null);
    };

    const cancelAction = () => {
        setShowPopup(false);
        setPopupData(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-800">คำขอบริการล่วง</h1>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>ช่างแอร์ดูแลคุณ</span>
                            <span className="text-blue-600">332 คำขอจะได้รับในวันนี้</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Banner */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4 rounded-r-lg">
                <div className="flex items-center">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    <div className="text-sm">
                        <span className="text-blue-800">ช่างแอร์ดูแลคุณ</span>
                        <span className="text-blue-600 ml-2">332 คำขอจะได้รับในวันนี้จาก เขตบางเขน จงอรุณ กรุงเทพ</span>
                    </div>
                    <button className="ml-auto bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                        ตั้งค่า
                    </button>
                </div>
            </div>

            {/* Job Cards */}
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                {jobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">สำเนาอร์</h3>
                            <div className="flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>วันเวลาที่ต้องการ {job.timestamp}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                                <div className="flex items-start">
                                    <span className="text-sm text-gray-600 w-20 flex-shrink-0">งานขอร้อง</span>
                                    <span className="text-sm text-gray-800">{job.jobType}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-sm text-gray-600 w-20 flex-shrink-0">รหัสคำสั่งซื้อ</span>
                                    <span className="text-sm text-gray-800">{job.jobCode}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-sm text-gray-600 w-20 flex-shrink-0">ราคารวม</span>
                                    <span className="text-sm font-semibold text-gray-800">{job.price}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-start">
                                    <MapPin className="w-4 h-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-800">{job.address}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <button className="flex items-center text-blue-600 text-sm">
                                    <Phone className="w-4 h-4 mr-1" />
                                    โทรหา
                                </button>
                                {job.hasNote && (
                                    <button className="text-blue-600 text-sm">
                                        📝 บันทึก
                                    </button>
                                )}
                                {job.isVerified && (
                                    <div className="flex items-center text-green-600 text-sm">
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        ได้รับการยืนยัน
                                    </div>
                                )}
                            </div>
                            <div className="flex space-x-2">
                                {job.status === 'pending' && (
                                    <>
                                        <button 
                                            onClick={() => handleRejectJob(job)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            ปฏิเสธ
                                        </button>
                                        <button 
                                            onClick={() => handleAcceptJob(job)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                        >
                                            รับงาน
                                        </button>
                                    </>
                                )}
                                {job.status === 'accepted' && (
                                    <button 
                                        onClick={() => handleCompleteJob(job)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                                    >
                                        จบงาน
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">สรุปงานวันนี้</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {jobs.filter(job => job.status === 'pending').length}
                            </div>
                            <div className="text-sm text-gray-600">งานที่รอการตอบรับ</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {jobs.filter(job => job.status === 'accepted').length}
                            </div>
                            <div className="text-sm text-gray-600">งานที่รับแล้ว</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {jobs.length}
                            </div>
                            <div className="text-sm text-gray-600">งานทั้งหมด</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup Modal */}
            {showPopup && (
                <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-mx-4 relative">
                        <button 
                            onClick={cancelAction}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                {popupData.type === 'accept' && <CheckCircle className="w-8 h-8 text-blue-600" />}
                                {popupData.type === 'reject' && <X className="w-8 h-8 text-red-600" />}
                                {popupData.type === 'complete' && <CheckCircle className="w-8 h-8 text-green-600" />}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {popupData.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {popupData.message}
                            </p>
                        </div>
                        
                        <div className="flex space-x-3">
                            <button 
                                onClick={cancelAction}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                            >
                                ยกเลิก
                            </button>
                            <button 
                                onClick={confirmAction}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm text-white ${
                                    popupData.type === 'accept' ? 'bg-blue-600 hover:bg-blue-700' :
                                    popupData.type === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                                    'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {popupData.type === 'accept' ? 'ยืนยัน' : 
                                 popupData.type === 'reject' ? 'ปฏิเสธ' : 'จบงาน'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Service;