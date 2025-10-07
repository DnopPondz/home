import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const { bookingId, paymentSlip, amount, paymentMethod = "promptpay" } = body;

    if (!bookingId || !paymentSlip) {
      return NextResponse.json(
        { message: "bookingId และ paymentSlip จำเป็นต้องมี" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { message: "bookingId ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const bookings = db.collection("bookings");

    const updateData = {
      paymentMethod,
      paymentSlip,
      paymentStatus: "awaiting_confirmation",
      paymentAmount: amount ?? null,
      paymentSubmittedAt: new Date(),
    };

    const result = await bookings.findOneAndUpdate(
      { _id: new ObjectId(bookingId) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ message: "ไม่พบบุ๊กกิ้ง" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "บันทึกข้อมูลการชำระเงินเรียบร้อย", booking: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("PromptPay checkout API error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาด", error: error.message }, { status: 500 });
  }
}
