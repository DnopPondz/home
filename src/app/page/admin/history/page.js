"use client"

import React, { useState, useEffect } from 'react';
import { Search, Eye, X, Star } from 'lucide-react';

const normalizeId = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        if (value.$oid) return value.$oid;
        if (typeof value.toString === 'function') return value.toString();
    }
    return String(value);
};

const buildCustomerName = (userDetails = {}) => {
    const firstName = userDetails.firstName || '';
    const lastName = userDetails.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || userDetails.name || userDetails.email || '-';
};

const mapBookingToHistoryJob = (booking) => {
    const rating = booking?.rating ?? booking?.reviewDetail?.rating ?? 0;
    const reviewComment = booking?.review ?? booking?.reviewDetail?.comment ?? '';
    const priceValue = booking?.estimatedPrice ?? booking?.serviceDetails?.price ?? booking?.price ?? null;
    const parsedPrice = typeof priceValue === 'number' ? priceValue : Number(priceValue) || 0;

    return {
        _id: normalizeId(booking?._id),
        bookingId: normalizeId(booking?._id),
        customerName: booking?.customerName || buildCustomerName(booking?.userDetails),
        appointmentDate: booking?.bookingDate || booking?.completedDate || booking?.date || booking?.createdAt,
        serviceType: booking?.serviceDetails?.serviceType || booking?.selectedOption || booking?.serviceName || '-',
        price: parsedPrice,
        status: booking?.status || 'completed',
        address: booking?.customerLocation || booking?.address || booking?.serviceDetails?.location || '-',
        phoneNumber: booking?.userDetails?.phone || booking?.phoneNumber || '-',
        notes: booking?.notes || booking?.serviceDetails?.description || '',
        rating: rating ? Number(rating) : 0,
        feedback: reviewComment,
        reviewedAt: booking?.reviewedAt || booking?.reviewDetail?.updatedAt || null,
    };
};

