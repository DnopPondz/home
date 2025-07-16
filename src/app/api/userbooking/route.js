import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  const userId = request.headers.get("authorization")?.replace("Bearer ", "").trim();

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("myDB");

    const query = {
      customerId: ObjectId.isValid(userId) ? new ObjectId(userId) : userId,
    };

    const bookings = await db
      .collection("bookings")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    if (!bookings.length) {
      return NextResponse.json({ message: "No bookings found" }, { status: 404 });
    }

    const filteredBookings = bookings.filter(
      (booking) => booking.status !== "success"
    );

    return NextResponse.json(filteredBookings);
  } catch (error) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: error.message },
      { status: 500 }
    );
  }
}
