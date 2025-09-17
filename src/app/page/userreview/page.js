"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
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

const renderStaticStars = (rating) => {
  if (!rating) return null;
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
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
          const bookingId = normalizeId(item._id ?? item.id ?? item.bookingId);
          const serviceId = normalizeId(item.serviceId);
          const userId = normalizeId(item.userId);
          const reviewText = item.review ?? item.reviewDetail?.comment ?? "";
          const ratingValue = item.rating ?? item.reviewDetail?.rating ?? 0;
          return {
            ...item,
            bookingId,
            serviceId,
            userId,
            rating: ratingValue,
            review: reviewText,
            reviewedAt: item.reviewedAt ?? item.reviewDetail?.updatedAt ?? null,
            serviceDetails: item.serviceDetails ?? {},
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
    setSelectedBookingId(booking.bookingId);
    setRating(booking.rating || 0);
    setHoverRating(0);
    setComment(booking.review || "");
    setFeedback(null);
  };

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.bookingId === selectedBookingId) || null,
    [bookings, selectedBookingId]
  );

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
      const payload = {
        bookingId: selectedBooking.bookingId,
        userId: user.userId,
        rating,
        comment,
      };

      const response = await axios.post("/api/reviews", payload);

      const updatedBooking = {
        ...selectedBooking,
        rating,
        review: comment,
        reviewedAt: new Date().toISOString(),
        reviewDetail: response.data?.review ?? selectedBooking.reviewDetail,
      };

      setBookings((prev) =>
        prev.map((booking) =>
          booking.bookingId === selectedBooking.bookingId ? updatedBooking : booking
        )
      );

      setFeedback({ type: "success", message: response.data?.message || "ส่งรีวิวเรียบร้อย" });
    } catch (err) {
      console.error("Submit review error", err);
      setFeedback({
        type: "error",
        message:
          err.response?.data?.message || "ไม่สามารถส่งรีวิวได้ กรุณาลองใหม่อีกครั้ง",
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
    booking?.serviceDetails?.name || booking?.serviceName || booking?.title || "ไม่ระบุชื่อบริการ";

  const getSelectedOption = (booking) =>
    booking?.selectedOption || booking?.serviceDetails?.serviceType || "ไม่ระบุรายการ";

  const getAddress = (booking) =>
    booking?.customerLocation || booking?.address || "ไม่พบข้อมูลสถานที่";

  const getBookingDate = (booking) =>
    booking?.bookingDate || booking?.date || booking?.completedDate || "ไม่ระบุวันที่";

  const getBookingTime = (booking) =>
    booking?.bookingTime || booking?.time || booking?.serviceTime || "";

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">กรุณาเข้าสู่ระบบ</h2>
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
          <p className="text-center mt-2 text-blue-100">ให้คะแนนและความคิดเห็นกับบริการที่คุณได้รับ</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">เมนูหลัก</h2>
              <nav className="space-y-2">
                <Link
                  href="/page/userdata"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  ข้อมูลผู้ใช้งาน
                </Link>
                <Link
                  href="/page/userlist"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
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
                <Link
                  href="/page/userreview"
                  className="flex items-center px-4 py-3 text-blue-600 bg-blue-50 rounded-lg font-medium"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20.5l-3.09 1.626a1 1 0 01-1.451-1.054L8.273 17.5 5.2 14.878a1 1 0 01.554-1.706L9.5 12.5l1.382-3.372a1 1 0 011.836 0L14.1 12.5l3.746.672a1 1 0 01.554 1.706L15.327 17.5l.614 3.572a1 1 0 01-1.451 1.054L12 20.5z" />
                  </svg>
                  รีวิวบริการ
                </Link>
              </nav>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">สรุปการรีวิว</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">รอการรีวิว</span>
                  <span className="font-semibold text-orange-600">
                    {bookings.filter((booking) => !booking.rating).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">รีวิวแล้ว</span>
                  <span className="font-semibold text-green-600">{completedCount}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">งานทั้งหมด</span>
                  <span className="font-semibold text-blue-600">{bookings.length}</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="lg:w-3/4 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">งานที่เสร็จสิ้น</h2>
                  <p className="text-sm text-gray-500">
                    เลือกงานที่ต้องการให้คะแนนและส่งความคิดเห็น
                  </p>
                </div>
                {loading && <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />}
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
                  <p className="text-gray-500">เมื่อมีงานเสร็จสิ้น คุณสามารถกลับมาให้คะแนนได้ที่นี่</p>
                </div>
              )}

              <div className="space-y-4">
                {bookings.map((booking) => {
                  const isSelected = booking.bookingId === selectedBookingId;
                  return (
                    <div
                      key={booking.bookingId}
                      className={`border rounded-lg p-5 transition-shadow ${
                        isSelected ? "border-blue-500 shadow-lg" : "border-gray-200 shadow-sm"
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
                          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {getBookingDate(booking)}
                              {getBookingTime(booking) ? ` เวลา ${getBookingTime(booking)}` : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {getAddress(booking)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-3">
                          {booking.rating ? (
                            <div className="inline-block">
                              {renderStaticStars(booking.rating)}
                              <p className="text-xs text-gray-500 mt-1">
                                รีวิวล่าสุด {booking.reviewedAt ? new Date(booking.reviewedAt).toLocaleDateString() : "-"}
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
                              isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                      {getBookingTime(selectedBooking) ? ` เวลา ${getBookingTime(selectedBooking)}` : ""}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
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
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
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
                      onClick={() => {
                        setSelectedBookingId(null);
                        setRating(0);
                        setComment("");
                        setFeedback(null);
                      }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
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
