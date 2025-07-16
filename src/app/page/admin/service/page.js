"use client"

import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Clock, CheckCircle, X, RefreshCw } from 'lucide-react';

const Service = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupData, setPopupData] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    // Fetch bookings from API
    const fetchBookings = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (statusFilter !== 'all') {
                queryParams.append('status', statusFilter);
            }
            
            const response = await fetch(`/api/bookings?${queryParams}`);
            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }
            
            const data = await response.json();
            setJobs(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    // Update booking status
    const updateBookingStatus = async (bookingId, newStatus) => {
        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update booking status');
            }

            // Refresh the bookings list
            await fetchBookings();
        } catch (err) {
            console.error('Error updating booking status:', err);
            alert('เกิดข้อผิดพลาดในการอัพเดทสถานะ');
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [statusFilter]);

    const handleAcceptJob = (job) => {
        setPopupData({
            type: 'accept',
            title: 'ยืนยันการรับงาน?',
            message: `คุณต้องการรับงาน "${job.serviceName}" ในวันที่ ${job.bookingDate} เวลา ${job.bookingTime} น.`,
            job: job
        });
        setShowPopup(true);
    };

    const handleRejectJob = (job) => {
        setPopupData({
            type: 'reject',
            title: 'ปฏิเสธการรับงาน?',
            message: `คุณต้องการปฏิเสธงาน "${job.serviceName}" ในวันที่ ${job.bookingDate} เวลา ${job.bookingTime} น.`,
            job: job
        });
        setShowPopup(true);
    };

    const handleCompleteJob = (job) => {
        setPopupData({
            type: 'complete',
            title: 'จบงาน?',
            message: `คุณต้องการจบงาน "${job.serviceName}" หรือไม่`,
            job: job
        });
        setShowPopup(true);
    };

    const confirmAction = async () => {
        if (popupData.type === 'accept') {
            await updateBookingStatus(popupData.job._id, 'accepted');
        } else if (popupData.type === 'reject') {
            await updateBookingStatus(popupData.job._id, 'rejected');
        } else if (popupData.type === 'complete') {
            await updateBookingStatus(popupData.job._id, 'completed');
        }
        setShowPopup(false);
        setPopupData(null);
    };

    const cancelAction = () => {
        setShowPopup(false);
        setPopupData(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return timeString + ' น.';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-orange-600';
            case 'accepted': return 'text-blue-600';
            case 'completed': return 'text-green-600';
            case 'rejected': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'รอดำเนินการ';
            case 'accepted': return 'รับงานแล้ว';
            case 'completed': return 'เสร็จสิ้น';
            case 'rejected': return 'ปฏิเสธแล้ว';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-lg">กำลังโหลด...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-lg mb-4">เกิดข้อผิดพลาด: {error}</div>
                    <button 
                        onClick={fetchBookings}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        ลองใหม่
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-800">คำขอบริการล่าสุด</h1>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <User className="w-4 h-4" />
                                <span>ช่างเทคนิค</span>
                                <span className="text-blue-600">{jobs.length} คำขอทั้งหมด</span>
                            </div>
                            <button 
                                onClick={fetchBookings}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="รีเฟรช"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="flex space-x-2 mb-4">
                    {[
                        { key: 'all', label: 'ทั้งหมด' },
                        { key: 'pending', label: 'รอดำเนินการ' },
                        { key: 'accepted', label: 'รับงานแล้ว' },
                        { key: 'completed', label: 'เสร็จสิ้น' }
                    ].map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => setStatusFilter(filter.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                statusFilter === filter.key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Job Cards */}
            <div className="max-w-4xl mx-auto px-4 py-2 space-y-4">
                {jobs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">ไม่มีงานที่ตรงกับเงื่อนไข</div>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div key={job._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{job.serviceName}</h3>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)} bg-gray-100`}>
                                        {getStatusText(job.status)}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>{formatDate(job.bookingDate)} {formatTime(job.bookingTime)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                    <div className="flex items-start">
                                        <span className="text-sm text-gray-600 w-24 flex-shrink-0">ประเภท:</span>
                                        <span className="text-sm text-gray-800">{job.serviceCategory}</span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="text-sm text-gray-600 w-24 flex-shrink-0">ลูกค้า:</span>
                                        <span className="text-sm text-gray-800">{job.customerName}</span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="text-sm text-gray-600 w-24 flex-shrink-0">อีเมล:</span>
                                        <span className="text-sm text-gray-800">{job.customerEmail}</span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="text-sm text-gray-600 w-24 flex-shrink-0">ราคาประมาณ:</span>
                                        <span className="text-sm font-semibold text-gray-800">{job.estimatedPrice}</span>
                                    </div>
                                    <div className="flex items-start">
                                        <span className="text-sm text-gray-600 w-24 flex-shrink-0">ชำระโดย:</span>
                                        <span className="text-sm text-gray-800">{job.paymentMethod === 'cash' ? 'เงินสด' : 'โอนเงิน'}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-start">
                                        <MapPin className="w-4 h-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-800">{job.customerLocation}</span>
                                    </div>
                                    <div className="flex items-start">
                                        <Phone className="w-4 h-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-800">{job.customerPhone}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <a 
                                        href={`tel:${job.customerPhone}`}
                                        className="flex items-center text-blue-600 text-sm hover:text-blue-700"
                                    >
                                        <Phone className="w-4 h-4 mr-1" />
                                        โทรหา
                                    </a>
                                    <span className="text-xs text-gray-500">
                                        สร้างเมื่อ {formatDate(job.createdAt)}
                                    </span>
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
                                    {(job.status === 'completed' || job.status === 'rejected') && (
                                        <span className={`px-4 py-2 rounded-lg text-sm ${getStatusColor(job.status)} bg-gray-100`}>
                                            {getStatusText(job.status)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Summary Stats */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">สรุปงานวันนี้</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {jobs.filter(job => job.status === 'pending').length}
                            </div>
                            <div className="text-sm text-gray-600">รอดำเนินการ</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {jobs.filter(job => job.status === 'accepted').length}
                            </div>
                            <div className="text-sm text-gray-600">รับงานแล้ว</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {jobs.filter(job => job.status === 'completed').length}
                            </div>
                            <div className="text-sm text-gray-600">เสร็จสิ้น</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">
                                {jobs.length}
                            </div>
                            <div className="text-sm text-gray-600">งานทั้งหมด</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup Modal */}
            {showPopup && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
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