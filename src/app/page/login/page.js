"use client";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import Link from "next/link";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="fixed inset-0  backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-700 font-['Prompt'] text-lg">กำลังเข้าสู่ระบบ...</p>
    </div>
  </div>
);

// Success/Error Icon Component
const StatusIcon = ({ type }) => {
  if (type === 'success') {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p className="text-green-700 font-['Prompt'] text-lg">เข้าสู่ระบบสำเร็จ!</p>
        </div>
      </div>
    );
  }
  
  if (type === 'error') {
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <p className="text-red-700 font-['Prompt'] text-lg">เข้าสู่ระบบไม่สำเร็จ!</p>
        </div>
      </div>
    );
  }
  
  return null;
};

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusIcon, setStatusIcon] = useState(null);

  const handleLogin = async () => {
    // Clear previous error
    setErrorMessage("");
    
    if (email.trim() === "" || password.trim() === "") {
      setErrorMessage("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        setErrorMessage("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        
        // Show error icon for 1 second
        setStatusIcon('error');
        setTimeout(() => setStatusIcon(null), 1000);
        return;
      }

      // Show success icon
      setStatusIcon('success');
      
      // แก้ไขการส่งข้อมูลให้ส่งครบทุก field
      login({
        userId: data.user.userId,
        firstName: data.user.firstName,    // ← เพิ่มบรรทัดนี้
        lastName: data.user.lastName,     // ← เพิ่มบรรทัดนี้
        name: `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim(), // ← ปรับให้ handle กรณี null/undefined
        email: data.user.email,
        avatar: data.user.imageUrl,
        imageUrl: data.user.imageUrl,     // ← เพิ่มบรรทัดนี้ (สำหรับ UserData component)
        phone: data.user.phone,
        location: data.user.location,
        role: data.user.role,
        workerApplicationStatus: data.user.workerApplicationStatus,
      });

      // Wait 1.5 seconds to show success icon then redirect
      setTimeout(() => {
        router.push(data.redirectTo || "/");
      }, 1500);

    } catch (error) {
      console.error("Login Error:", error);
      setLoading(false);
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
      
      // Show error icon for 1 second
      setStatusIcon('error');
      setTimeout(() => setStatusIcon(null), 1000);
    }
  };

  return (
    <div className="w-full flex justify-center items-start p-2 min-h-screen bg-gray-50">
      <div className="w-full max-w-[614px] h-auto min-h-[450px] relative bg-white rounded-lg flex flex-col outline-1 outline-offset-[-1px] outline-gray-300 p-4 sm:p-8 mt-16">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="flex flex-col"
        >
          <div className="text-center text-blue-950 text-2xl sm:text-3xl font-medium font-['Prompt'] leading-[48px] mb-8 sm:mb-16">
            เข้าสู่ระบบ
          </div>

          {/* Email */}
          <div className="w-full max-w-96 mx-auto flex flex-col justify-start items-start gap-5 mb-8">
            <div className="w-full flex flex-col justify-start items-start gap-1">
              <div className="justify-center flex items-center gap-1">
                <span className="text-zinc-700 text-base font-medium font-['Prompt'] leading-normal">
                  อีเมล
                </span>
                <span className="text-rose-700 text-base font-medium font-['Prompt'] leading-normal">
                  *
                </span>
              </div>
              <div className="w-full px-4 py-2.5 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-gray-300 inline-flex justify-start items-center gap-2.5">
                <input
                  type="email"
                  placeholder="กรุณากรอกอีเมล"
                  className="w-full bg-transparent text-gray-500 text-base font-normal font-['Prompt'] leading-normal outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="w-full max-w-96 mx-auto flex flex-col justify-start items-start gap-5 mb-8">
            <div className="w-full flex flex-col justify-start items-start gap-1">
              <div className="justify-center flex items-center gap-1">
                <span className="text-zinc-700 text-base font-medium font-['Prompt'] leading-normal">
                  รหัสผ่าน
                </span>
                <span className="text-rose-700 text-base font-medium font-['Prompt'] leading-normal">
                  *
                </span>
              </div>
              <div className="w-full px-4 py-2.5 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-gray-300 inline-flex justify-start items-center gap-2.5">
                <input
                  type="password"
                  placeholder="กรุณากรอกรหัสผ่าน"
                  className="w-full bg-transparent text-gray-500 text-base font-normal font-['Prompt'] leading-normal outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="w-full max-w-96 mx-auto mb-4">
              <p className="text-red-600 text-sm font-normal font-['Prompt'] leading-normal">
                {errorMessage}
              </p>
            </div>
          )}

          {/* ปุ่ม Login */}
          <div className="w-full max-w-96 mx-auto mb-8">
            <button
              type="submit"
              className={`w-full px-6 py-2.5 rounded-lg inline-flex justify-center items-center gap-2 transition-colors ${
                loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={loading}
            >
              <div className="text-center justify-center text-white text-base font-medium font-['Prompt'] leading-normal">
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </div>
            </button>
          </div>

          {/* Registration Link */}
          <div className="w-full max-w-96 mx-auto flex justify-center items-center gap-2">
            <div className="text-center text-gray-500 text-base font-normal font-['Prompt'] leading-normal">
              ยังไม่มีบัญชีผู้ใช้ HomeService?
            </div>

            <Link
              href="/page/register"
              className="text-center text-blue-600 text-base font-semibold font-['Prompt'] underline leading-normal cursor-pointer hover:text-blue-700 transition-colors"
            >
              ลงทะเบียน
            </Link>
          </div>
        </form>
      </div>

      {/* Loading Spinner */}
      {loading && <LoadingSpinner />}
      
      {/* Status Icons */}
      {statusIcon && <StatusIcon type={statusIcon} />}
    </div>
  );
};

export default LoginPage;