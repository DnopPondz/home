"use client";
import Link from "next/link";
import Image from "next/image";
import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsError, setNotificationsError] = useState(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";

    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60 * 1000) {
      return "เมื่อสักครู่";
    }

    const diffMinutes = Math.floor(diffMs / (60 * 1000));
    if (diffMinutes < 60) {
      return `${diffMinutes} นาทีที่แล้ว`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} ชั่วโมงที่แล้ว`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays} วันที่แล้ว`;
    }

    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (!user?.userId) {
      setNotifications([]);
      return;
    }

    let isMounted = true;
    let isLoading = false;
    let intervalId;

    const fetchNotifications = async () => {
      if (isLoading) return;
      isLoading = true;
      try {
        setNotificationsError(null);
        const res = await fetch(`/api/notifications/${user.userId}`);
        if (!res.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลการแจ้งเตือนได้");
        }
        const data = await res.json();
        const payload = Array.isArray(data)
          ? data
          : Array.isArray(data.notifications)
          ? data.notifications
          : [];

        if (isMounted) {
          setNotifications(payload);
        }
      } catch (error) {
        if (isMounted) {
          setNotificationsError(error.message);
        }
      } finally {
        isLoading = false;
      }
    };

    fetchNotifications();
    intervalId = setInterval(fetchNotifications, 10000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [user?.userId]);

  const markNotificationsAsRead = async () => {
    if (!user?.userId || notificationsError) return;
    const unreadIds = notifications
      .filter((notification) => !notification.read)
      .map((notification) => notification._id)
      .filter(Boolean);

    if (unreadIds.length === 0) return;

    try {
      await fetch(`/api/notifications/${user.userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds: unreadIds }),
      });
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const toggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    setShowUserMenu(false);

    if (nextState) {
      await markNotificationsAsRead();
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        logout(); // ล้าง context
        window.location.href = data.redirectTo; // redirect หน้า login
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <div className="w-full h-[65px] shadow-xl relative bg-white">
        <div className="max-w-[1920px] mx-auto px-5 sm:px-28 lg:px-36 xl:px-48 2xl:px-64 flex justify-between items-center h-full">
          <div className="flex justify-center items-center gap-5">
            <Link href="/">
              <Image
                src="/navbar-img/logo.jpg"
                alt="HomeServices Logo"
                width={150}
                height={25}
              />
            </Link>
            <Link href="/page/servicehub">
              <p className="text-sm min-lg:text-[16px] cursor-pointer hover:text-[#336DF2] transition-colors">
                บริการของเรา
              </p>
            </Link>
          </div>

          <div className="flex flex-row justify-center items-center gap-3.5">
            {!user ? (
              <Link
                href="/page/login"
                className="w-[80px] h-[30px] border-[#336DF2] border-2 rounded-lg text-[#336DF2] text-sm text-center hover:bg-[#336DF2] hover:text-white transition-colors flex items-center justify-center"
              >
                เข้าสู่ระบบ
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 max-sm:hidden">
                  {user.name || `${user.firstName} ${user.lastName}`}
                </span>

                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-300 transition-all"
                  >
                    <Image
                      src={user.avatar || "/navbar-img/user1.jpg"}
                      alt="User Avatar"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transform translate-x-0">
                      <div className="p-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={user.avatar || "/navbar-img/user1.jpg"}
                              alt="User Avatar"
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">
                              {user.name ||
                                `${user.firstName} ${user.lastName}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/page/userdata"
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          ข้อมูลผู้ใช้
                        </Link>
                        <Link
                          href="/page/userlist"
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setShowUserMenu(false);
                          }}
                          onClick={() => setShowUserMenu(false)}
                        >
                          รายการคำสั่งซ่อม
                        </Link>
                        <Link
                          href="/page/userhistory"
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setShowUserMenu(false);
                          }}
                          onClick={() => setShowUserMenu(false)}
                        >
                          ประวัติการซ่อม
                        </Link>
                        <Link
                          href="/page/userreview"
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setShowUserMenu(false);
                          }}
                          onClick={() => setShowUserMenu(false)}
                        >
                          รีวิวบริการ
                        </Link>
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout(); // เรียก API Logout
                          }}
                        >
                          ออกจากระบบ
                        </button>
                      </div>
                    </div>
                  )}
                </div>

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
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 transform translate-x-0">
                      <div className="p-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800">
                          การแจ้งเตือน
                        </h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notificationsError && (
                          <div className="p-4 text-center text-red-500 text-sm">
                            {notificationsError}
                          </div>
                        )}
                        {!notificationsError ? (
                          notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div
                                key={notification._id || notification.id}
                                className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                  !notification.read ? "bg-blue-50" : ""
                                }`}
                              >
                                <p className="text-sm text-gray-800 mb-1">
                                  {notification.message || "มีการอัปเดตใหม่"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              ไม่มีการแจ้งเตือน
                            </div>
                          )
                        ) : null}
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
      </div>

      {/* Overlay for closing dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        ></div>
      )}
    </>
  );
};

export default Navbar;
