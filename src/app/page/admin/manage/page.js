"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

// Notification Component
const Notification = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 animate-slide-in">
      <div
        className={`max-w-md w-full border rounded-lg shadow-lg p-4 ${getTypeStyles()}`}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Dialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full animate-scale-in">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">{title}</h3>
        </div>

        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

// Add User Modal Component
const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    image: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("firstName", formData.firstName);
      submitData.append("lastName", formData.lastName);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("phone", formData.phone);
      submitData.append("location", formData.location);
      if (formData.image) {
        submitData.append("image", formData.image);
      }

      const response = await fetch("/api/register", {
        method: "POST",
        body: submitData,
      });

      if (response.ok) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phone: "",
          location: "",
          image: null,
        });
        setImagePreview(null);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-opacity-20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">เพิ่มผู้ใช้ใหม่</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รูปภาพ
            </label>
            <div className="flex items-center space-x-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover border"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                นามสกุล
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              อีเมล
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่าน
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ที่อยู่
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>กำลังสร้าง...</span>
                </>
              ) : (
                <span>สร้างผู้ใช้</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Mobile User Card Component
const MobileUserCard = ({ user, primaryRole, onRoleChange, onDeleteUser }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-center mb-3">
        <div className="h-12 w-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-blue-600 font-medium text-sm">
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </span>
          )}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-xs text-gray-500 truncate">{user.phone}</div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDeleteUser(user._id)}
            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">อีเมล:</span>
          <span className="text-sm text-gray-900 truncate ml-2">
            {user.email}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">ที่อยู่:</span>
          <span className="text-sm text-gray-900 truncate ml-2">
            {user.location}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">สถานะ:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ใช้งาน
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Role:</span>
          <select
            value={primaryRole || "user"}
            onChange={(e) => onRoleChange(user._id, e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="worker">Worker</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [workerOverview, setWorkerOverview] = useState({
    workers: [],
    reviewCount: 0,
    loading: true,
    error: null,
  });
  const [notification, setNotification] = useState({
    message: "",
    type: "success",
    isVisible: false,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    userId: null,
    title: "",
    message: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const normalizeId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value.$oid) return value.$oid;
      if (typeof value.toString === "function") {
        const stringified = value.toString();
        if (stringified && stringified !== "[object Object]") {
          return stringified;
        }
      }
    }
    return String(value);
  };

  const normalizeStatus = (value) => {
    const status = String(value || "").toLowerCase();
    if (!status) return "other";
    if (["pending", "รอดำเนินการ"].includes(status)) return "pending";
    if (["accepted", "กำลังดำเนินการ", "กำลังทำ", "in progress"].includes(status))
      return "accepted";
    if (["completed", "เสร็จสิ้น", "จบงาน", "สำเร็จ"].includes(status))
      return "completed";
    if (["rejected", "ยกเลิก", "ถูกยกเลิก", "cancelled", "canceled"].includes(status))
      return "rejected";
    return "other";
  };

  const toArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.results)) return data.results;
      if (Array.isArray(data.items)) return data.items;
    }
    return [];
  };

  const resolvePrimaryRole = (role) => {
    if (Array.isArray(role)) {
      if (role.includes("admin")) return "admin";
      if (role.includes("worker")) return "worker";
      return role[0] || "user";
    }
    return role || "user";
  };

  const hasRole = (role, value) =>
    Array.isArray(role) ? role.includes(value) : role === value;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setWorkerOverview((prev) => ({ ...prev, loading: true, error: null }));

      const [usersRes, bookingsRes] = await Promise.all([
        axios.get("/api/users"),
        axios.get("/api/bookings"),
      ]);

      const usersData = toArray(usersRes.data);
      const bookingsData = toArray(bookingsRes.data);

      setUsers(usersData);

      const workerUsers = usersData.filter((user) =>
        Array.isArray(user.role)
          ? user.role.includes("worker")
          : user.role === "worker"
      );

      const workerBaseEntries = workerUsers
        .map((worker) => {
          const workerId = normalizeId(worker._id);
          if (!workerId) return null;
          const nameParts = [worker.firstName, worker.lastName]
            .filter(Boolean)
            .join(" ");
          return [
            workerId,
            {
              workerId,
              name: nameParts || worker.email || "ไม่ทราบชื่อ",
              phone: worker.phone || "",
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
      const collator = new Intl.Collator("th-TH");

      let totalRatingCount = 0;

      bookingsData.forEach((booking) => {
        const normalizedStatus = normalizeStatus(booking.status);
        const workerId = normalizeId(booking.assignedTo);

        if (workerId) {
          if (!workerStatsMap.has(workerId)) {
            workerStatsMap.set(workerId, {
              workerId,
              name:
                booking.assignedToName ||
                booking.workerName ||
                "ไม่พบข้อมูลพนักงาน",
              phone: booking.workerPhone || "",
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
          if (normalizedStatus === "pending") stats.pending += 1;
          if (normalizedStatus === "accepted") stats.accepted += 1;
          if (normalizedStatus === "completed") stats.completed += 1;
          if (normalizedStatus === "rejected") stats.rejected += 1;

          const ratingSource =
            booking.rating ?? booking.reviewDetail?.rating ?? booking.review?.rating;
          const ratingValue = Number(ratingSource);
          if (Number.isFinite(ratingValue) && ratingValue > 0) {
            stats.ratingTotal += ratingValue;
            stats.ratingCount += 1;
            totalRatingCount += 1;
          }
        }
      });

      const workers = Array.from(workerStatsMap.values())
        .map((stats) => ({
          workerId: stats.workerId,
          name: stats.name,
          phone: stats.phone,
          total: stats.total,
          pending: stats.pending,
          accepted: stats.accepted,
          completed: stats.completed,
          rejected: stats.rejected,
          ratingCount: stats.ratingCount,
          averageRating:
            stats.ratingCount > 0 ? stats.ratingTotal / stats.ratingCount : 0,
        }))
        .sort((a, b) => {
          if (b.total !== a.total) return b.total - a.total;
          return collator.compare(a.name || "", b.name || "");
        });

      setWorkerOverview({
        workers,
        reviewCount: totalRatingCount,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error loading user or booking data:", error);
      showNotification("ไม่สามารถโหลดข้อมูลผู้ใช้ได้", "error");
      setWorkerOverview((prev) => ({
        ...prev,
        loading: false,
        error: "ไม่สามารถโหลดข้อมูลพนักงานได้",
      }));
    }
  };

  const filteredUsers = users.filter((user) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return true;

    const name = `${user.firstName || ""} ${user.lastName || ""}`
      .trim()
      .toLowerCase();
    const email = String(user.email ?? "").toLowerCase();
    const phone = String(user.phone ?? "").toLowerCase();

    return (
      name.includes(normalizedSearch) ||
      email.includes(normalizedSearch) ||
      phone.includes(normalizedSearch)
    );
  });

  const workerSummary = useMemo(() => {
    return workerOverview.workers.reduce(
      (acc, worker) => {
        acc.total += worker.total || 0;
        acc.pending += worker.pending || 0;
        acc.accepted += worker.accepted || 0;
        acc.completed += worker.completed || 0;
        acc.rejected += worker.rejected || 0;
        return acc;
      },
      { total: 0, pending: 0, accepted: 0, completed: 0, rejected: 0 }
    );
  }, [workerOverview.workers]);

  const showNotification = (message, type = "success") => {
    setNotification({
      message,
      type,
      isVisible: true,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`/api/user/${userId}`, { role: newRole });
      showNotification("อัปเดต role สำเร็จ", "success");
      fetchUsers();
    } catch (err) {
      showNotification("อัปเดต role ไม่สำเร็จ", "error");
      console.error(err);
    }
  };

  const handleDeleteUser = (userId) => {
    setConfirmDialog({
      isOpen: true,
      userId,
      title: "ยืนยันการลบผู้ใช้",
      message:
        "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
    });
  };

  const confirmDeleteUser = async () => {
    try {
      await axios.delete(`/api/user/${confirmDialog.userId}`);
      showNotification("ลบผู้ใช้สำเร็จ", "success");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err.response?.data || err.message);
      showNotification(
        `ลบผู้ใช้ไม่สำเร็จ: ${err.response?.data?.message || err.message}`,
        "error"
      );
    }
    setConfirmDialog({ isOpen: false, userId: null, title: "", message: "" });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, userId: null, title: "", message: "" });
  };

  const handleAddUserSuccess = () => {
    showNotification("เพิ่มผู้ใช้สำเร็จ", "success");
    fetchUsers();
  };

  return (
    <>
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  User Management
                </h1>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <span className="text-sm sm:text-base">เพิ่มผู้ใช้ใหม่</span>
                <span className="text-lg">+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
          <section className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-lg shadow-slate-200/70">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  ภาพรวมงานของพนักงานภาคสนาม
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  ตรวจสอบสถานะงานของพนักงาน พร้อมจำนวนรีวิวจากลูกค้าแบบเรียลไทม์
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
                <svg className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11.48 3.499a.562.562 0 011.04 0l1.18 3.63a.563.563 0 00.532.39h3.813a.563.563 0 01.332 1.017l-3.08 2.24a.563.563 0 00-.204.631l1.18 3.63a.563.563 0 01-.865.631l-3.08-2.24a.563.563 0 00-.66 0l-3.08 2.24a.563.563 0 01-.865-.631l1.18-3.63a.563.563 0 00-.204-.631l-3.08-2.24a.563.563 0 01.332-1.017h3.813a.563.563 0 00.532-.39l1.18-3.63z"
                  />
                </svg>
                <span>
                  รีวิวทั้งหมด {" "}
                  {workerOverview.loading
                    ? "…"
                    : `${workerOverview.reviewCount.toLocaleString("th-TH")} รายการ`}
                </span>
              </div>
            </div>

            {workerOverview.loading ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center text-sm text-slate-500">
                กำลังโหลดข้อมูลพนักงาน...
              </div>
            ) : workerOverview.error ? (
              <div className="mt-6 rounded-2xl border border-dashed border-rose-200 bg-rose-50/80 px-6 py-10 text-center text-sm text-rose-600">
                {workerOverview.error}
              </div>
            ) : workerOverview.workers.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center text-sm text-slate-500">
                ยังไม่มีการมอบหมายงานให้พนักงาน
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-2xl bg-slate-900/90 px-4 py-4 text-white shadow-lg">
                    <span className="text-xs uppercase tracking-wide text-slate-200">งานทั้งหมด</span>
                    <div className="mt-2 text-2xl font-semibold">
                      {workerSummary.total.toLocaleString("th-TH")}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-amber-100 px-4 py-4 text-amber-800">
                    <span className="text-xs uppercase tracking-wide text-amber-700">รอดำเนินการ</span>
                    <div className="mt-2 text-2xl font-semibold">
                      {workerSummary.pending.toLocaleString("th-TH")}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-sky-100 px-4 py-4 text-sky-800">
                    <span className="text-xs uppercase tracking-wide text-sky-700">กำลังทำ</span>
                    <div className="mt-2 text-2xl font-semibold">
                      {workerSummary.accepted.toLocaleString("th-TH")}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-emerald-100 px-4 py-4 text-emerald-800">
                    <span className="text-xs uppercase tracking-wide text-emerald-700">จบงาน</span>
                    <div className="mt-2 text-2xl font-semibold">
                      {workerSummary.completed.toLocaleString("th-TH")}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-rose-100 px-4 py-4 text-rose-800">
                    <span className="text-xs uppercase tracking-wide text-rose-700">ยกเลิก</span>
                    <div className="mt-2 text-2xl font-semibold">
                      {workerSummary.rejected.toLocaleString("th-TH")}
                    </div>
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">พนักงาน</th>
                        <th className="px-4 py-3 text-center">งานทั้งหมด</th>
                        <th className="px-4 py-3 text-center">รอดำเนินการ</th>
                        <th className="px-4 py-3 text-center">กำลังทำ</th>
                        <th className="px-4 py-3 text-center">จบงาน</th>
                        <th className="px-4 py-3 text-center">ยกเลิก</th>
                        <th className="px-4 py-3 text-center">คะแนนรีวิว</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {workerOverview.workers.map((worker) => (
                        <tr
                          key={worker.workerId || worker.name}
                          className="bg-white transition-colors even:bg-slate-50/60 hover:bg-slate-100/60"
                        >
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="font-semibold text-slate-900">{worker.name}</div>
                            {worker.phone && (
                              <div className="text-xs text-slate-500">{worker.phone}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex min-w-[3rem] justify-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                              {Number(worker.total || 0).toLocaleString("th-TH")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex min-w-[3rem] justify-center rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                              {Number(worker.pending || 0).toLocaleString("th-TH")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex min-w-[3rem] justify-center rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                              {Number(worker.accepted || 0).toLocaleString("th-TH")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex min-w-[3rem] justify-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                              {Number(worker.completed || 0).toLocaleString("th-TH")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex min-w-[3rem] justify-center rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-700">
                              {Number(worker.rejected || 0).toLocaleString("th-TH")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {worker.ratingCount > 0 ? (
                              <div className="inline-flex flex-col items-center gap-1">
                                <span className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M11.48 3.499a.562.562 0 011.04 0l1.18 3.63a.563.563 0 00.532.39h3.813a.563.563 0 01.332 1.017l-3.08 2.24a.563.563 0 00-.204.631l1.18 3.63a.563.563 0 01-.865.631l-3.08-2.24a.563.563 0 00-.66 0l-3.08 2.24a.563.563 0 01-.865-.631l1.18-3.63a.563.563 0 00-.204-.631l-3.08-2.24a.563.563 0 01.332-1.017h3.813a.563.563 0 00.532-.39l1.18-3.63z"
                                    />
                                  </svg>
                                  {Number(worker.averageRating || 0).toFixed(1)}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {Number(worker.ratingCount || 0).toLocaleString("th-TH")} รีวิว
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">ยังไม่มีรีวิว</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="relative flex-1 sm:flex-initial">
                  <input
                    type="text"
                    placeholder="ค้นหาผู้ใช้งาน..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-sm text-gray-500 text-center sm:text-left">
                  ทั้งหมด {filteredUsers.length} ผู้ใช้งาน
                </div>
              </div>
            </div>

            {/* Mobile View - Cards */}
            <div className="block lg:hidden">
              <div className="p-4">
                {filteredUsers.map((user) => (
                  <MobileUserCard
                    key={user._id}
                    user={user}
                    primaryRole={resolvePrimaryRole(user.role)}
                    onRoleChange={handleRoleChange}
                    onDeleteUser={handleDeleteUser}
                  />
                ))}
              </div>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชื่อผู้ใช้
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      อีเมล
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เปลี่ยน Role
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0">
                            {user.imageUrl ? (
                              <img
                                src={user.imageUrl}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-blue-600 font-medium text-sm">
                                {user.firstName.charAt(0)}
                                {user.lastName.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ใช้งาน
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            hasRole(user.role, "admin")
                              ? "bg-purple-100 text-purple-800"
                              : hasRole(user.role, "worker")
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {hasRole(user.role, "admin")
                            ? "Admin"
                            : hasRole(user.role, "worker")
                            ? "Worker"
                            : "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={resolvePrimaryRole(user.role)}
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="worker">Worker</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {/* <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button> */}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modals and Notifications */}
      <Notification {...notification} onClose={hideNotification} />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmDeleteUser}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddUserSuccess}
      />
    </>
  );
}
