import { Suspense } from "react";
import BookingStatusPage from "./BookingStatusPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center">กำลังโหลด...</div>}>
      <BookingStatusPage />
    </Suspense>
  );
}