import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
// 📌 POST: Create booking by service id and user id
export async function POST(req) {
  try {
    const body = await req.json();
    const { serviceId, userId, ...rest } = body;

    // Validate required fields
    if (!serviceId || !userId) {
      return new Response(JSON.stringify({ message: "serviceId และ userId จำเป็นต้องมี" }), { status: 400 });
    }

    if (!ObjectId.isValid(serviceId) || !ObjectId.isValid(userId)) {
      return new Response(JSON.stringify({ message: "serviceId หรือ userId ไม่ถูกต้อง" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const bookings = db.collection("bookings");

    const newBooking = {
      serviceId: new ObjectId(serviceId),
      userId: new ObjectId(userId),
      status: "pending",
      createdAt: new Date(),
      ...rest,
    };

    const result = await bookings.insertOne(newBooking);

    if (!result.insertedId) {
      return new Response(JSON.stringify({ message: "สร้างคำสั่งจองไม่สำเร็จ" }), { status: 500 });
    }

    // Return the created booking
    const createdBooking = await bookings.findOne({ _id: result.insertedId });

    return new Response(JSON.stringify({ message: "สร้างคำสั่งจองเรียบร้อย", booking: createdBooking }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
  }
}
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



// 📌 GET: Get bookings by userId
// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const userId = searchParams.get("userId");

//     if (!userId || !ObjectId.isValid(userId)) {
//       return new Response(JSON.stringify({ message: "userId ไม่ถูกต้อง" }), { status: 400 });
//     }

//     const client = await clientPromise;
//     const db = client.db("myDB");
//     const bookings = db.collection("bookings");

//     const userBookings = await bookings
//       .find({ userId: new ObjectId(userId) })
//       .sort({ createdAt: -1 }) // เรียงจากใหม่ไปเก่า
//       .toArray();

//     return new Response(JSON.stringify({ bookings: userBookings }), { status: 200 });
//   } catch (err) {
//     return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
//   }
// }
