import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";
// 📌 POST: Create booking by service id and user id
export async function POST(req) {
  try {
    const body = await req.json();
    const { serviceId, userId, ...rest } = body;

    const sanitizedRest = { ...rest };

    if (rest.paymentSlip && typeof rest.paymentSlip === "object") {
      const { data, contentType, filename, uploadedAt } = rest.paymentSlip;

      if (data && contentType) {
        sanitizedRest.paymentSlip = {
          data,
          contentType,
          filename: filename || null,
          uploadedAt: uploadedAt ? new Date(uploadedAt) : new Date(),
        };
      } else {
        delete sanitizedRest.paymentSlip;
      }
    }

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
      ...sanitizedRest,
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
    const { status, assignedTo } = body;

    console.log('PATCH Request - ID:', id, 'Body:', body); // เพิ่ม logging

    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ message: "ID ไม่ถูกต้อง" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const bookings = db.collection("bookings");

    const updateData = { status };
    if (assignedTo && ObjectId.isValid(assignedTo)) {
      updateData.assignedTo = new ObjectId(assignedTo);
    }

    console.log('Update Data:', updateData); // เพิ่ม logging

    const result = await bookings.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    console.log('MongoDB Result:', result); // เพิ่ม logging

    // แก้ไข: ใช้ result แทน result.value สำหรับ MongoDB driver เวอร์ชันใหม่
    if (!result) {
      return new Response(JSON.stringify({ message: "ไม่พบคำสั่งจอง" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(result), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("PATCH error:", err);
    return new Response(JSON.stringify({ 
      message: "เกิดข้อผิดพลาด", 
      error: err.message // เพิ่ม error details
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
