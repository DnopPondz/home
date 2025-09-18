import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const toObjectId = (value) => {
  if (!value) return null;
  if (value instanceof ObjectId) return value;
  if (typeof value === "string" && ObjectId.isValid(value)) {
    return new ObjectId(value);
  }
  if (typeof value === "object" && value.$oid && ObjectId.isValid(value.$oid)) {
    return new ObjectId(value.$oid);
  }
  return null;
};

const serializeNotification = (notification) => ({
  ...notification,
  _id: notification._id?.toString(),
  userId: notification.userId?.toString?.() ?? notification.userId,
  bookingId: notification.bookingId?.toString?.() ?? notification.bookingId,
});

const buildUserFilter = (userId) => {
  const objectId = toObjectId(userId);

  if (objectId) {
    return {
      $or: [
        { userId: objectId },
        { userId: userId },
      ],
    };
  }

  if (typeof userId === "string" && userId.trim() !== "") {
    return { userId };
  }

  return null;
};

export async function GET(_req, { params }) {
  try {
    const { userId } = params;
    const filter = buildUserFilter(userId);

    if (!filter) {
      return NextResponse.json(
        { message: "รหัสผู้ใช้ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const notifications = await db
      .collection("notifications")
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      notifications: notifications.map(serializeNotification),
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { message: "ไม่สามารถดึงข้อมูลการแจ้งเตือนได้" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { userId } = params;
    const userFilter = buildUserFilter(userId);

    if (!userFilter) {
      return NextResponse.json(
        { message: "รหัสผู้ใช้ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    let notificationIds = [];
    try {
      const body = await request.json();
      notificationIds = Array.isArray(body?.notificationIds)
        ? body.notificationIds
        : [];
    } catch (error) {
      notificationIds = [];
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const collection = db.collection("notifications");

    const filter = {
      ...userFilter,
      read: { $ne: true },
    };
    if (notificationIds.length > 0) {
      filter._id = {
        $in: notificationIds
          .map((id) => toObjectId(id))
          .filter((id) => id instanceof ObjectId),
      };
    }

    await collection.updateMany(filter, {
      $set: {
        read: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ message: "อัปเดตสถานะการแจ้งเตือนแล้ว" });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { message: "ไม่สามารถอัปเดตการแจ้งเตือนได้" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { userId } = params;
    const userFilter = buildUserFilter(userId);

    if (!userFilter) {
      return NextResponse.json(
        { message: "รหัสผู้ใช้ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const collection = db.collection("notifications");

    const result = await collection.deleteMany(userFilter);

    return NextResponse.json({
      message: "ลบการแจ้งเตือนเรียบร้อยแล้ว",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete notifications error:", error);
    return NextResponse.json(
      { message: "ไม่สามารถลบการแจ้งเตือนได้" },
      { status: 500 }
    );
  }
}
