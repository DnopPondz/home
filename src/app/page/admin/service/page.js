"use client";

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { User, Phone, MapPin, Clock, CheckCircle, X, RefreshCw, CreditCard } from "lucide-react";
import { AuthContext } from "@/app/context/AuthContext.js"; // ปรับ path ให้ตรงกับโปรเจกต์ของคุณ

const Service = () => {
  const { user } = useContext(AuthContext);
  const technicianId = user?.userId;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/bookings", {
        params: statusFilter !== "all" ? { status: statusFilter } : {},
      });
      setJobs(res.data);
      setError(null);
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value.$oid) return value.$oid;
      if (value.toString) return value.toString();
    }
    return String(value);
  };

  const notifyStatusChange = async (job, newStatus) => {
    try {
      const userId = normalizeId(job.userId || job.customerId);
      const bookingId = normalizeId(job._id);

      if (!userId || !bookingId) {
        return;
      }

      const statusText = {
        pending: "รอดำเนินการ",
        accepted: "กำลังดำเนินการ",
        completed: "เสร็จสิ้น",
        rejected: "ถูกปฏิเสธ",
      }[newStatus] || newStatus;

      await axios.post("/api/notifications", {
        userId,
        bookingId,
        status: newStatus,
        message: `สถานะงาน "${job.serviceName || job.serviceCategory || "งานของคุณ"}" ถูกอัปเดตเป็น ${statusText}`,
      });
    } catch (err) {
      console.error("Error sending notification:", err);
    }
  };

  const updateBookingStatus = async (job, newStatus) => {
    try {
      if (!technicianId) {
        alert("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      const payload = { status: newStatus };
      if (newStatus === "accepted") payload.assignedTo = technicianId;

      const bookingId = normalizeId(job._id);

      if (!bookingId) {
        alert("ไม่พบรหัสงาน");
        return;
      }

      // แก้ไข: ใส่ backtick และ quotes ให้ถูกต้อง
      const response = await axios.patch(`/api/bookings/${bookingId}`, payload);
      console.log("Update response:", response.data); // เพิ่ม logging

      await notifyStatusChange(job, newStatus);
      await fetchBookings();
    } catch (err) {
      console.error("Error updating booking status:", err);
      console.error("Error details:", err.response?.data); // เพิ่ม error details
      alert(`เกิดข้อผิดพลาดในการอัพเดทสถานะ: ${err.response?.data?.message || err.message}`);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleAction = (job, type) => {
    const actions = {
      accept: {
        title: "ยืนยันการรับงาน?",
        // แก้ไข: ใส่ backtick และ quotes ให้ถูกต้อง
        message: `คุณต้องการรับงาน "${job.serviceName}" วันที่ ${job.bookingDate} เวลา ${job.bookingTime}`,
      },
      reject: {
        title: "ปฏิเสธงานนี้?",
        // แก้ไข: ใส่ backtick และ quotes ให้ถูกต้อง
        message: `คุณต้องการปฏิเสธงาน "${job.serviceName}" วันที่ ${job.bookingDate}`,
      },
      complete: {
        title: "จบงานนี้?",
        // แก้ไข: ใส่ backtick และ quotes ให้ถูกต้อง
        message: `คุณต้องการจบงาน "${job.serviceName}" หรือไม่`,
      },
    };
    setPopupData({ type, ...actions[type], job });
    setShowPopup(true);
  };

  const confirmAction = async () => {
    const { type, job } = popupData;
    const statusMap = {
      accept: "accepted",
      reject: "rejected",
      complete: "completed",
    };
    await updateBookingStatus(job, statusMap[type]);
    setShowPopup(false);
    setPopupData(null);
  };

  const cancelAction = () => {
    setShowPopup(false);
    setPopupData(null);
  };

  const formatDate = (str) => new Date(str).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
  const formatTime = (t) => t + " น.";

  const getStatusColor = (s) => {
    return {
      pending: "text-orange-600",
      accepted: "text-blue-600",
      completed: "text-green-600",
      rejected: "text-red-600",
    }[s] || "text-gray-600";
  };

  const getStatusText = (s) => {
    return {
      pending: "รอดำเนินการ",
      accepted: "รับงานแล้ว",
      completed: "เสร็จสิ้น",
      rejected: "ปฏิเสธแล้ว",
      all: "ทั้งหมด",
    }[s] || s;
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "bank_transfer":
        return "ชำระผ่านธนาคาร";
      case "cash":
        return "ชำระเงินสด (ที่หน้างาน)";
      case "card":
      case "online":
        return "บัตรเครดิต/เดบิต (Online Payment)";
      default:
        return method || "-";
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case "awaiting_verification":
        return "รอตรวจสอบหลักฐานการชำระเงิน";
      case "cash_on_delivery":
        return "ชำระเงินสดเมื่อให้บริการ";
      case "paid":
        return "ชำระเงินเรียบร้อย";
      case "pending":
        return "รอดำเนินการชำระเงิน";
      default:
        return status || "-";
    }
  };

  const getPaymentSlipPreview = (slip) => {
    if (!slip?.data || !slip?.contentType) return null;
    return `data:${slip.contentType};base64,${slip.data}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">คำขอบริการล่าสุด</h1>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>ช่าง</span>
              <span className="text-blue-600">{jobs.length} งาน</span>
            </div>
            <button onClick={fetchBookings} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex space-x-2 mb-4">
          {["all", "pending", "accepted", "completed", "rejected"].map((key) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border"
              }`}
            >
              {getStatusText(key)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-20">กำลังโหลด...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-20">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center text-gray-500 py-20">ไม่มีงานในสถานะนี้</div>
        ) : (
          jobs.map((job) => {
            const slipPreview = getPaymentSlipPreview(job.paymentSlip);
            const slipName = job.paymentSlip?.filename || job.paymentSlip?.name || "";

            return (
              <div key={job._id} className="bg-white rounded-lg shadow-sm border p-6 mb-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{job.serviceName}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(job.status)} bg-gray-100`}>
                    {getStatusText(job.status)}
                  </span>
                </div>
                <div className="flex text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDate(job.bookingDate)} {formatTime(job.bookingTime)}
                </div>
                
              </div>

              <div className="mt-4 text-sm text-gray-700">
                <div>ลูกค้า: {job.customerName}</div>
                <div>เบอร์: {job.customerPhone}</div>
                <div>ที่อยู่: {job.customerLocation}</div>
                <div>ราคา: {job.estimatedPrice}</div>
                <div>วิธีการชำระเงิน: {getPaymentMethodText(job.paymentMethod)}</div>
                {job.paymentStatus && (
                  <div>สถานะการชำระเงิน: {getPaymentStatusText(job.paymentStatus)}</div>
                )}
              </div>

              {slipPreview && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <CreditCard className="w-4 h-4" />
                    <span>หลักฐานการโอน</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
                    <img
                      src={slipPreview}
                      alt="หลักฐานการโอน"
                      className="w-40 rounded-lg border border-gray-200"
                    />
                    <div className="text-xs text-gray-600 space-y-2">
                      {slipName && (
                        <p className="text-gray-700">
                          ชื่อไฟล์: <span className="font-medium">{slipName}</span>
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        <a
                          href={slipPreview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          เปิดดูรูป
                        </a>
                        <a
                          href={slipPreview}
                          download={slipName || "payment-slip"}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ดาวน์โหลด
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                {job.status === "pending" && (
                  <>
                    <button onClick={() => handleAction(job, "reject")} className="border px-4 py-2 rounded text-sm">
                      ปฏิเสธ
                    </button>
                    <button onClick={() => handleAction(job, "accept")} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
                      รับงาน
                    </button>
                  </>
                )}
                {job.status === "accepted" && (
                  <button onClick={() => handleAction(job, "complete")} className="bg-green-600 text-white px-4 py-2 rounded text-sm">
                    จบงาน
                  </button>
                )}
              </div>
              </div>
            );
          })
        )}
      </div>

      {showPopup && popupData && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm mx-4 relative shadow-lg">
            <button onClick={cancelAction} className="absolute top-3 right-3 text-gray-500">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="mb-4">
                <CheckCircle className="w-10 h-10 text-blue-600 mx-auto" />
              </div>
              <h2 className="text-lg font-semibold mb-2">{popupData.title}</h2>
              <p className="text-sm text-gray-600 mb-4">{popupData.message}</p>
              <div className="flex space-x-2">
                <button onClick={cancelAction} className="flex-1 border py-2 rounded text-sm">
                  ยกเลิก
                </button>
                <button onClick={confirmAction} className="flex-1 bg-blue-600 text-white py-2 rounded text-sm">
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Service;