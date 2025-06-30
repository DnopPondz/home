"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"


const RegisterPage = () => {
  const [form, setForm] = useState({
    fullname: "",
    phone: "",
    email: "",
    password: "",
    acceptTerms: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Validate & submit form here
    alert(JSON.stringify(form, null, 2))
  }

  return (
    <div className=" min-h-screen flex justify-center items-start  bg-gray-50 px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-8 outline-1 outline-gray-300"
      >
        <h1 className="text-center text-3xl font-medium font-Prompt text-blue-950 mb-8">
          ลงทะเบียน
        </h1>

        {/* Fullname */}
        <label className="block mb-5" htmlFor="fullname">
          <span className="text-zinc-700 font-medium font-Prompt mb-1 inline-block">
            ชื่อ - นามสกุล <span className="text-rose-700">*</span>
          </span>
          <input
            type="text"
            id="fullname"
            name="fullname"
            autoComplete="name"
            placeholder="กรุณากรอกชื่อ นามสกุล"
            value={form.fullname}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-offset-[-1px] outline-1 outline-gray-300 font-Prompt text-base text-gray-700 placeholder-gray-400"
          />
        </label>

        {/* Phone */}
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
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-Prompt font-medium text-base hover:bg-blue-700 transition"
        >
          ลงทะเบียน
        </button>

        {/* Separator */}
        <div className="flex items-center my-6 gap-2">
          <div className="flex-1 h-px bg-gray-400" />
          <p className="text-gray-500 font-Prompt text-sm">หรือลงชื่อเข้าใช้ผ่าน</p>
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
  )
}

export default RegisterPage
