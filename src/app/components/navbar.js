"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const Navbar = () => {
  // State to track if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Mock user data
  const userData = {
    name: "คุณ วิภาวรรณ์สง",
    avatar: "/navbar-img/user-avatar.jpg" // You'll need to add this image
  };

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      message: "คำขอบริการของคุณได้รับการอนุมัติแล้ว",
      time: "2 ชั่วโมงที่แล้ว",
      isRead: false
    },
    {
      id: 2,
      message: "มีช่างเทคนิคกำลังเดินทางไปยังสถานที่ของคุณ",
      time: "5 ชั่วโมงที่แล้ว",
      isRead: false
    },
    {
      id: 3,
      message: "งานซ่อมแซมเสร็จสิ้นแล้ว",
      time: "1 วันที่แล้ว",
      isRead: true
    }
  ];

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowNotifications(false);
    setShowUserMenu(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false); // Close user menu when opening notifications
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false); // Close notifications when opening user menu
  };

  return (
    <div className="w-full h-[60px] shadow-2xl relative">
      <div className="p-5 sm:px-28 lg:px-36 flex justify-between items-center">
        <div className="flex justify-center items-center gap-5">
            <Link href="/">
             <Image src="/navbar-img/logo.PNG" alt="HomeServices Logo" width={127} height={25} />
            </Link>
         
          <Link href="/"><p className="text-sm">บริการของเรา</p></Link>
        </div>

        <div className="flex flex-row justify-center items-center gap-3.5">
          {!isLoggedIn ? (
            // Login Button
            <button 
              onClick={handleLogin}
              className="w-[80px] h-[30px] border-[#336DF2] border-2 rounded-lg text-[#336DF2] text-sm hover:bg-[#336DF2] hover:text-white transition-colors"
            >
              เข้าสู่ระบบ
            </button>
          ) : (
            // User Section (After Login)
            <div className="flex items-center gap-3">
              {/* User Name */}
              <span className="text-sm text-gray-700 max-sm:hidden">{userData.name}</span>
              
              {/* User Avatar - Clickable */}
              <div className="relative">
                <button 
                  onClick={toggleUserMenu}
                  className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-300 transition-all"
                >
                  <Image 
                    // src={userData.avatar} 
                    src="/navbar-img/user1.jpg"
                    alt="User Avatar" 
                    width={32} 
                    height={32}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to default avatar if image fails to load
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                    }}
                  />
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <Image 
                            // src={userData.avatar}
                            src="/navbar-img/user1.jpg" 
                            alt="User Avatar" 
                            width={32} 
                            height={32}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-800">{userData.name}</p>
                          <p className="text-xs text-gray-500">ผู้ใช้งาน</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <button 
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => {
                          setShowUserMenu(false);
                          // Add your edit profile logic here
                          console.log('Edit profile clicked');
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5"></path>
                          <path d="M16 2l3 3L8 16l-4 1 1-4L16 2z"></path>
                        </svg>
                        แก้ไขข้อมูลผู้ใช้
                      </button>
                      
                      <button 
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        onClick={handleLogout}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16,17 21,12 16,7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={toggleNotifications}
                  className="relative p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-gray-600"
                  >
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                  </svg>
                  {/* Notification Badge */}
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-800">การแจ้งเตือน</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.isRead ? 'bg-blue-50' : ''
                            }`}
                          >
                            <p className="text-sm text-gray-800 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {notification.time}
                            </p>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          ไม่มีการแจ้งเตือน
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-gray-200 text-center">
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        ดูทั้งหมด
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close notifications when clicking outside */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
    </div>
  );
};

export default Navbar;