const History = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
    const [showDetailPopup, setShowDetailPopup] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [historyJobs, setHistoryJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistoryJobs = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch('/api/reviews');
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data?.message || 'ไม่สามารถดึงข้อมูลรีวิวได้');
                }

                const bookings = Array.isArray(data?.data) ? data.data : [];
                const mapped = bookings.map(mapBookingToHistoryJob);
                setHistoryJobs(mapped);
            } catch (err) {
                console.error('fetchHistoryJobs error:', err);
                setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
            } finally {
                setLoading(false);
            }
        };

        fetchHistoryJobs();
    }, []);

    const filteredJobs = historyJobs.filter(job => {
        const matchesSearch = job.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.serviceType?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === 'ทั้งหมด' || filterStatus === 'เสร็จแล้ว';

        return matchesSearch && matchesFilter;
    });

    const getStatusText = (status) => {
        return status === 'accepted' ? 'เสร็จแล้ว' : 'ปฏิเสธ';
    };

    const getStatusColor = (status) => {
        return status === 'accepted' ? 'text-green-600' : 'text-red-600';
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
        const ratingValue = rating || 0;
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`w-4 h-4 ${
                    index < ratingValue ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
            />
        ));
    };

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format price function
    const formatPrice = (price) => {
        if (!price) return '-';
        const numeric = typeof price === 'number' ? price : Number(price);
        if (!Number.isFinite(numeric)) return '-';
        return `${numeric.toLocaleString()} ฿`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 mb-4">
                        <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <h1 className="text-xl font-semibold text-gray-800">ประวัติการทำงาน</h1>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="ค้นหาจากชื่อลูกค้า รหัสงาน หรือประเภทงาน"
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
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">รหัสงาน</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">ประเภทงาน</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">ราคารวม</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">สถานะ</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">รีวิว</th>
                                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredJobs.map((job) => (
                                    <tr key={job._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{job.customerName || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(job.appointmentDate)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{job._id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{job.serviceType || '-'}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatPrice(job.price)}</td>
                                        <td className={`px-6 py-4 text-sm font-medium ${getStatusColor(job.status)}`}>
                                            {getStatusText(job.status)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {job.rating ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex items-center space-x-1">
                                                        {renderStars(Math.round(job.rating))}
                                                    </div>
                                                    <span className="text-xs text-gray-500">{job.rating.toFixed(1)}/5</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">ยังไม่มีรีวิว</span>
                                            )}
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
                        <div className="text-2xl font-bold text-green-600">
                            {historyJobs.length}
                        </div>
                        <div className="text-sm text-gray-600">งานที่เสร็จแล้ว</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <div className="text-2xl font-bold text-gray-800">
                            {historyJobs
                                .reduce((total, job) => total + (Number(job.price) || 0), 0)
                                .toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">รายได้รวม (฿)</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {historyJobs.filter(job => job.rating).length > 0 
                                ? (historyJobs.reduce((total, job) => total + (job.rating || 0), 0) / historyJobs.filter(job => job.rating).length).toFixed(1)
                                : '0'
                            }
                        </div>
                        <div className="text-sm text-gray-600">คะแนนเฉลี่ย</div>
                    </div>
                </div>
            </div>

            {/* Job Detail Popup */}
            {showDetailPopup && selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative max-h-[80vh] overflow-y-auto">
                        <button 
                            onClick={closeDetailPopup}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="mb-6 mt-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">รายละเอียดงาน</h3>
                                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                                    เสร็จสิ้น
                                </span>
                            </div>
                            
                            <div className="space-y-3 text-sm">
                                <div className="flex">
                                    <span className="text-gray-600 w-28 flex-shrink-0">ชื่อลูกค้า:</span>
                                    <span className="text-gray-800">{selectedJob.customerName || '-'}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-28 flex-shrink-0">ประเภทงาน:</span>
                                    <span className="text-gray-800">{selectedJob.serviceType || '-'}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-28 flex-shrink-0">วันเวลานัดหมาย:</span>
                                    <span className="text-gray-800">{formatDate(selectedJob.appointmentDate)}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-28 flex-shrink-0">สถานที่:</span>
                                    <span className="text-gray-800">{selectedJob.address || '-'}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-28 flex-shrink-0">รหัสงาน:</span>
                                    <span className="text-gray-800">{selectedJob._id}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-28 flex-shrink-0">ราคารวม:</span>
                                    <span className="text-gray-800 font-semibold">{formatPrice(selectedJob.price)}</span>
                                </div>
                                <div className="flex">
                                    <span className="text-gray-600 w-28 flex-shrink-0">เบอร์ติดต่อ:</span>
                                    <span className="text-gray-800">{selectedJob.phoneNumber || '-'}</span>
                                </div>
                                {selectedJob.notes && (
                                    <div className="flex">
                                        <span className="text-gray-600 w-28 flex-shrink-0">หมายเหตุ:</span>
                                        <span className="text-gray-800">{selectedJob.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {(selectedJob.rating || selectedJob.feedback) && (
                            <div className="border-t pt-4 mt-4 space-y-3">
                                <div>
                                    <span className="text-sm text-gray-600">คะแนนความพึงพอใจ:</span>
                                    <div className="flex items-center mt-1">
                                        {renderStars(Math.round(selectedJob.rating || 0))}
                                        <span className="ml-2 text-sm text-gray-600">({(selectedJob.rating || 0).toFixed(1)}/5)</span>
                                    </div>
                                </div>
                                {selectedJob.feedback && (
                                    <div>
                                        <span className="text-sm text-gray-600">ความคิดเห็นจากลูกค้า:</span>
                                        <p className="text-sm text-gray-800 mt-1 bg-gray-50 p-2 rounded">
                                            {selectedJob.feedback}
                                        </p>
                                    </div>
                                )}
                                {selectedJob.reviewedAt && (
                                    <div className="text-xs text-gray-500">
                                        อัปเดตล่าสุด: {formatDate(selectedJob.reviewedAt)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;