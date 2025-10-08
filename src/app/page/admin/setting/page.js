"use client"

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Activity,
  CheckCircle2,
  XCircle,
  Download,
  Loader2,
} from 'lucide-react';
import axios from 'axios';

const SettingService = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [processingApplicationId, setProcessingApplicationId] = useState(null);
  const [actionMessage, setActionMessage] = useState({ type: '', message: '' });

  const showActionMessage = (message, type = 'success') => {
    setActionMessage({ type, message });
    if (!message) return;
    setTimeout(() => {
      setActionMessage((prev) =>
        prev.message === message ? { type: '', message: '' } : prev
      );
    }, 4000);
  };

  const clearActionMessage = () => setActionMessage({ type: '', message: '' });

  const fetchUsers = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const [usersRes, bookingsRes] = await Promise.all([
        axios.get("/api/users"),
        axios.get("/api/bookings"),
      ]);

      const toArray = (data) => {
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object') {
          if (Array.isArray(data.data)) return data.data;
          if (Array.isArray(data.results)) return data.results;
          if (Array.isArray(data.items)) return data.items;
        }
        return [];
      };

      const usersData = toArray(usersRes.data);
      const bookingsData = toArray(bookingsRes.data);

      const normalizeId = (value) => {
        if (!value) return null;
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
          if (value.$oid) return value.$oid;
          if (typeof value.toString === 'function') {
            const stringified = value.toString();
            if (stringified && stringified !== '[object Object]') {
              return stringified;
            }
          }
        }
        return String(value);
      };

      const normalizeStatus = (value) => {
        const status = String(value || '').toLowerCase();
        if (!status) return 'other';
        if (['pending', 'รอดำเนินการ'].includes(status)) return 'pending';
        if (['accepted', 'กำลังดำเนินการ', 'กำลังทำ', 'in progress'].includes(status)) return 'accepted';
        if (['completed', 'เสร็จสิ้น', 'จบงาน', 'สำเร็จ'].includes(status)) return 'completed';
        if (['rejected', 'ยกเลิก', 'ถูกยกเลิก', 'cancelled', 'canceled'].includes(status)) return 'rejected';
        return 'other';
      };

      const workerUsers = usersData.filter((user) =>
        Array.isArray(user.role)
          ? user.role.includes('worker')
          : user.role === 'worker'
      );

      const workerBaseEntries = workerUsers
        .map((worker) => {
          const workerId = normalizeId(worker._id);
          if (!workerId) return null;

          return [
            workerId,
            {
              ...worker,
              _id: workerId,
              workerId,
              firstName: worker.firstName || '',
              lastName: worker.lastName || '',
              email: worker.email || '',
              phone: worker.phone || '',
              location: worker.location || '',
              services: Array.isArray(worker.services) ? worker.services : [],
              imageUrl: worker.imageUrl || worker.image || '',
              createdAt: worker.createdAt || worker.created_at || null,
              description: worker.description || '',
              total: 0,
              pending: 0,
              accepted: 0,
              completed: 0,
              rejected: 0,
              ratingTotal: 0,
              ratingCount: 0,
            },
          ];
        })
        .filter(Boolean);

      const workerStatsMap = new Map(workerBaseEntries);
      const collator = new Intl.Collator('th-TH');

      let totalRatingCount = 0;

      bookingsData.forEach((booking) => {
        const normalizedStatus = normalizeStatus(booking.status);
        const workerId = normalizeId(booking.assignedTo);
        if (!workerId) {
          return;
        }

        if (!workerStatsMap.has(workerId)) {
          const fallbackName = booking.assignedToName || booking.workerName || 'ไม่พบข้อมูลพนักงาน';
          workerStatsMap.set(workerId, {
            workerId,
            _id: workerId,
            firstName: fallbackName,
            lastName: '',
            email: booking.workerEmail || '',
            phone: booking.workerPhone || '',
            location: '',
            services: [],
            imageUrl: '',
            createdAt: null,
            description: '',
            total: 0,
            pending: 0,
            accepted: 0,
            completed: 0,
            rejected: 0,
            ratingTotal: 0,
            ratingCount: 0,
          });
        }

        const stats = workerStatsMap.get(workerId);
        stats.total += 1;

        if (normalizedStatus === 'pending') stats.pending += 1;
        if (normalizedStatus === 'accepted') stats.accepted += 1;
        if (normalizedStatus === 'completed') stats.completed += 1;
        if (normalizedStatus === 'rejected') stats.rejected += 1;

        const ratingSource =
          booking.rating ?? booking.reviewDetail?.rating ?? booking.review?.rating;
        const ratingValue = Number(ratingSource);
        if (Number.isFinite(ratingValue) && ratingValue > 0) {
          stats.ratingTotal += ratingValue;
          stats.ratingCount += 1;
          totalRatingCount += 1;
        }
      });

      const workers = Array.from(workerStatsMap.values())
        .map((stats) => ({
          ...stats,
          averageRating:
            stats.ratingCount > 0 ? stats.ratingTotal / stats.ratingCount : 0,
        }))
        .sort((a, b) => {
          if (b.total !== a.total) return b.total - a.total;
          const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
          const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();
          return collator.compare(nameA, nameB);
        });

      setUsers(workers);
      setFilteredUsers(workers);
    } catch (error) {
      console.error('ไม่สามารถโหลดข้อมูลผู้ใช้ได้:', error);
      showActionMessage('ไม่สามารถโหลดข้อมูลพนักงานได้', 'error');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      const res = await axios.get("/api/worker-applications", {
        params: { status: 'pending', includeResumeData: true },
      });
      setApplications(res.data?.applications || []);
    } catch (error) {
      console.error('ไม่สามารถโหลดคำขอสมัครได้:', error);
      showActionMessage('ไม่สามารถโหลดคำขอสมัครได้', 'error');
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchApplications();
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

  const workforceMetrics = useMemo(() => {
    const baseSummary = {
      totalWorkers: Array.isArray(users) ? users.length : 0,
      availableWorkers: 0,
      totalJobs: 0,
      activeJobs: 0,
      pendingJobs: 0,
      acceptedJobs: 0,
      completedJobs: 0,
      rejectedJobs: 0,
      reviewCount: 0,
      averageRating: 0,
    };

    if (!Array.isArray(users) || users.length === 0) {
      return baseSummary;
    }

    let ratingWeightedSum = 0;

    users.forEach((worker) => {
      const pending = Number(worker.pending || 0);
      const accepted = Number(worker.accepted || 0);
      const completed = Number(worker.completed || 0);
      const rejected = Number(worker.rejected || 0);
      const total = Number(worker.total || pending + accepted + completed + rejected);
      const ratingCount = Number(worker.ratingCount || 0);
      const averageRating = Number(worker.averageRating || 0);

      baseSummary.totalJobs += total;
      baseSummary.pendingJobs += pending;
      baseSummary.acceptedJobs += accepted;
      baseSummary.completedJobs += completed;
      baseSummary.rejectedJobs += rejected;
      baseSummary.activeJobs += pending + accepted;

      if (pending + accepted === 0) {
        baseSummary.availableWorkers += 1;
      }

      ratingWeightedSum += averageRating * ratingCount;
      baseSummary.reviewCount += ratingCount;
    });

    baseSummary.averageRating =
      baseSummary.reviewCount > 0 ? ratingWeightedSum / baseSummary.reviewCount : 0;

    return baseSummary;
  }, [users]);

  const handleServiceFilter = (service) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const formatNumber = (value) => Number(value || 0).toLocaleString('th-TH');

  const getRatingStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (error) {
      return '-';
    }
  };

  const formatFileSize = (size) => {
    if (!size || Number.isNaN(size)) return '0 KB';
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  };

  const hasRole = (user, role) =>
    Array.isArray(user?.role) ? user.role.includes(role) : user?.role === role;

  const handleApplicationUpdate = async (applicationId, newStatus, adminNote) => {
    try {
      setProcessingApplicationId(applicationId);
      await axios.patch(`/api/worker-applications/${applicationId}`, {
        status: newStatus,
        ...(adminNote?.trim() ? { adminNote: adminNote.trim() } : {}),
      });

      if (newStatus === 'approved') {
        showActionMessage('อนุมัติคำขอพนักงานเรียบร้อยแล้ว', 'success');
      } else if (newStatus === 'rejected') {
        showActionMessage('ปฏิเสธคำขอพนักงานเรียบร้อยแล้ว', 'success');
      } else {
        showActionMessage('อัปเดตสถานะคำขอพนักงานแล้ว', 'success');
      }

      await Promise.all([fetchApplications(), fetchUsers(false)]);
    } catch (error) {
      console.error('ไม่สามารถอัปเดตสถานะคำขอได้:', error);
      const message =
        error.response?.data?.message || 'ไม่สามารถอัปเดตสถานะคำขอได้';
      showActionMessage(message, 'error');
    } finally {
      setProcessingApplicationId(null);
    }
  };

  const handleApproveApplication = (applicationId) => {
    handleApplicationUpdate(applicationId, 'approved');
  };

  const handleRejectApplication = (applicationId) => {
    const note = window.prompt('ระบุเหตุผลในการปฏิเสธ (ไม่บังคับ)');
    handleApplicationUpdate(applicationId, 'rejected', note || undefined);
  };

  const handleDownloadResume = (application) => {
    try {
      const resume = application?.resume;
      if (!resume?.data) {
        showActionMessage('ไม่พบไฟล์เรซูเม่สำหรับคำขอนี้', 'error');
        return;
      }

      const byteCharacters = atob(resume.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i += 1) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: resume.contentType || 'application/octet-stream',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resume.filename || 'resume';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download resume error:', error);
      showActionMessage('ไม่สามารถดาวน์โหลดไฟล์เรซูเม่ได้', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลพนักงาน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">จัดการพนักงานภาคสนาม</h1>
          <p className="text-gray-600">ตรวจสอบคำขอสมัครและจัดการข้อมูลพนักงานที่พร้อมให้บริการลูกค้า</p>
        </div>

        {actionMessage.message && (
          <div
            className={`mb-6 border rounded-lg px-4 py-3 ${
              actionMessage.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : actionMessage.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-blue-200 bg-blue-50 text-blue-700'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-medium">{actionMessage.message}</p>
              <button
                onClick={clearActionMessage}
                className="text-xs uppercase tracking-wide font-semibold"
              >
                ปิด
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                คำขอสมัครพนักงานที่รอตรวจสอบ
              </h2>
              <p className="text-sm text-gray-500">
                ตรวจสอบประวัติและอนุมัติผู้สมัครเพื่อเพิ่มจำนวนพนักงานภาคสนาม
              </p>
            </div>
            {!applicationsLoading && (
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                {applications.length} รายการที่รอตรวจสอบ
              </span>
            )}
          </div>

          {applicationsLoading ? (
            <div className="flex items-center justify-center py-10 text-blue-600">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500">
              ยังไม่มีคำขอสมัครใหม่ในขณะนี้
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.firstName} {application.lastName}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4" /> {application.email}
                        </span>
                        <span className="flex items-center gap-2">
                          <Phone className="h-4 w-4" /> {application.phone}
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> ส่งเมื่อ {formatDateTime(application.createdAt)}
                        </span>
                      </div>
                      {application.resume?.filename && (
                        <div className="mt-2 text-sm text-gray-500">
                          ไฟล์เรซูเม่: {application.resume.filename}
                          {application.resume.size ? ` • ${formatFileSize(application.resume.size)}` : ''}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadResume(application)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Download className="h-4 w-4" /> ดาวน์โหลดเรซูเม่
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveApplication(application._id)}
                        disabled={processingApplicationId === application._id}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {processingApplicationId === application._id ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectApplication(application._id)}
                        disabled={processingApplicationId === application._id}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        <XCircle className="h-4 w-4" /> ปฏิเสธ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">พนักงานทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workforceMetrics.totalWorkers.toLocaleString('th-TH')}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">พนักงานที่พร้อมรับงาน</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workforceMetrics.availableWorkers.toLocaleString('th-TH')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  จากพนักงานทั้งหมด {workforceMetrics.totalWorkers.toLocaleString('th-TH')} คน
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">งานที่เสร็จ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workforceMetrics.completedJobs.toLocaleString('th-TH')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  งานทั้งหมด {workforceMetrics.totalJobs.toLocaleString('th-TH')} งาน
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
                  {workforceMetrics.averageRating.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  จากรีวิวทั้งหมด {workforceMetrics.reviewCount.toLocaleString('th-TH')} รายการ
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">ภาพรวมสถานะงานของทีม</h2>
              <p className="text-sm text-gray-500">
                ตรวจสอบจำนวนงานทั้งหมดที่อยู่ในแต่ละสถานะเพื่อวางแผนการกระจายงานให้เหมาะสม
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
              ทั้งหมด {workforceMetrics.totalJobs.toLocaleString('th-TH')} งาน
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">รอดำเนินการ</p>
              <p className="mt-2 text-2xl font-bold text-amber-900">
                {workforceMetrics.pendingJobs.toLocaleString('th-TH')}
              </p>
              <p className="text-xs text-amber-700 mt-1">รอการตอบรับจากพนักงาน</p>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">กำลังดำเนินงาน</p>
              <p className="mt-2 text-2xl font-bold text-sky-900">
                {workforceMetrics.acceptedJobs.toLocaleString('th-TH')}
              </p>
              <p className="text-xs text-sky-700 mt-1">งานที่พนักงานกำลังปฏิบัติอยู่</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">จบงานแล้ว</p>
              <p className="mt-2 text-2xl font-bold text-emerald-900">
                {workforceMetrics.completedJobs.toLocaleString('th-TH')}
              </p>
              <p className="text-xs text-emerald-700 mt-1">งานที่ดำเนินการเสร็จสมบูรณ์</p>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-600">ถูกยกเลิก</p>
              <p className="mt-2 text-2xl font-bold text-rose-900">
                {workforceMetrics.rejectedJobs.toLocaleString('th-TH')}
              </p>
              <p className="text-xs text-rose-700 mt-1">งานที่ลูกค้าหรือระบบยกเลิก</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 text-indigo-600">
              งานที่กำลังดำเนินอยู่ทั้งหมด {workforceMetrics.activeJobs.toLocaleString('th-TH')} งาน
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-slate-600">
              คะแนนเฉลี่ยจากลูกค้า {workforceMetrics.averageRating.toFixed(1)} จาก {workforceMetrics.reviewCount.toLocaleString('th-TH')} รีวิว
            </span>
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
              เพิ่มพนักงานใหม่
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

        {/* Workers Grid */}
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
                            {(user.firstName || user.lastName || user.email || '?')
                              .toString()
                              .charAt(0)
                              .toUpperCase()}
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
                    เข้าร่วมเมื่อ {user.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH') : '-'}
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

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">สรุปงานของพนักงาน</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-slate-100 px-3 py-2">
                      <p className="text-xs uppercase tracking-wide text-slate-500">งานทั้งหมด</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {formatNumber(
                          user.total ||
                            Number(user.pending || 0) +
                            Number(user.accepted || 0) +
                            Number(user.completed || 0) +
                            Number(user.rejected || 0)
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg bg-indigo-100/70 px-3 py-2">
                      <p className="text-xs uppercase tracking-wide text-indigo-700">งานที่กำลังดำเนินอยู่</p>
                      <p className="mt-1 text-lg font-semibold text-indigo-900">
                        {formatNumber(Number(user.pending || 0) + Number(user.accepted || 0))}
                      </p>
                    </div>
                    <div className="rounded-lg bg-emerald-100/70 px-3 py-2">
                      <p className="text-xs uppercase tracking-wide text-emerald-700">งานที่เสร็จแล้ว</p>
                      <p className="mt-1 text-lg font-semibold text-emerald-900">
                        {formatNumber(user.completed || 0)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-rose-100/70 px-3 py-2">
                      <p className="text-xs uppercase tracking-wide text-rose-700">งานถูกยกเลิก</p>
                      <p className="mt-1 text-lg font-semibold text-rose-900">
                        {formatNumber(user.rejected || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <span className="inline-flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                      <span>รอดำเนินการ</span>
                      <span className="font-semibold text-slate-900">{formatNumber(user.pending || 0)}</span>
                    </span>
                    <span className="inline-flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                      <span>กำลังทำ</span>
                      <span className="font-semibold text-slate-900">{formatNumber(user.accepted || 0)}</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">คะแนนเฉลี่ยจากลูกค้า</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold text-gray-900">
                          {Number(user.averageRating || 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({formatNumber(user.ratingCount || 0)} รีวิว)
                        </span>
                      </div>
                    </div>
                    <div className="text-yellow-500 text-lg font-semibold">
                      {getRatingStars(Number(user.averageRating || 0))}
                    </div>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบพนักงานที่ตรงกับเงื่อนไขการค้นหา</h3>
            <p className="text-gray-600">ลองเปลี่ยนคำค้นหาหรือเครื่องมือกรองข้อมูล</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingService;