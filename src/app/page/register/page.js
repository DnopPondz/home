"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบใหม่อีกครั้ง");
      return;
    }

    if (!image) {
      setError("กรุณาเลือกรูปภาพโปรไฟล์");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, acceptTerms, ...userData } = form;
      const formData = new FormData();

      // เพิ่มข้อมูลผู้ใช้
      for (const key in userData) {
        formData.append(key, userData[key]);
      }

      // เพิ่มรูปภาพ
      formData.append("image", image);

      // ส่งไปยัง API
      const res = await axios.post("/api/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess(res.data.message || "ลงทะเบียนสำเร็จ");
      setForm({
        firstName: "",
        lastName: "",
        phone: "",
        location: "",
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
      });
      setImage(null);

      // Redirect ไปหน้า login หลังจากลงทะเบียนสำเร็จ
      setTimeout(() => {
        router.push("/page/login");
      }, 1500); // รอ 1.5 วิ เพื่อให้ผู้ใช้เห็นข้อความ success ก่อนเปลี่ยนหน้า
    } catch (err) {
      console.error("❌ Register error:", err);

      if (err.response) {
        console.log("📦 Response data:", err.response.data);
        console.log("📦 Response status:", err.response.status);
        console.log("📦 Response headers:", err.response.headers);
      } else if (err.request) {
        console.log("📡 Request sent but no response:", err.request);
      } else {
        console.log("❗ Unknown error:", err.message);
      }

      setError(
        err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50 px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-8 outline-1 outline-gray-300"
      >
        <h1 className="text-center text-3xl font-medium font-Prompt text-blue-950 mb-8">
          ลงทะเบียน
        </h1>

        {error && (
          <p className="mb-4 text-red-600 font-Prompt font-semibold">{error}</p>
        )}

        {success && (
          <p className="mb-4 text-green-600 font-Prompt font-semibold">
            {success}
          </p>
        )}

        {/* First Name */}
        <label className="block mb-5" htmlFor="firstName">
          <span className="text-zinc-700 font-medium font-Prompt mb-1 inline-block">
            ชื่อ <span className="text-rose-700">*</span>
          </span>
          <input
            type="text"
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            placeholder="กรุณากรอกชื่อ"
            value={form.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-offset-[-1px] outline-1 outline-gray-300 font-Prompt text-base text-gray-700 placeholder-gray-400"
          />
        </label>

        {/* Last Name */}
        <label className="block mb-5" htmlFor="lastName">
          <span className="text-zinc-700 font-medium font-Prompt mb-1 inline-block">
            นามสกุล <span className="text-rose-700">*</span>
          </span>
          <input
            type="text"
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            placeholder="กรุณากรอกนามสกุล"
            value={form.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-offset-[-1px] outline-1 outline-gray-300 font-Prompt text-base text-gray-700 placeholder-gray-400"
          />
        </label>

        {/* Phone Number */}
        <label className="block mb-5" htmlFor="phone">
          <span className="text-zinc-700 font-medium font-Prompt mb-1 inline-block">
            เบอร์โทรศัพท์ <span className="text-rose-700">*</span>
          </span>
          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            pattern="[0-9]{9,10}"
            placeholder="กรุณากรอกเบอร์โทรศัพท์"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-offset-[-1px] outline-1 outline-gray-300 font-Prompt text-base text-gray-700 placeholder-gray-400"
          />
        </label>

        {/* Location */}
        <label className="block mb-5" htmlFor="location">
          <span className="text-zinc-700 font-medium font-Prompt mb-1 inline-block">
            ที่อยู่/สถานที่ <span className="text-rose-700">*</span>
          </span>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="กรุณากรอกที่อยู่หรือสถานที่"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-offset-[-1px] outline-1 outline-gray-300 font-Prompt text-base text-gray-700 placeholder-gray-400"
          />
        </label>

        <div className="mb-6">
          <label
            htmlFor="image"
            className="block text-zinc-700 font-medium font-Prompt mb-2"
          >
            รูปโปรไฟล์ <span className="text-rose-700">*</span>
          </label>

          <div className="flex items-center gap-4">
            {/* Preview */}
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-full border border-gray-300 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-sm">
                ไม่มีรูป
              </div>
            )}

            {/* File Input */}
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImage(file);
                  setPreview(URL.createObjectURL(file));
                }
              }}
              className="block w-full text-sm text-gray-700
        file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-600 file:text-white
        hover:file:bg-blue-700
        transition"
            />
          </div>
        </div>

        {/* Email */}
        <label className="block mb-5" htmlFor="email">
          <span className="text-zinc-700 font-medium font-Prompt mb-1 inline-block">
            อีเมล <span className="text-rose-700">*</span>
          </span>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            placeholder="กรุณากรอกอีเมล"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-offset-[-1px] outline-1 outline-gray-300 font-Prompt text-base text-gray-700 placeholder-gray-400"
          />
        </label>

        {/* Password */}
        <label className="block mb-5" htmlFor="password">
          <span className="text-zinc-700 font-medium font-Prompt mb-1 inline-block">
            รหัสผ่าน <span className="text-rose-700">*</span>
          </span>
          <input
            type="password"
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="กรุณากรอกรหัสผ่าน"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-offset-[-1px] outline-1 outline-gray-300 font-Prompt text-base text-gray-700 placeholder-gray-400"
          />
        </label>

        {/* Confirm Password */}
        <label className="block mb-5" htmlFor="confirmPassword">
          <span className="text-zinc-700 font-medium font-Prompt mb-1 inline-block">
            ยืนยันรหัสผ่าน <span className="text-rose-700">*</span>
          </span>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="กรุณายืนยันรหัสผ่าน"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-offset-[-1px] outline-1 outline-gray-300 font-Prompt text-base text-gray-700 placeholder-gray-400"
          />
        </label>

        {/* Terms */}
        <label className="flex items-center mb-6 gap-2" htmlFor="acceptTerms">
          <input
            type="checkbox"
            id="acceptTerms"
            name="acceptTerms"
            checked={form.acceptTerms}
            onChange={handleChange}
            required
            className="w-5 h-5 rounded border border-gray-300"
          />
          <span className="text-zinc-700 font-normal font-Prompt text-base">
            ยอมรับ&nbsp;
            <Link href="#" className="text-blue-600 font-semibold underline">
              ข้อตกลงและเงื่อนไข
            </Link>
            &nbsp;และ&nbsp;
            <Link href="#" className="text-blue-600 font-semibold underline">
              นโยบายความเป็นส่วนตัว
            </Link>
          </span>
        </label>

        {/* Register Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-Prompt font-medium text-base hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "กำลังส่ง..." : "ลงทะเบียน"}
        </button>

        {/* Separator */}
        <div className="flex items-center my-6 gap-2">
          <div className="flex-1 h-px bg-gray-400" />
          <p className="text-gray-500 font-Prompt text-sm">
            หรือลงชื่อเข้าใช้ผ่าน
          </p>
          <div className="flex-1 h-px bg-gray-400" />
        </div>

        {/* Back to login link */}
        <div className="text-center mt-8">
          <Link
            href="/page/login"
            className="text-blue-600 font-Prompt font-semibold underline text-base"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
