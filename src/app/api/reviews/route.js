import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const normalizeObjectId = (value) => {
  if (!value) return null;
  if (value instanceof ObjectId) return value;
  if (typeof value === "string" && ObjectId.isValid(value)) {
    return new ObjectId(value);
  }
  if (typeof value === "object" && "$oid" in value && ObjectId.isValid(value.$oid)) {
    return new ObjectId(value.$oid);
  }
  return null;
};

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userIdParam = url.searchParams.get("userId");
    const serviceIdParam = url.searchParams.get("serviceId");
    const bookingIdParam = url.searchParams.get("bookingId");

    const client = await clientPromise;
    const db = client.db("myDB");
    const bookings = db.collection("bookings");

    const match = { status: "completed" };

    if (userIdParam) {
      const userObjectId = normalizeObjectId(userIdParam);
      if (!userObjectId) {
        return new Response(JSON.stringify({ message: "userId ไม่ถูกต้อง" }), { status: 400 });
      }
      match.userId = userObjectId;
    }

    if (serviceIdParam) {
      const serviceObjectId = normalizeObjectId(serviceIdParam);
      if (!serviceObjectId) {
        return new Response(JSON.stringify({ message: "serviceId ไม่ถูกต้อง" }), { status: 400 });
      }
      match.serviceId = serviceObjectId;
    }

    if (bookingIdParam) {
      const bookingObjectId = normalizeObjectId(bookingIdParam);
      if (!bookingObjectId) {
        return new Response(JSON.stringify({ message: "bookingId ไม่ถูกต้อง" }), { status: 400 });
      }
      match._id = bookingObjectId;
    }

    const pipeline = [
      { $match: match },
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
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $project: {
          _id: 1,
          serviceId: 1,
          userId: 1,
          status: 1,
          createdAt: 1,
          completedDate: 1,
          estimatedPrice: 1,
          selectedOption: 1,
          bookingDate: 1,
          bookingTime: 1,
          date: 1,
          time: 1,
          address: 1,
          customerLocation: 1,
          rating: 1,
          review: 1,
          reviewDetail: 1,
          reviewedAt: 1,
          serviceDetails: { $arrayElemAt: ["$serviceDetails", 0] },
          userDetails: { $arrayElemAt: ["$userDetails", 0] }
        }
      }
    ];

    const results = await bookings.aggregate(pipeline, { allowDiskUse: true }).toArray();

    return new Response(JSON.stringify({ message: "ดึงข้อมูลรีวิวสำเร็จ", data: results }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("GET /api/reviews error", error);
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { bookingId, userId, rating, comment } = body;

    if (!bookingId || !userId || typeof rating !== "number") {
      return new Response(JSON.stringify({ message: "ข้อมูลไม่ครบถ้วน" }), { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ message: "คะแนนต้องอยู่ระหว่าง 1-5" }), { status: 400 });
    }

    const bookingObjectId = normalizeObjectId(bookingId);
    const userObjectId = normalizeObjectId(userId);

    if (!bookingObjectId || !userObjectId) {
      return new Response(JSON.stringify({ message: "รหัสไม่ถูกต้อง" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const bookings = db.collection("bookings");

    const booking = await bookings.findOne({ _id: bookingObjectId });

    if (!booking) {
      return new Response(JSON.stringify({ message: "ไม่พบคำสั่งจอง" }), { status: 404 });
    }

    if (!booking.userId || booking.userId.toString() !== userObjectId.toString()) {
      return new Response(JSON.stringify({ message: "คุณไม่มีสิทธิ์รีวิวคำสั่งจองนี้" }), { status: 403 });
    }

    if (booking.status !== "completed") {
      return new Response(JSON.stringify({ message: "สามารถรีวิวได้เฉพาะงานที่เสร็จสิ้นแล้วเท่านั้น" }), { status: 400 });
    }

    const now = new Date();
    const reviewDetail = {
      bookingId: booking._id,
      serviceId: booking.serviceId,
      userId: booking.userId,
      rating,
      comment: (comment || "").toString().trim(),
      createdAt: booking.reviewDetail?.createdAt || now,
      updatedAt: now
    };

    const updateDoc = {
      $set: {
        rating,
        review: reviewDetail.comment,
        reviewDetail,
        reviewedAt: now
      }
    };

    const result = await bookings.findOneAndUpdate(
      { _id: bookingObjectId },
      updateDoc,
      { returnDocument: "after" }
    );

    if (!result || !result.value) {
      return new Response(JSON.stringify({ message: "บันทึกรีวิวไม่สำเร็จ" }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        message: "บันทึกรีวิวเรียบร้อย",
        review: result.value.reviewDetail,
        booking: result.value
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("POST /api/reviews error", error);
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
  }
}
