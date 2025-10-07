import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date");

    if (!serviceId || !ObjectId.isValid(serviceId) || !date) {
      return NextResponse.json(
        { message: "serviceId และ date จำเป็นต้องมี" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const bookings = db.collection("bookings");

    const parsedDate = new Date(date);
    const dateFilters = [{ bookingDate: date }, { date }];

    if (!Number.isNaN(parsedDate.getTime())) {
      dateFilters.push({ bookingDate: parsedDate });
      dateFilters.push({ date: parsedDate });
    }

    const results = await bookings
      .find({
        serviceId: new ObjectId(serviceId),
        $or: dateFilters,
        status: { $nin: ["cancelled", "canceled", "Cancelled", "Canceled"] },
      })
      .project({ bookingTime: 1, time: 1, serviceTime: 1 })
      .toArray();

    const takenTimes = Array.from(
      new Set(
        results
          .flatMap((booking) => [booking.bookingTime, booking.time, booking.serviceTime])
          .filter((time) => typeof time === "string" && time.trim().length > 0)
          .map((time) => time.trim())
      )
    );

    return NextResponse.json({ takenTimes });
  } catch (error) {
    console.error("Failed to fetch availability", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงข้อมูลช่วงเวลา" },
      { status: 500 }
    );
  }
}
