"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import {
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  X,
  RefreshCw,
  CreditCard,
  ImagePlus,
  Trash2,
  Loader2,
  Image,
  Maximize2,
} from "lucide-react";
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
  const [completionPhotos, setCompletionPhotos] = useState([]);
  const [completionPhotoError, setCompletionPhotoError] = useState("");
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const [popupSubmitting, setPopupSubmitting] = useState(false);
  const [photoViewer, setPhotoViewer] = useState({ open: false, src: "", title: "" });
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");

  const completionPhotosRef = useRef([]);
  completionPhotosRef.current = completionPhotos;

  useEffect(() => {
    return () => {
      completionPhotosRef.current.forEach((photo) => {
        if (photo?.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, []);

  const MAX_COMPLETION_PHOTOS = 10;

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

  const resetCompletionPhotoState = () => {
    setCompletionPhotos((prev) => {
      prev.forEach((photo) => {
        if (photo?.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
      return [];
    });
    setCompletionPhotoError("");
    setPhotoInputKey((prev) => prev + 1);
  };

  const handleCompletionPhotoChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    setCompletionPhotos((prev) => {
      const availableSlots = Math.max(MAX_COMPLETION_PHOTOS - prev.length, 0);
      const filesToAdd = availableSlots > 0 ? imageFiles.slice(0, availableSlots) : [];
      const newItems = filesToAdd.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
      }));
      const next = [...prev, ...newItems];

      if (imageFiles.length !== files.length) {
        setCompletionPhotoError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      } else if (filesToAdd.length < imageFiles.length) {
        setCompletionPhotoError(`สามารถอัปโหลดได้สูงสุด ${MAX_COMPLETION_PHOTOS} รูป`);
      } else if (next.length >= 3) {
        setCompletionPhotoError("");
      }

      return next;
    });

    setPhotoInputKey((prev) => prev + 1);
  };

  const removeCompletionPhoto = (id) => {
    setCompletionPhotos((prev) => {
      const target = prev.find((photo) => photo.id === id);
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      const next = prev.filter((photo) => photo.id !== id);
      if (next.length < 3 && popupData?.type === "complete") {
        setCompletionPhotoError("กรุณาอัปโหลดรูปหลังทำความสะอาดอย่างน้อย 3 รูป");
      } else if (next.length >= 3) {
        setCompletionPhotoError("");
      }
      return next;
    });
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const [, base64] = reader.result.split(",");
          if (!base64) {
            reject(new Error("ไม่สามารถอ่านไฟล์ได้"));
            return;
          }
          resolve(base64);
        } else {
          reject(new Error("ไม่สามารถอ่านไฟล์ได้"));
        }
      };
      reader.onerror = () => {
        reject(reader.error || new Error("ไม่สามารถอ่านไฟล์ได้"));
      };
      reader.readAsDataURL(file);
    });

  const updateBookingStatus = async (job, newStatus, extraData = {}) => {
    try {
      if (!technicianId) {
        alert("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
        return;
      }

      if (!newStatus) {
        alert("ไม่สามารถอัปเดตสถานะได้");
        return;
      }

      const payload = { status: newStatus, ...extraData };
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
      return response.data;
    } catch (err) {
      console.error("Error updating booking status:", err);
      console.error("Error details:", err.response?.data); // เพิ่ม error details
      alert(`เกิดข้อผิดพลาดในการอัพเดทสถานะ: ${err.response?.data?.message || err.message}`);
      throw err;
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleAction = (job, type) => {
    if (type === "complete") {
      resetCompletionPhotoState();
    }

    if (type === "reject") {
      setRejectionReason("");
      setRejectionError("");
    }

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
    if (popupSubmitting || !popupData) return;

    const { type, job } = popupData;
    const statusMap = {
      accept: "accepted",
      reject: "rejected",
      complete: "completed",
    };
    const nextStatus = statusMap[type];

    if (!nextStatus) {
      return;
    }

    if (type === "complete" && completionPhotos.length < 3) {
      setCompletionPhotoError("กรุณาอัปโหลดรูปหลังทำความสะอาดอย่างน้อย 3 รูป");
      return;
    }

    try {
      let extraData = {};

      if (type === "complete") {
        const preparedPhotos = await Promise.all(
          completionPhotos.map(async (photo) => ({
            data: await fileToBase64(photo.file),
            contentType: photo.file.type || "image/jpeg",
            filename: photo.file.name || null,
            size: photo.file.size || null,
            uploadedAt: new Date().toISOString(),
          }))
        );

        extraData = { completionPhotos: preparedPhotos };
      }

      if (type === "reject") {
        const trimmedReason = rejectionReason.trim();
        if (!trimmedReason) {
          setRejectionError("กรุณาระบุเหตุผลในการปฏิเสธงาน");
          return;
        }
        setRejectionError("");
        extraData = {
          ...extraData,
          cancelReason: trimmedReason,
          rejectionReason: trimmedReason,
        };
      }

      setPopupSubmitting(true);

      await updateBookingStatus(job, nextStatus, extraData);

      if (type === "complete") {
        resetCompletionPhotoState();
      }

      if (type === "reject") {
        setRejectionReason("");
        setRejectionError("");
      }

      setShowPopup(false);
      setPopupData(null);
    } catch (err) {
      console.error("ไม่สามารถอัปเดตสถานะงานได้", err);
    } finally {
      setPopupSubmitting(false);
    }
  };

  const cancelAction = () => {
    if (popupData?.type === "complete") {
      resetCompletionPhotoState();
    }
    if (popupData?.type === "reject") {
      setRejectionReason("");
      setRejectionError("");
    }
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

  const getCompletionPhotoPreview = (photo) => {
    if (!photo) return null;
    if (typeof photo === "string") {
      if (
        photo.startsWith("data:") ||
        photo.startsWith("http://") ||
        photo.startsWith("https://") ||
        photo.startsWith("/")
      ) {
        return photo;
      }
      return null;
    }

    if (typeof photo.dataUrl === "string" && photo.dataUrl) {
      return photo.dataUrl;
    }

    let rawData = "";
    if (typeof photo.data === "string") {
      rawData = photo.data;
    } else if (typeof photo.base64 === "string") {
      rawData = photo.base64;
    }

    if (!rawData) return null;

    if (rawData.startsWith("data:")) {
      return rawData;
    }

    const contentType = photo.contentType || photo.type || "image/jpeg";
    return `data:${contentType};base64,${rawData}`;
  };

  const openPhotoViewer = (photo, index) => {
    const preview = getCompletionPhotoPreview(photo);
    if (!preview) return;

    const filename =
      (typeof photo === "object" &&
        (photo.filename || photo.name || (photo.metadata && photo.metadata.filename))) ||
      "";

    setPhotoViewer({
      open: true,
      src: preview,
      title: filename ? `${index + 1}. ${filename}` : `รูปที่ ${index + 1}`,
    });
  };

  const closePhotoViewer = () => {
    setPhotoViewer({ open: false, src: "", title: "" });
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

              {job.status === "completed" &&
                Array.isArray(job.completionPhotos) &&
                job.completionPhotos.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Image className="w-4 h-4" />
                      <span>รูปหลังทำความสะอาด</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {job.completionPhotos.map((photo, index) => {
                        const preview = getCompletionPhotoPreview(photo);
                        if (!preview) return null;

                        const label =
                          (typeof photo === "object" &&
                            (photo.filename || photo.name || (photo.metadata && photo.metadata.filename))) ||
                          "";

                        return (
                          <button
                            key={`${job._id}-completion-${index}`}
                            type="button"
                            onClick={() => openPhotoViewer(photo, index)}
                            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <img
                              src={preview}
                              alt={`รูปหลังทำความสะอาด ${index + 1}`}
                              className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs px-2 py-1 flex items-center justify-between gap-2">
                              <span>รูปที่ {index + 1}</span>
                              <span className="flex items-center gap-1">
                                <Maximize2 className="w-3 h-3" />
                                {label && <span className="max-w-[8rem] truncate">{label}</span>}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">คลิกที่รูปเพื่อดูขนาดเต็มหรือบันทึกเก็บไว้</p>
                  </div>
              )}

              {job.status === "rejected" && (job.cancelReason || job.rejectionReason) && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <h4 className="text-sm font-semibold text-red-700">เหตุผลที่ปฏิเสธงาน</h4>
                  <p className="mt-1 text-sm text-red-600 whitespace-pre-line">
                    {job.cancelReason || job.rejectionReason}
                  </p>
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg relative shadow-lg">
            <button
              onClick={cancelAction}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="mb-4">
                <CheckCircle className="w-10 h-10 text-blue-600 mx-auto" />
              </div>
              <h2 className="text-lg font-semibold mb-2 text-gray-800">{popupData.title}</h2>
              <p className="text-sm text-gray-600">{popupData.message}</p>
            </div>

            {popupData.type === "reject" && (
              <div className="mt-5 text-left space-y-2">
                <label htmlFor="rejectReason" className="text-sm font-medium text-gray-700">
                  กรุณาระบุเหตุผลในการปฏิเสธงาน
                </label>
                <textarea
                  id="rejectReason"
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    rejectionError ? "border-red-500" : "border-gray-300"
                  }`}
                  rows={3}
                  value={rejectionReason}
                  onChange={(event) => {
                    setRejectionReason(event.target.value);
                    if (event.target.value.trim()) {
                      setRejectionError("");
                    }
                  }}
                  placeholder="เช่น ลูกค้ายกเลิกงาน หรือมีเหตุสุดวิสัย"
                  disabled={popupSubmitting}
                />
                {rejectionError && <p className="text-sm text-red-600">{rejectionError}</p>}
              </div>
            )}

            {popupData.type === "complete" && (
              <div className="mt-5 text-left space-y-4">
                <div className="bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-lg p-3">
                  กรุณาอัปโหลดรูปหลังทำความสะอาดอย่างน้อย 3 รูป (สูงสุด {MAX_COMPLETION_PHOTOS} รูป)
                </div>
                <div>
                  <label
                    htmlFor="completionPhotos"
                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                    <ImagePlus className="w-5 h-5" />
                    <span>เพิ่มรูปภาพหลังทำความสะอาด</span>
                  </label>
                  <input
                    key={photoInputKey}
                    id="completionPhotos"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleCompletionPhotoChange}
                    disabled={popupSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    ไฟล์รองรับเฉพาะรูปภาพ และต้องมีจำนวนอย่างน้อย 3 รูปก่อนกดจบงาน
                  </p>
                </div>

                {completionPhotoError && (
                  <p className="text-sm text-red-600">{completionPhotoError}</p>
                )}

                {completionPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {completionPhotos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group"
                      >
                        <img
                          src={photo.preview}
                          alt={`รูปหลังทำความสะอาด ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          รูปที่ {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCompletionPhoto(photo.id)}
                          className="absolute top-2 right-2 bg-white/90 text-red-600 p-1 rounded-full shadow hover:bg-white"
                          aria-label="ลบรูปภาพนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <button
                onClick={cancelAction}
                className="flex-1 border py-2 rounded text-sm text-gray-700 hover:bg-gray-50"
                type="button"
                disabled={popupSubmitting}
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmAction}
                className="flex-1 bg-blue-600 text-white py-2 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                type="button"
                disabled={popupSubmitting}
              >
                {popupSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {popupSubmitting ? "กำลังบันทึก..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {photoViewer.open && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-6">
          <div className="relative w-full max-w-3xl">
            <button
              type="button"
              onClick={closePhotoViewer}
              className="absolute -top-10 right-0 text-white/80 hover:text-white"
              aria-label="ปิดภาพตัวอย่าง"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
              <img
                src={photoViewer.src}
                alt={photoViewer.title || "รูปหลังทำความสะอาด"}
                className="w-full max-h-[75vh] object-contain bg-black"
              />
              <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm font-medium text-gray-700 truncate">
                  {photoViewer.title || "รูปหลังทำความสะอาด"}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <a
                    href={photoViewer.src}
                    download
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ดาวน์โหลดรูป
                  </a>
                  <button
                    type="button"
                    onClick={closePhotoViewer}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Service;