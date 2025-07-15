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

// 📌 GET: Get booking by ID


import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const rawUserId = searchParams.get("userId");

  const userId = rawUserId?.trim();

  if (!userId || !ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Invalid or missing user ID" }, { status: 401 });
  }

  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("myDB");

    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(id),
      customerId: new ObjectId(userId),
    });

    if (!booking) {
      return NextResponse.json({ message: "Booking not found or access denied" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking", details: error.message },
      { status: 500 }
    );
  }
}



// export async function GET(req, { params }) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const userId = searchParams.get('userId');
//     const { id } = params;

//     const client = await clientPromise;
//     const db = client.db("myDB");
//     const bookings = db.collection("bookings");

//     // ถ้ามี userId ให้ดึงตาม userId
//     if (userId) {
//       if (!ObjectId.isValid(userId)) {
//         return new Response(JSON.stringify({ message: "userId ไม่ถูกต้อง" }), { status: 400 });
//       }

//       const userBookings = await bookings.find({ userId: new ObjectId(userId) }).toArray();
//       return new Response(JSON.stringify(userBookings), { status: 200 });
//     }

//     // ถ้ามี id ให้ดึงตาม booking ID
//     if (id) {
//       if (!ObjectId.isValid(id)) {
//         return new Response(JSON.stringify({ message: "ID ไม่ถูกต้อง" }), { status: 400 });
//       }

//       const booking = await bookings.findOne({ _id: new ObjectId(id) });

//       if (!booking) {
//         return new Response(JSON.stringify({ message: "ไม่พบคำสั่งจองนี้" }), { status: 404 });
//       }

//       return new Response(JSON.stringify(booking), { status: 200 });
//     }

//     return new Response(JSON.stringify({ message: "กรุณาระบุ userId หรือ id" }), { status: 400 });

//   } catch (err) {
//     return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
//   }
// }


// เพิ่มใน GET method
// export async function GET(req, { params }) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const userId = searchParams.get('userId');
//     const { id } = params;

//     const client = await clientPromise;
//     const db = client.db("myDB");
//     const bookings = db.collection("bookings");

//     // ถ้ามี userId ให้ดึงตาม userId
//     if (userId) {
//       if (!ObjectId.isValid(userId)) {
//         return new Response(JSON.stringify({ message: "userId ไม่ถูกต้อง" }), { status: 400 });
//       }
      
//       const userBookings = await bookings.find({ userId: new ObjectId(userId) }).toArray();
//       return new Response(JSON.stringify(userBookings), { status: 200 });
//     }

//     // ถ้ามี id ให้ดึงตาม booking ID (โค้ดเดิม)
//     if (id) {
//       // โค้ดเดิมของคุณ...
//     }

//   } catch (err) {
//     return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
//   }
// }