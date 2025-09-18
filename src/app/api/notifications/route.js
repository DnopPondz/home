import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const normalizeId = (value) => {
  if (!value) return null;
  if (ObjectId.isValid(value)) return new ObjectId(value);
  if (typeof value === "object" && value.$oid && ObjectId.isValid(value.$oid)) {
    return new ObjectId(value.$oid);
  }
  return value;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, bookingId, status, message } = body || {};

    if (!userId || !bookingId || !status || !message) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const notifications = db.collection("notifications");

    const notificationDoc = {
      userId: normalizeId(userId),
      bookingId: normalizeId(bookingId),
      status,
      message,
      read: false,
      createdAt: new Date(),
    };

    const result = await notifications.insertOne(notificationDoc);

    return NextResponse.json(
      {
        message: "บันทึกการแจ้งเตือนเรียบร้อย",
        notification: {
          ...notificationDoc,
          _id: result.insertedId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      { message: "ไม่สามารถสร้างการแจ้งเตือนได้" },
      { status: 500 }
    );
  }
}
