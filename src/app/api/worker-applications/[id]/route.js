import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

const VALID_STATUS = ["pending", "approved", "rejected"];

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

const sanitizeApplication = (doc, { includeResumeData = false } = {}) => {
  if (!doc) return null;

  const resume = doc.resume
    ? {
        filename: doc.resume.filename || "resume",
        contentType: doc.resume.contentType || "application/octet-stream",
        size: doc.resume.size || 0,
        ...(includeResumeData && doc.resume.data
          ? { data: doc.resume.data }
          : {}),
      }
    : null;

  return {
    ...doc,
    _id: doc._id?.toString?.() || doc._id,
    userId: doc.userId?.toString?.() || doc.userId,
    resume,
  };
};

const normalizeRoles = (role) => {
  if (!role) return [];
  if (Array.isArray(role)) return role.filter(Boolean);
  return [role];
};

export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ message: "รหัสคำขอไม่ถูกต้อง" }),
        { status: 400 }
      );
    }

    const includeResumeData = new URL(req.url).searchParams.get(
      "includeResumeData"
    ) === "true";

    const client = await clientPromise;
    const db = client.db("myDB");
    const applications = db.collection("workerApplications");

    const doc = await applications.findOne(
      { _id: new ObjectId(id) },
      {
        projection: includeResumeData ? {} : { "resume.data": 0 },
      }
    );

    if (!doc) {
      return new Response(
        JSON.stringify({ message: "ไม่พบคำขอสมัคร" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        application: sanitizeApplication(doc, { includeResumeData }),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Get worker application error:", error);
    return new Response(
      JSON.stringify({ message: "ไม่สามารถดึงข้อมูลคำขอสมัครได้" }),
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ message: "รหัสคำขอไม่ถูกต้อง" }),
        { status: 400 }
      );
    }

    const { status, adminNote } = await req.json();

    if (!status || !VALID_STATUS.includes(status)) {
      return new Response(
        JSON.stringify({ message: "สถานะไม่ถูกต้อง" }),
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const applications = db.collection("workerApplications");
    const users = db.collection("users");
    const notifications = db.collection("notifications");

    const application = await applications.findOne({ _id: new ObjectId(id) });

    if (!application) {
      return new Response(
        JSON.stringify({ message: "ไม่พบคำขอสมัคร" }),
        { status: 404 }
      );
    }

    const now = new Date();

    await applications.updateOne(
      { _id: application._id },
      {
        $set: {
          status,
          ...(adminNote !== undefined ? { adminNote } : {}),
          updatedAt: now,
        },
      }
    );

    const userId = application.userId;
    const userFilter = {
      _id: toObjectId(userId) || userId,
    };

    const userDoc = await users.findOne(userFilter);

    const userUpdates = {
      updatedAt: now,
    };

    const roles = normalizeRoles(userDoc?.role);

    let notificationDoc = null;

    if (status === "approved") {
      const nextRoles = Array.from(new Set([...roles, "worker"]));
      userUpdates.workerApplicationStatus = "approved";
      userUpdates.role = nextRoles.length > 1 ? nextRoles : nextRoles[0] || "worker";

      notificationDoc = {
        userId: toObjectId(application.userId) || application.userId,
        status: "worker-approved",
        message:
          "คำขอสมัครงานได้รับการอนุมัติแล้ว คุณสามารถเข้าถึงเมนูพนักงานได้ทันที",
        type: "worker-role",
        read: false,
        createdAt: now,
        relatedApplicationId: application._id,
      };
    } else if (status === "rejected") {
      const nextRoles = roles.filter((role) => role !== "worker");
      userUpdates.workerApplicationStatus = "rejected";
      userUpdates.role = nextRoles.length > 1 ? nextRoles : nextRoles[0] || "user";

      notificationDoc = {
        userId: toObjectId(application.userId) || application.userId,
        status: "worker-rejected",
        message:
          adminNote?.trim()
            ? adminNote.trim()
            : "คำขอสมัครงานได้รับการปฏิเสธ กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง",
        type: "worker-role",
        read: false,
        createdAt: now,
        relatedApplicationId: application._id,
      };
    } else {
      userUpdates.workerApplicationStatus = "pending";
    }

    await users.updateOne(userFilter, { $set: userUpdates });

    if (notificationDoc) {
      await notifications.insertOne(notificationDoc);
    }

    const updatedApplication = await applications.findOne({
      _id: application._id,
    });

    return new Response(
      JSON.stringify({
        message: "อัปเดตสถานะคำขอเรียบร้อยแล้ว",
        application: sanitizeApplication(updatedApplication),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Update worker application error:", error);
    return new Response(
      JSON.stringify({ message: "ไม่สามารถอัปเดตสถานะได้" }),
      { status: 500 }
    );
  }
}
