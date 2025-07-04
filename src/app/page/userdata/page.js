"use client";
import Image from "next/image";
import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/app/context/AuthContext.js";

const UserData = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    avatar: null
  });

  // แยกชื่อจาก name field (ถ้ามี)
  const parseFullName = (fullName) => {
    if (!fullName) return { firstName: "", lastName: "" };
    const parts = fullName.trim().split(" ");
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || ""
    };
  };

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      // ถ้ามี firstName และ lastName ใช้ตรงๆ
      // ถ้าไม่มี ให้แยกจาก name field
      const { firstName, lastName } = user.firstName && user.lastName 
        ? { firstName: user.firstName, lastName: user.lastName }
        : parseFullName(user.name);

      setFormData({
        firstName: firstName || "",
        lastName: lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        imageUrl: user.imageUrl || user.avatar || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "avatar" && formData[key] instanceof File) {
          formDataToSend.append("avatar", formData[key]);
        } else if (key !== "avatar") {
          formDataToSend.append(key, formData[key]);
        }
      });

      const res = await fetch("/api/user/update", {
        method: "PUT",
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("อัปเดตข้อมูลสำเร็จ");
        setIsEditing(false);
        if (updateUser) {
          updateUser(data.user);
        }
      } else {
        setMessage(data.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
      }
    } catch (error) {
      console.error("Update failed:", error);
      setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      const { firstName, lastName } = user.firstName && user.lastName 
        ? { firstName: user.firstName, lastName: user.lastName }
        : parseFullName(user.name);

      setFormData({
        firstName: firstName || "",
        lastName: lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        avatar: null
      });
    }
    setIsEditing(false);
    setMessage("");
  };

  // ได้รับข้อมูลชื่อสำหรับแสดงผล
  const getDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.trim()} ${user.lastName.trim()}`.trim();
    }
    if (user.name) {
      return user.name.trim();
    }
    return user.email;
  };

  const getFirstName = () => {
    if (user.firstName) return user.firstName.trim();
    if (user.name) return parseFullName(user.name).firstName;
    return "";
  };

  const getLastName = () => {
    if (user.lastName) return user.lastName.trim();
    if (user.name) return parseFullName(user.name).lastName;
    return "";
  };

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
          <p className="text-gray-600">คุณต้องเข้าสู่ระบบเพื่อดูข้อมูลส่วนตัว</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">ข้อมูลผู้ใช้งาน</h1>
            <p className="text-blue-100">จัดการข้อมูลส่วนตัวของคุณ</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">เมนูหลัก</h2>
              <nav className="space-y-2">
                <Link
                  href="/page/userdata"
                  className="flex items-center px-4 py-3 text-blue-600 bg-blue-50 rounded-lg font-medium"
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
                  href="/pageuser/history"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ประวัติการซ่อม
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <Image
                        src={user.avatar || user.imageUrl || "/navbar-img/user1.jpg"}
                        alt="User Avatar"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {getDisplayName() || "ผู้ใช้งาน"}
                      </h2>
                      <p className="text-blue-100">{user.email}</p>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-blue-100 text-sm">ออนไลน์</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-all duration-200 border border-white/30"
                  >
                    {isEditing ? "ยกเลิก" : "แก้ไขข้อมูล"}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {message && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    message.includes("สำเร็จ") 
                      ? "bg-green-50 text-green-800 border border-green-200" 
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${
                        message.includes("สำเร็จ") ? "bg-green-500" : "bg-red-500"
                      }`}></div>
                      {message}
                    </div>
                  </div>
                )}

                {!isEditing ? (
                  // View Mode
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          ชื่อ
                        </label>
                        <p className="text-lg text-gray-900">
                          {getFirstName() || "ไม่ได้ระบุ"}
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          นามสกุล
                        </label>
                        <p className="text-lg text-gray-900">
                          {getLastName() || "ไม่ได้ระบุ"}
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          อีเมล
                        </label>
                        <p className="text-lg text-gray-900">
                          {user.email || "ไม่ได้ระบุ"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          เบอร์โทรศัพท์
                        </label>
                        <p className="text-lg text-gray-900">
                          {user.phone || "ไม่ได้ระบุ"}
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          ที่อยู่
                        </label>
                        <p className="text-lg text-gray-900">
                          {user.location || "ไม่ได้ระบุ"}
                        </p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          สถานะ
                        </label>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-green-700 font-medium">ใช้งานอยู่</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit Mode
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ชื่อ
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="กรอกชื่อของคุณ"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            นามสกุล
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="กรอกนามสกุลของคุณ"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            อีเมล
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="กรอกอีเมลของคุณ"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            เบอร์โทรศัพท์
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="กรอกเบอร์โทรศัพท์"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ที่อยู่
                          </label>
                          <textarea
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="กรอกที่อยู่ของคุณ"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            รูปโปรไฟล์
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserData;