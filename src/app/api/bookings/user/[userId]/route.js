// api/bookings/user/[userId]/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// 📌 GET: Get all bookings for specific user

export async function GET(req, context) {
  try {
    const { userId } = await context.params;

    if (!userId || !ObjectId.isValid(userId)) {
      return new Response(JSON.stringify({ message: "Invalid user ID" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const bookings = db.collection("bookings");

    const userBookings = await bookings.aggregate([
      { $match: { userId: new ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "serviceDetails"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "technicianDetails"
        }
      },
      {
        $project: {
          _id: 1,
          serviceId: 1,
          userId: 1,
          status: 1,
          createdAt: 1,
          assignedTo: 1,
          serviceName: 1,
          serviceCategory: 1,
          estimatedPrice: 1,
          selectedOption: 1,
          customerName: 1,
          customerEmail: 1,
          customerPhone: 1,
          customerLocation: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          paymentSlip: 1,
          bookingDate: 1,
          bookingTime: 1,
          date: 1,
          time: 1,
          address: 1,
          rating: 1,
          review: 1,
          reviewDetail: 1,
          reviewedAt: 1,
          serviceDetails: { $arrayElemAt: ["$serviceDetails", 0] },
          technicianDetails: { $arrayElemAt: ["$technicianDetails", 0] }
        }
      }
    ], { allowDiskUse: true }).toArray();

    return new Response(JSON.stringify({
      message: "ดึงข้อมูลคำสั่งจองเรียบร้อย",
      bookings: userBookings
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Get User Bookings Error:", error);
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


// 📌 POST: Notify user about booking status update
export async function POST(req, context) {
  try {
    const { params } = context;
    const { userId } = params;
    const body = await req.json();
    const { bookingId, newStatus, message } = body;

    // Validate input
    if (!userId || !ObjectId.isValid(userId) || !bookingId || !newStatus || !message) {
      return new Response(JSON.stringify({ message: "ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const notifications = db.collection("notifications");

    const notification = {
      userId: new ObjectId(userId),
      bookingId: new ObjectId(bookingId),
      status: newStatus,
      message,
      read: false,
      createdAt: new Date()
    };

    await notifications.insertOne(notification);

    return new Response(JSON.stringify({
      message: "ส่งการแจ้งเตือนเรียบร้อย",
      notification
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Notification Error:", error);
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาดในการแจ้งเตือน" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
