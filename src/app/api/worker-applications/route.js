import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB

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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const includeResumeData = searchParams.get("includeResumeData") === "true";

    const filter = {};

    if (userId) {
      const objectId = toObjectId(userId);
      if (objectId) {
        filter.userId = objectId;
      } else {
        filter.userId = userId;
      }
    }

    if (status) {
      filter.status = status;
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const applications = db.collection("workerApplications");

    const projection = includeResumeData ? {} : { "resume.data": 0 };

    const docs = await applications
      .find(filter, { projection })
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(
      JSON.stringify({
        applications: docs.map((doc) =>
          sanitizeApplication(doc, { includeResumeData })
        ),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Fetch worker applications error:", error);
    return new Response(
      JSON.stringify({ message: "ไม่สามารถดึงข้อมูลคำขอสมัครได้" }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ message: "ประเภทข้อมูลไม่ถูกต้อง" }),
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const userIdRaw = formData.get("userId");
    const firstName = (formData.get("firstName") || "").toString().trim();
    const lastName = (formData.get("lastName") || "").toString().trim();
    const phone = (formData.get("phone") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const resumeFile = formData.get("resume");

    if (!userIdRaw || !firstName || !lastName || !phone || !email || !resumeFile) {
      return new Response(
        JSON.stringify({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" }),
        { status: 400 }
      );
    }

    if (
      typeof resumeFile !== "object" ||
      typeof resumeFile.arrayBuffer !== "function"
    ) {
      return new Response(
        JSON.stringify({ message: "ไฟล์เรซูเม่ไม่ถูกต้อง" }),
        { status: 400 }
      );
    }

    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());

    if (resumeBuffer.length === 0) {
      return new Response(
        JSON.stringify({ message: "ไม่พบข้อมูลในไฟล์เรซูเม่" }),
        { status: 400 }
      );
    }

    if (resumeBuffer.length > MAX_RESUME_SIZE) {
      return new Response(
        JSON.stringify({ message: "ไฟล์เรซูเม่มีขนาดใหญ่เกินไป (สูงสุด 5MB)" }),
        { status: 413 }
      );
    }

    const userId = toObjectId(userIdRaw) || userIdRaw;

    const client = await clientPromise;
    const db = client.db("myDB");
    const users = db.collection("users");
    const applications = db.collection("workerApplications");

    const userDoc = await users.findOne({
      _id: toObjectId(userIdRaw) || userIdRaw,
    });
    if (!userDoc) {
      return new Response(
        JSON.stringify({ message: "ไม่พบข้อมูลผู้ใช้" }),
        { status: 404 }
      );
    }

    const resumeDoc = {
      filename: resumeFile.name || "resume",
      contentType: resumeFile.type || "application/octet-stream",
      size: resumeBuffer.length,
      data: resumeBuffer.toString("base64"),
      uploadedAt: new Date(),
    };

    const now = new Date();

    const existingApplication = await applications.findOne({ userId });

    if (existingApplication) {
      await applications.updateOne(
        { _id: existingApplication._id },
        {
          $set: {
            firstName,
            lastName,
            phone,
            email,
            resume: resumeDoc,
            status: "pending",
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: existingApplication.createdAt || now,
          },
        }
      );
    } else {
      await applications.insertOne({
        userId,
        firstName,
        lastName,
        phone,
        email,
        resume: resumeDoc,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      });
    }

    await users.updateOne(
      { _id: toObjectId(userIdRaw) || userIdRaw },
      {
        $set: {
          workerApplicationStatus: "pending",
        },
      }
    );

    const applicationDoc = await applications.findOne({ userId });

    return new Response(
      JSON.stringify({
        message: "ส่งคำขอสมัครเรียบร้อยแล้ว",
        application: sanitizeApplication(applicationDoc),
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Create worker application error:", error);
    return new Response(
      JSON.stringify({ message: "ไม่สามารถส่งคำขอสมัครได้" }),
      { status: 500 }
    );
  }
}
