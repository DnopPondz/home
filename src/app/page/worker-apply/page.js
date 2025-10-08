"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { AuthContext } from "@/app/context/AuthContext";

const statusConfig = {
  none: {
    label: "ยังไม่เคยส่งคำขอ",
    badgeClass: "bg-gray-100 text-gray-700",
    description:
      "กรุณากรอกข้อมูลและอัปโหลดเรซูเม่เพื่อส่งคำขอเข้าร่วมทีมพนักงานของเรา",
  },
  pending: {
    label: "รอตรวจสอบ",
    badgeClass: "bg-amber-100 text-amber-800",
    description:
      "คำขอของคุณอยู่ระหว่างการตรวจสอบ โปรดรอการแจ้งเตือนจากผู้ดูแลระบบ",
  },
  approved: {
    label: "อนุมัติแล้ว",
    badgeClass: "bg-emerald-100 text-emerald-700",
    description:
      "คำขอได้รับการอนุมัติแล้ว คุณสามารถเข้าสู่ระบบเพื่อใช้งานเมนูพนักงานได้",
  },
  rejected: {
    label: "ปฏิเสธ",
    badgeClass: "bg-red-100 text-red-700",
    description:
      "คำขอถูกปฏิเสธ กรุณาตรวจสอบข้อมูลที่กรอกและส่งคำขอใหม่อีกครั้ง",
  },
};

const WorkerApplicationPage = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [application, setApplication] = useState(null);

  const applicationStatus = useMemo(() => {
    if (application?.status) return application.status;
    return user?.workerApplicationStatus || "none";
  }, [application?.status, user?.workerApplicationStatus]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      email: user.email || "",
    });

    const fetchApplication = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("/api/worker-applications", {
          params: {
            userId: user.userId,
          },
        });

        const fetched = res.data?.applications?.[0];
        if (fetched) {
          setApplication(fetched);
        }
      } catch (error) {
        console.error("Failed to load worker application", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [user]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];
    setResumeError("");

    if (!file) {
      setResumeFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeError("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)");
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");
    setResumeError("");

    if (!user?.userId) {
      setErrorMessage("กรุณาเข้าสู่ระบบก่อนส่งคำขอ");
      return;
    }

    if (!resumeFile) {
      setResumeError("กรุณาอัปโหลดไฟล์เรซูเม่ (ไม่เกิน 5MB)");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("userId", user.userId);
      formData.append("firstName", form.firstName.trim());
      formData.append("lastName", form.lastName.trim());
      formData.append("phone", form.phone.trim());
      formData.append("email", form.email.trim());
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const res = await axios.post("/api/worker-applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const saved = res.data?.application;
      setApplication(saved || null);
      updateUser({ workerApplicationStatus: saved?.status || "pending" });
      setStatusMessage(res.data?.message || "ส่งคำขอเรียบร้อยแล้ว");
      setResumeFile(null);
      setSubmitting(false);
    } catch (error) {
      console.error("Submit worker application error", error);
      const message =
        error.response?.data?.message ||
        "เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง";
      setErrorMessage(message);
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-xl w-full bg-white shadow-md rounded-2xl p-10 text-center">
          <h1 className="text-3xl font-semibold text-blue-900 mb-4">
            เข้าสู่ระบบเพื่อสมัครเป็นพนักงานภาคสนาม
          </h1>
          <p className="text-gray-600 mb-8">
            คุณจำเป็นต้องเข้าสู่ระบบก่อนจึงจะสามารถส่งคำขอสมัครได้
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/page/login"
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/page/register"
              className="px-6 py-2 rounded-lg border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition-colors"
            >
              ลงทะเบียน
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white shadow-md rounded-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-blue-900 mb-2">
                สมัครเป็นพนักงานภาคสนาม (Worker)
              </h1>
              <p className="text-gray-600 max-w-2xl">
                ส่งข้อมูลของคุณเพื่อเข้าร่วมทีมงานมืออาชีพของเรา เราจะตรวจสอบข้อมูลและแจ้งผลผ่านระบบการแจ้งเตือน
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <span
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  statusConfig[applicationStatus]?.badgeClass || "bg-gray-100 text-gray-700"
                }`}
              >
                {statusConfig[applicationStatus]?.label || "สถานะไม่ทราบ"}
              </span>
              <p className="text-xs text-gray-500 mt-2 max-w-xs text-left md:text-right">
                {statusConfig[applicationStatus]?.description}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-2xl p-8">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {statusMessage && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3">
                  {statusMessage}
                </div>
              )}

              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-gray-700 font-medium">
                    ชื่อ <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleInputChange}
                    required
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-gray-700 font-medium">
                    นามสกุล <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleInputChange}
                    required
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-gray-700 font-medium">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    pattern="[0-9]{9,10}"
                    value={form.phone}
                    onChange={handleInputChange}
                    required
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-gray-700 font-medium">
                    อีเมล <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-gray-700 font-medium">
                  อัปโหลดเรซูเม่ <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 text-center">
                  <p className="text-gray-600 mb-3">
                    รองรับไฟล์ PDF, DOC, DOCX หรือรูปภาพ ขนาดไม่เกิน 5MB
                  </p>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="inline-flex items-center px-6 py-2 rounded-lg bg-blue-600 text-white font-medium cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    เลือกไฟล์
                  </label>
                  <div className="mt-3 text-sm text-gray-600">
                    {resumeFile?.name || application?.resume?.filename || "ยังไม่ได้เลือกไฟล์"}
                  </div>
                  {resumeError && (
                    <p className="mt-2 text-sm text-red-600">{resumeError}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-gray-500">
                  ระบบจะส่งการแจ้งเตือนไปยังบัญชีของคุณเมื่อมีการอัปเดตสถานะคำขอ
                </p>
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    applicationStatus === "approved" ||
                    applicationStatus === "pending"
                  }
                  className="inline-flex items-center justify-center px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {applicationStatus === "approved"
                    ? "ได้รับการอนุมัติแล้ว"
                    : applicationStatus === "pending"
                    ? "รอตรวจสอบ"
                    : submitting
                    ? "กำลังส่งคำขอ..."
                    : "ส่งคำขอสมัคร"}
                </button>
              </div>
            </form>
          )}
        </div>

        {application && (
          <div className="bg-white shadow-md rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              ข้อมูลคำขอที่ส่งล่าสุด
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="text-gray-500">ชื่อ-นามสกุล:</span> {application.firstName} {application.lastName}
              </div>
              <div>
                <span className="text-gray-500">อีเมล:</span> {application.email}
              </div>
              <div>
                <span className="text-gray-500">เบอร์โทร:</span> {application.phone}
              </div>
              <div>
                <span className="text-gray-500">สถานะ:</span> {statusConfig[application.status]?.label || application.status}
              </div>
              {application.resume?.filename && (
                <div className="md:col-span-2">
                  <span className="text-gray-500">ไฟล์เรซูเม่:</span> {application.resume.filename}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerApplicationPage;
