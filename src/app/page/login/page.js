"use client";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import Link from "next/link";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (email.trim() === "" || password.trim() === "") {
      alert("กรุณากรอกอีเมลและรหัสผ่าน");
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
        alert(data.message || "เข้าสู่ระบบไม่สำเร็จ");
        setLoading(false);
        return;
      }

      login({
        userId: data.user.userId,
        name: `${data.user.firstName} ${data.user.lastName}`,
        email: data.user.email,
        avatar: data.user.imageUrl,
        phone: data.user.phone,
        location: data.user.location,
        role: data.user.role,
      });

      router.push(data.redirectTo || "/");
    } catch (error) {
      console.error("Login Error:", error);
      alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
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
    </div>
  );
};

export default LoginPage;
