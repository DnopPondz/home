import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// 📌 PATCH: Assign technician
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { assignedTo, status } = body;

    const client = await clientPromise;
    const db = client.db("myDB");
    const bookings = db.collection("bookings");

    const updateData = {};
    if (assignedTo) updateData.assignedTo = new ObjectId(assignedTo);
    if (status) updateData.status = status;

    const updated = await bookings.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!updated.value) {
      return new Response(JSON.stringify({ message: "ไม่พบคำสั่งจองนี้" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "อัปเดตเรียบร้อย", booking: updated.value }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
  }
}

// 📌 GET: Get booking by ID
export async function GET(req, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ message: "ID ไม่ถูกต้อง" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const bookings = db.collection("bookings");

    const booking = await bookings.findOne({ _id: new ObjectId(id) });

    if (!booking) {
      return new Response(JSON.stringify({ message: "ไม่พบคำสั่งจองนี้" }), { status: 404 });
    }

    return new Response(JSON.stringify(booking), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
  }
}
