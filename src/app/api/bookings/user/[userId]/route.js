// api/bookings/user/[userId]/route.js
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

// 📌 GET: Get all bookings for specific user
export async function GET(req, { params }) {
  try {
    const { userId } = params;

    // Validate userId
    if (!userId || !ObjectId.isValid(userId)) {
      return new Response(JSON.stringify({ message: "userId ไม่ถูกต้อง" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const bookings = db.collection("bookings");

    // Get user's bookings with service and technician details
    const userBookings = await bookings.aggregate([
      {
        $match: { userId: new ObjectId(userId) }
      },
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
          customerName: 1,
          customerEmail: 1,
          customerPhone: 1,
          customerLocation: 1,
          paymentMethod: 1,
          bookingDate: 1,
          bookingTime: 1,
          serviceDetails: { $arrayElemAt: ["$serviceDetails", 0] },
          technicianDetails: { $arrayElemAt: ["$technicianDetails", 0] }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    return new Response(JSON.stringify({ 
      message: "ดึงข้อมูลคำสั่งจองเรียบร้อย", 
      bookings: userBookings 
    }), { status: 200 });

  } catch (error) {
    console.error("Get User Bookings Error:", error);
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
  }
}
