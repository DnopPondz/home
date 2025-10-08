"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import axios from "axios";
import {
  Calendar,
  MapPin,
  ClipboardList,
  Loader2,
  MessageSquareText,
  Star,
  CheckCircle2,
  X,
} from "lucide-react";
import { AuthContext } from "@/app/context/AuthContext.js";

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value.$oid) return value.$oid;
    if (value.toString) return value.toString();
  }
  return `${value}`;
};

const MAX_REVIEW_PHOTOS = 5;

const normalizeCompletionPhoto = (photo) => {
  if (!photo || typeof photo !== "object") return null;

  let dataUrl = typeof photo.dataUrl === "string" ? photo.dataUrl : "";
  let base64Data = typeof photo.data === "string" ? photo.data : "";

  if (!base64Data && typeof photo.base64 === "string") {
    base64Data = photo.base64;
  }

  if (base64Data && base64Data.startsWith("data:")) {
    dataUrl = base64Data;
    base64Data = base64Data.split(",", 2)[1] || "";
  }

  if (!base64Data && dataUrl) {
    base64Data = dataUrl.split(",", 2)[1] || "";
  }

  if (!base64Data) return null;

  let contentType = "image/jpeg";
  if (typeof photo.contentType === "string") {
    contentType = photo.contentType;
  } else if (typeof photo.type === "string") {
    contentType = photo.type;
  } else if (dataUrl) {
    const match = dataUrl.match(/data:(.*);base64/);
    if (match?.[1]) {
      contentType = match[1];
    }
  }

  if (!dataUrl) {
    dataUrl = `data:${contentType};base64,${base64Data}`;
  }

  return {
    data: base64Data,
    contentType,
    dataUrl,
    filename: typeof photo.filename === "string" ? photo.filename : typeof photo.name === "string" ? photo.name : "",
    uploadedAt: photo.uploadedAt || photo.createdAt || null,
  };
};

const renderStaticStars = (rating) => {
  if (!rating) return null;
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
          fill={star <= rating ? "currentColor" : "none"}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
    </div>
  );
};

