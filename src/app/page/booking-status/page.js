"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function BookingStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [show, setShow] = useState(false);

  // (Optional) For animation or loading
  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <CheckCircle2 className="mx-auto text-green-500" size={56} />
        <h1 className="text-2xl font-bold text-green-600 mt-4 mb-2">จองบริการสำเร็จ</h1>
        <p className="mb-2 text-gray-700">
          ขอบคุณที่ใช้บริการของเรา
        </p>
        {bookingId && (
          <p className="text-sm text-gray-500 mb-4">
            รหัสการจองของคุณ: <span className="font-mono">{bookingId}</span>
          </p>
        )}
        <button
          onClick={() => router.push("/")}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition"
        >
          กลับหน้าแรก
        </button>
      </div>
    </div>
  );
}