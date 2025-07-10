import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// 📌 CREATE Booking
export async function POST(req) {
  try {
    const body = await req.json();
    const { customerId, serviceId, priceOptionId, date, time, address } = body;

    if (!customerId || !serviceId || !priceOptionId || !date || !time || !address) {
      return new Response(JSON.stringify({ message: "ข้อมูลไม่ครบ" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const bookings = db.collection("bookings");

    const newBooking = {
      customerId: new ObjectId(customerId),
      serviceId: new ObjectId(serviceId),
      priceOptionId,
      date,
      time,
      address,
      status: "pending",
      assignedTo: null,
      createdAt: new Date()
    };

    const result = await bookings.insertOne(newBooking);

    return new Response(JSON.stringify({ message: "จองบริการสำเร็จ", bookingId: result.insertedId }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
  }
}

// 📌 GET bookings (admin/tech)
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("myDB");
    const bookings = db.collection("bookings");

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const assignedTo = url.searchParams.get("assignedTo");

    const filter = {};
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = new ObjectId(assignedTo);

    const results = await bookings.find(filter).sort({ createdAt: -1 }).toArray();
    return new Response(JSON.stringify(results), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
  }
}