const UserReviewPage = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null); // { type: "success" | "error", message: string }
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingReviewPhotos, setExistingReviewPhotos] = useState([]);
  const [reviewPhotoUploads, setReviewPhotoUploads] = useState([]);

  const reviewPhotoUploadsRef = useRef([]);
  reviewPhotoUploadsRef.current = reviewPhotoUploads;

  const resetReviewPhotoUploads = useCallback(() => {
    setReviewPhotoUploads((prev) => {
      prev.forEach((item) => {
        if (item?.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      return [];
    });
  }, []);

  useEffect(() => {
    return () => {
      reviewPhotoUploadsRef.current.forEach((item) => {
        if (item?.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const completedCount = useMemo(
    () => bookings.filter((booking) => Boolean(booking.rating)).length,
    [bookings]
  );

  useEffect(() => {
    if (!user?.userId) return;

    const fetchCompletedBookings = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`/api/reviews`, {
          params: { userId: user.userId },
        });

        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const normalized = data.map((item) => {
          const rawId = item._id ?? item.id ?? item.bookingId;
          const idHex =
            typeof rawId === "string"
              ? rawId
              : rawId && rawId.$oid
              ? rawId.$oid
              : rawId && rawId.toString
              ? rawId.toString()
              : "";

          const serviceId = normalizeId(item.serviceId);
          const userId = normalizeId(item.userId);
        const reviewText = item.review ?? item.reviewDetail?.comment ?? "";
        const ratingValue = item.rating ?? item.reviewDetail?.rating ?? 0;
        const completionPhotos = Array.isArray(item.completionPhotos)
          ? item.completionPhotos.map(normalizeCompletionPhoto).filter(Boolean)
          : [];
        const reviewPhotos = Array.isArray(item.reviewDetail?.photos)
          ? item.reviewDetail.photos
              .map(normalizeCompletionPhoto)
              .filter(Boolean)
          : Array.isArray(item.reviewPhotos)
          ? item.reviewPhotos.map(normalizeCompletionPhoto).filter(Boolean)
          : [];

        return {
          ...item,
          _idHex: idHex, // <- เก็บไว้ชัดเจน
          bookingId: idHex, // <- ให้ bookingId เท่ากับ _idHex ไปเลย
          serviceId,
          userId,
          rating: ratingValue,
          review: reviewText,
          reviewedAt: item.reviewedAt ?? item.reviewDetail?.updatedAt ?? null,
          serviceDetails: item.serviceDetails ?? {},
          completionPhotos,
          reviewPhotos,
          completedAt: item.completedAt ?? item.completedDate ?? null,
        };
      });

        setBookings(normalized);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
        setError(
          err.response?.data?.message || "ไม่สามารถโหลดคำสั่งงานที่เสร็จสิ้นได้"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedBookings();
  }, [user]);

  const handleSelectBooking = (booking) => {
    if (!booking) return;
    resetReviewPhotoUploads();
    setSelectedBookingId(booking.bookingId);
    setRating(booking.rating || 0);
    setHoverRating(0);
    setComment(booking.review || "");
    setFeedback(null);
  };

  const selectedBooking = useMemo(
    () =>
      bookings.find((booking) => booking.bookingId === selectedBookingId) ||
      null,
    [bookings, selectedBookingId]
  );

  useEffect(() => {
    if (selectedBooking) {
      setExistingReviewPhotos(
        Array.isArray(selectedBooking.reviewPhotos)
          ? selectedBooking.reviewPhotos
          : []
      );
    } else {
      setExistingReviewPhotos([]);
    }
  }, [selectedBooking]);

  const handleRemoveExistingPhoto = (index) => {
    setExistingReviewPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRemoveNewPhoto = (index) => {
    setReviewPhotoUploads((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return next;
    });
  };

  const handleReviewPhotoChange = (event) => {
    const files = Array.from(event.target?.files || []);
    if (files.length === 0) return;

    setReviewPhotoUploads((prev) => {
      const totalExisting = existingReviewPhotos.length + prev.length;
      const remainingSlots = Math.max(0, MAX_REVIEW_PHOTOS - totalExisting);
      if (remainingSlots <= 0) {
        return prev;
      }

      const selectedFiles = files.slice(0, remainingSlots);
      const mapped = selectedFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...prev, ...mapped];
    });

    if (event.target) {
      event.target.value = "";
    }
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

  const prepareExistingPhotosForSubmit = () => {
    return existingReviewPhotos
      .map((photo) => {
        if (!photo) return null;

        let base64Data = "";
        if (typeof photo.data === "string" && photo.data.trim()) {
          base64Data = photo.data.trim();
        } else if (typeof photo.base64 === "string" && photo.base64.trim()) {
          base64Data = photo.base64.trim();
        } else if (typeof photo.dataUrl === "string" && photo.dataUrl.trim()) {
          const [, base64] = photo.dataUrl.split(",", 2);
          base64Data = base64 || "";
        }

        if (!base64Data) return null;

        let contentType = "image/jpeg";
        if (typeof photo.contentType === "string" && photo.contentType.trim()) {
          contentType = photo.contentType;
        } else if (typeof photo.type === "string" && photo.type.trim()) {
          contentType = photo.type;
        }

        return {
          data: base64Data,
          contentType,
          filename:
            typeof photo.filename === "string" && photo.filename.trim()
              ? photo.filename
              : typeof photo.name === "string" && photo.name.trim()
              ? photo.name
              : null,
          uploadedAt: photo.uploadedAt || photo.createdAt || new Date().toISOString(),
        };
      })
      .filter(Boolean);
  };

  const prepareReviewPhotosForSubmit = async () => {
    const existing = prepareExistingPhotosForSubmit();
    if (reviewPhotoUploads.length === 0) {
      return existing;
    }

    const preparedNew = await Promise.all(
      reviewPhotoUploads.map(async (item) => ({
        data: await fileToBase64(item.file),
        contentType: item.file.type || "image/jpeg",
        filename: item.file.name || null,
        size: item.file.size || null,
        uploadedAt: new Date().toISOString(),
      }))
    );

    return [...existing, ...preparedNew];
  };

  const handleCancelReview = () => {
    setSelectedBookingId(null);
    setRating(0);
    setHoverRating(0);
    setComment("");
    setFeedback(null);
    setExistingReviewPhotos([]);
    resetReviewPhotoUploads();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedBooking) {
      setFeedback({ type: "error", message: "กรุณาเลือกงานที่ต้องการรีวิว" });
      return;
    }

    if (!rating) {
      setFeedback({ type: "error", message: "กรุณาให้คะแนนก่อนส่งรีวิว" });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const photos = await prepareReviewPhotosForSubmit();
      if (photos.length > MAX_REVIEW_PHOTOS) {
        setFeedback({
          type: "error",
          message: `สามารถอัปโหลดรูปภาพได้สูงสุด ${MAX_REVIEW_PHOTOS} รูป`,
        });
        setSubmitting(false);
        return;
      }

      const payload = {
        bookingId: selectedBooking._idHex || selectedBooking.bookingId, // ใช้ _idHex ก่อน
        userId: user.userId,
        rating,
        comment,
        photos,
      };

      const response = await axios.post("/api/reviews", payload);

      const reviewDetailResponse = response.data?.review;
      const updatedReviewDetail = reviewDetailResponse
        ? {
            ...reviewDetailResponse,
            photos: Array.isArray(reviewDetailResponse.photos)
              ? reviewDetailResponse.photos
              : photos,
          }
        : {
            ...(selectedBooking.reviewDetail || {}),
            rating,
            comment,
            updatedAt: new Date().toISOString(),
            photos,
          };

      const updatedBooking = {
        ...selectedBooking,
        rating,
        review: comment,
        reviewedAt: new Date().toISOString(),
        reviewDetail: updatedReviewDetail,
        reviewPhotos: Array.isArray(response.data?.review?.photos)
          ? response.data.review.photos
              .map(normalizeCompletionPhoto)
              .filter(Boolean)
          : photos.map((photo) =>
              normalizeCompletionPhoto({ ...photo })
            ),
      };

      const normalizedReviewPhotos = Array.isArray(updatedBooking.reviewPhotos)
        ? updatedBooking.reviewPhotos
        : [];

      setBookings((prev) =>
        prev.map((booking) =>
          booking.bookingId === selectedBooking.bookingId
            ? updatedBooking
          : booking
        )
      );

      setExistingReviewPhotos(normalizedReviewPhotos);
      resetReviewPhotoUploads();

      setFeedback({
        type: "success",
        message: response.data?.message || "ส่งรีวิวเรียบร้อย",
      });
    } catch (err) {
      console.error("Submit review error", err);
      setFeedback({
        type: "error",
        message:
          err.response?.data?.message ||
          "ไม่สามารถส่งรีวิวได้ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderInteractiveStars = () => (
    <div className="flex items-center space-x-2">
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isActive = starValue <= (hoverRating || rating);
        return (
          <button
            key={starValue}
            type="button"
            className="focus:outline-none"
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(starValue)}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                isActive ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              }`}
              fill={isActive ? "currentColor" : "none"}
            />
          </button>
        );
      })}
    </div>
  );

  const getServiceTitle = (booking) =>
    booking?.serviceDetails?.name ||
    booking?.serviceName ||
    booking?.title ||
    "ไม่ระบุชื่อบริการ";

  const getSelectedOption = (booking) =>
    booking?.selectedOption ||
    booking?.serviceDetails?.serviceType ||
    "ไม่ระบุรายการ";

  const getAddress = (booking) =>
    booking?.customerLocation || booking?.address || "ไม่พบข้อมูลสถานที่";

  const getBookingDate = (booking) =>
    booking?.bookingDate ||
    booking?.date ||
    booking?.completedDate ||
    "ไม่ระบุวันที่";

  const getBookingTime = (booking) =>
    booking?.bookingTime || booking?.time || booking?.serviceTime || "";

  const getCompletionPhotoUrl = (photo) => {
    if (!photo) return "";
    if (typeof photo === "string") return photo;

    if (photo.dataUrl && typeof photo.dataUrl === "string") {
      return photo.dataUrl;
    }

    const rawData =
      typeof photo.data === "string"
        ? photo.data
        : typeof photo.base64 === "string"
        ? photo.base64
        : "";

    if (!rawData) return "";

    if (rawData.startsWith("data:")) {
      return rawData;
    }

    const contentType = photo.contentType || photo.type || "image/jpeg";
    return `data:${contentType};base64,${rawData}`;
  };

  const remainingPhotoSlots = Math.max(
    0,
    MAX_REVIEW_PHOTOS - (existingReviewPhotos.length + reviewPhotoUploads.length)
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            กรุณาเข้าสู่ระบบ
          </h2>
          <p className="text-gray-600">คุณต้องเข้าสู่ระบบเพื่อให้คะแนนรีวิว</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">รีวิวการใช้บริการ</h1>
          <p className="text-center mt-2 text-blue-100">
            ให้คะแนนและความคิดเห็นกับบริการที่คุณได้รับ
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  ประวัติการซ่อม
                </Link>
                <Link
                  href="/page/userreview"
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
                      d="M12 20.5l-3.09 1.626a1 1 0 01-1.451-1.054L8.273 17.5 5.2 14.878a1 1 0 01.554-1.706L9.5 12.5l1.382-3.372a1 1 0 011.836 0L14.1 12.5l3.746.672a1 1 0 01.554 1.706L15.327 17.5l.614 3.572a1 1 0 01-1.451 1.054L12 20.5z"
                    />
                  </svg>
                  รีวิวบริการ
                </Link>
              </nav>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                สรุปการรีวิว
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">รอการรีวิว</span>
                  <span className="font-semibold text-orange-600">
                    {bookings.filter((booking) => !booking.rating).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">รีวิวแล้ว</span>
                  <span className="font-semibold text-green-600">
                    {completedCount}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">งานทั้งหมด</span>
                  <span className="font-semibold text-blue-600">
                    {bookings.length}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:w-3/4 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    งานที่เสร็จสิ้น
                  </h2>
                  <p className="text-sm text-gray-500">
                    เลือกงานที่ต้องการให้คะแนนและส่งความคิดเห็น
                  </p>
                </div>
                {loading && (
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                )}
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 mb-4">
                  {error}
                </div>
              )}

              {!loading && bookings.length === 0 && !error && (
                <div className="text-center py-12">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    ยังไม่มีงานที่เสร็จสิ้น
                  </h3>
                  <p className="text-gray-500">
                    เมื่อมีงานเสร็จสิ้น คุณสามารถกลับมาให้คะแนนได้ที่นี่
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {bookings.map((booking) => {
                  const isSelected = booking.bookingId === selectedBookingId;
                  return (
                    <div
                      key={booking.bookingId}
                      className={`border rounded-lg p-5 transition-shadow ${
                        isSelected
                          ? "border-blue-500 shadow-lg"
                          : "border-gray-200 shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {getServiceTitle(booking)}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            รายการที่เลือก: {getSelectedOption(booking)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            comment: {booking.review || "-"}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {getBookingDate(booking)}
                              {getBookingTime(booking)
                                ? ` เวลา ${getBookingTime(booking)}`
                                : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {getAddress(booking)}
                            </span>
                          </div>
                          {Array.isArray(booking.completionPhotos) &&
                            booking.completionPhotos.length > 0 && (
                              <div className="mt-4">
                                <p className="text-xs font-medium text-gray-600 mb-2">
                                  รูปหลังทำความสะอาด
                                </p>
                                <div className="flex items-center gap-2">
                                  {booking.completionPhotos.slice(0, 3).map((photo, index) => {
                                    const preview = getCompletionPhotoUrl(photo);
                                    if (!preview) return null;
                                    return (
                                      <img
                                        key={`${booking.bookingId}-thumb-${index}`}
                                        src={preview}
                                        alt={`รูปหลังทำความสะอาด ${index + 1}`}
                                        className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                                      />
                                    );
                                  })}
                                  {booking.completionPhotos.length > 3 && (
                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                      +{booking.completionPhotos.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          {Array.isArray(booking.reviewPhotos) &&
                            booking.reviewPhotos.length > 0 && (
                              <div className="mt-4">
                                <p className="text-xs font-medium text-gray-600 mb-2">
                                  รูปจากรีวิวของคุณ
                                </p>
                                <div className="flex items-center gap-2">
                                  {booking.reviewPhotos.slice(0, 3).map((photo, index) => {
                                    const preview = getCompletionPhotoUrl(photo);
                                    if (!preview) return null;
                                    return (
                                      <img
                                        key={`${booking.bookingId}-review-thumb-${index}`}
                                        src={preview}
                                        alt={`รูปรีวิว ${index + 1}`}
                                        className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                                      />
                                    );
                                  })}
                                  {booking.reviewPhotos.length > 3 && (
                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                      +{booking.reviewPhotos.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                        <div className="text-right space-y-3">
                          {booking.rating ? (
                            <div className="inline-block">
                              {renderStaticStars(booking.rating)}
                              <p className="text-xs text-gray-500 mt-1">
                                รีวิวล่าสุด{" "}
                                {booking.reviewedAt
                                  ? new Date(
                                      booking.reviewedAt
                                    ).toLocaleDateString()
                                  : "-"}
                              </p>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 text-orange-500 bg-orange-50 px-3 py-1 rounded-full text-sm">
                              <MessageSquareText className="w-4 h-4" />
                              รอการรีวิว
                            </div>
                          )}
                          <button
                            onClick={() => handleSelectBooking(booking)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors w-full ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {booking.rating ? "แก้ไขรีวิว" : "ให้คะแนน"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedBooking && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      รีวิวบริการ: {getServiceTitle(selectedBooking)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getBookingDate(selectedBooking)}
                      {getBookingTime(selectedBooking)
                        ? ` เวลา ${getBookingTime(selectedBooking)}`
                        : ""}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>

                {Array.isArray(selectedBooking.completionPhotos) &&
                  selectedBooking.completionPhotos.length > 0 ? (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700">
                      รูปหลังทำความสะอาดจากทีมช่าง
                    </h4>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedBooking.completionPhotos.map((photo, index) => {
                        const preview = getCompletionPhotoUrl(photo);
                        if (!preview) return null;
                        return (
                          <div
                            key={`${selectedBooking.bookingId}-photo-${index}`}
                            className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-sm"
                          >
                            <img
                              src={preview}
                              alt={`รูปหลังทำความสะอาด ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-xs px-3 py-2 flex items-center justify-between gap-2">
                              <span>รูปที่ {index + 1}</span>
                              {photo.filename && (
                                <span className="truncate max-w-[60%] opacity-90">
                                  {photo.filename}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 border border-dashed border-gray-200 rounded-lg p-4 text-sm text-gray-500 bg-gray-50">
                    ยังไม่มีรูปหลังทำความสะอาดสำหรับงานนี้
                  </div>
                )}

                {Array.isArray(existingReviewPhotos) &&
                  existingReviewPhotos.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-700">
                        รูปจากรีวิวของคุณ
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        คุณสามารถลบรูปที่ไม่ต้องการได้ก่อนบันทึก
                      </p>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {existingReviewPhotos.map((photo, index) => {
                          const preview = getCompletionPhotoUrl(photo);
                          if (!preview) return null;
                          return (
                            <div
                              key={`existing-review-photo-${index}`}
                              className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-sm group"
                            >
                              <img
                                src={preview}
                                alt={`รูปรีวิว ${index + 1}`}
                                className="w-full h-48 object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingPhoto(index)}
                                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                aria-label="ลบรูปรีวิว"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-xs px-3 py-2 flex items-center justify-between gap-2">
                                <span>รูปที่ {index + 1}</span>
                                {photo.filename && (
                                  <span className="truncate max-w-[60%] opacity-90">
                                    {photo.filename}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">
                    อัปโหลดรูปภาพรีวิว (ไม่บังคับ)
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    อัปโหลดได้สูงสุด {MAX_REVIEW_PHOTOS} รูป (เหลือ {remainingPhotoSlots} รูป)
                  </p>
                  <div className="mt-3">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReviewPhotoChange}
                      disabled={remainingPhotoSlots <= 0}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-60"
                    />
                  </div>
                  {remainingPhotoSlots <= 0 && (
                    <p className="text-xs text-orange-500 mt-2">
                      คุณอัปโหลดรูปครบจำนวนสูงสุดแล้ว หากต้องการเพิ่มกรุณาลบรูปเดิมก่อน
                    </p>
                  )}
                  {reviewPhotoUploads.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {reviewPhotoUploads.map((item, index) => (
                        <div
                          key={`new-review-photo-${index}`}
                          className="relative rounded-lg overflow-hidden border border-dashed border-blue-200 bg-blue-50/60"
                        >
                          <img
                            src={item.previewUrl}
                            alt={`รูปใหม่ ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewPhoto(index)}
                            className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700"
                            aria-label="ลบรูปใหม่"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 inset-x-0 bg-blue-600/80 text-white text-xs px-3 py-2">
                            รูปใหม่ {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {feedback && (
                  <div
                    className={`p-4 mb-4 rounded-lg border ${
                      feedback.type === "success"
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}
                  >
                    {feedback.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ให้คะแนนบริการ
                    </label>
                    {renderInteractiveStars()}
                  </div>

                  <div>
                    <label
                      htmlFor="comment"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      ความคิดเห็นเพิ่มเติม
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 text-gray-700"
                      placeholder="บอกเราหน่อยว่าประสบการณ์ของคุณเป็นอย่างไร"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                      onClick={handleCancelReview}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      บันทึกรีวิว
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReviewPage;
