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
    const { status, assignedTo, completionPhotos, cancelReason, rejectionReason } = body;

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

    const updateData = {};
    if (typeof status === "string" && status) {
      updateData.status = status;
    }
    if (assignedTo && ObjectId.isValid(assignedTo)) {
      updateData.assignedTo = new ObjectId(assignedTo);
    }

    if (status === "rejected") {
      const providedReason =
        typeof rejectionReason === "string" && rejectionReason.trim()
          ? rejectionReason.trim()
          : typeof cancelReason === "string" && cancelReason.trim()
          ? cancelReason.trim()
          : "";

      if (!providedReason) {
        return new Response(
          JSON.stringify({ message: "กรุณาระบุเหตุผลในการปฏิเสธงาน" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      updateData.cancelReason = providedReason;
      updateData.rejectionReason = providedReason;
      updateData.rejectedAt = new Date();
    }

    if (status === "completed") {
      if (!Array.isArray(completionPhotos) || completionPhotos.length < 3) {
        return new Response(
          JSON.stringify({ message: "จำเป็นต้องอัปโหลดรูปหลังทำความสะอาดอย่างน้อย 3 รูป" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const sanitizedPhotos = completionPhotos
        .map((photo) => {
          if (!photo || typeof photo !== "object") return null;

          const rawData =
            typeof photo.data === "string"
              ? photo.data
              : typeof photo.base64 === "string"
              ? photo.base64
              : typeof photo.dataUrl === "string"
              ? photo.dataUrl
              : "";

          let base64Data = rawData;
          if (base64Data.startsWith("data:")) {
            base64Data = base64Data.split(",", 2)[1] || "";
          }

          if (!base64Data) return null;

          const contentType =
            typeof photo.contentType === "string"
              ? photo.contentType
              : typeof photo.type === "string"
              ? photo.type
              : "image/jpeg";

          const sanitized = {
            data: base64Data,
            contentType,
            filename:
              typeof photo.filename === "string"
                ? photo.filename
                : typeof photo.name === "string"
                ? photo.name
                : null,
            uploadedAt: photo.uploadedAt ? new Date(photo.uploadedAt) : new Date(),
          };

          if (typeof photo.size === "number") {
            sanitized.size = photo.size;
          }

          return sanitized;
        })
        .filter(Boolean);

      if (sanitizedPhotos.length < 3) {
        return new Response(
          JSON.stringify({ message: "รูปภาพไม่ถูกต้องหรือมีจำนวนไม่ครบตามที่กำหนด" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const completedAt = new Date();
      updateData.completionPhotos = sanitizedPhotos;
      updateData.completedDate = completedAt;
      updateData.completedAt = completedAt;
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
