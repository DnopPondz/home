import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { EJSON } from "bson";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const toPlain = (v) => JSON.parse(EJSON.stringify(v, { relaxed: true }));
const isDev = process.env.NODE_ENV !== "production";
const MAX_REVIEW_PHOTOS = 5;

function toObjectIdOrNull(v) {
  if (!v) return null;
  if (v instanceof ObjectId) return v;
  if (typeof v === "object" && "$oid" in v && ObjectId.isValid(v.$oid)) {
    return new ObjectId(v.$oid);
  }
  if (typeof v === "string" && ObjectId.isValid(v)) {
    return new ObjectId(v);
  }
  return null;
}

function sanitizeReviewPhoto(input, fallbackDate = new Date()) {
  if (!input) return null;

  if (typeof input === "string") {
    let rawData = input.trim();
    if (!rawData) return null;

    let contentType = "image/jpeg";
    if (rawData.startsWith("data:")) {
      const [prefix, base64] = rawData.split(",", 2);
      rawData = base64 || "";
      const match = prefix.match(/data:(.*?);base64/);
      if (match?.[1]) {
        contentType = match[1];
      }
    }

    if (!rawData) return null;

    return {
      data: rawData,
      contentType,
      filename: null,
      uploadedAt: fallbackDate,
    };
  }

  if (typeof input !== "object") return null;

  let rawData = "";
  if (typeof input.data === "string" && input.data.trim()) {
    rawData = input.data.trim();
  } else if (typeof input.base64 === "string" && input.base64.trim()) {
    rawData = input.base64.trim();
  } else if (typeof input.dataUrl === "string" && input.dataUrl.trim()) {
    rawData = input.dataUrl.trim();
  }

  let contentType = "";
  if (typeof input.contentType === "string" && input.contentType.trim()) {
    contentType = input.contentType.trim();
  } else if (typeof input.type === "string" && input.type.trim()) {
    contentType = input.type.trim();
  }

  if (rawData.startsWith("data:")) {
    const [prefix, base64] = rawData.split(",", 2);
    rawData = base64 || "";
    if (!contentType && prefix) {
      const match = prefix.match(/data:(.*?);base64/);
      if (match?.[1]) {
        contentType = match[1];
      }
    }
  }

  if (!rawData) return null;

  const uploadedAtRaw = input.uploadedAt || input.createdAt || fallbackDate;
  const uploadedAt = new Date(uploadedAtRaw);
  if (Number.isNaN(uploadedAt.getTime())) {
    uploadedAt.setTime(fallbackDate.getTime());
  }

  const sanitized = {
    data: rawData,
    contentType: contentType || "image/jpeg",
    filename:
      typeof input.filename === "string" && input.filename.trim()
        ? input.filename.trim()
        : typeof input.name === "string" && input.name.trim()
        ? input.name.trim()
        : null,
    uploadedAt,
  };

  if (typeof input.size === "number" && Number.isFinite(input.size)) {
    sanitized.size = input.size;
  }

  return sanitized;
}

function sanitizeReviewPhotosArray(input, fallbackDate = new Date()) {
  if (!Array.isArray(input)) return [];
  return input
    .map((photo) => sanitizeReviewPhoto(photo, fallbackDate))
    .filter(Boolean);
}

function jsonOK(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
function jsonERR(message, status = 400, extra = {}) {
  const body = isDev ? { message, ...extra } : { message };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function getDb() {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || "myDB";
  return client.db(dbName);
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userIdParam = url.searchParams.get("userId");
    const serviceIdParam = url.searchParams.get("serviceId");
    const bookingIdParam = url.searchParams.get("bookingId");

    const db = await getDb();
    const bookings = db.collection("bookings");

    const match = { status: "completed" };

    if (userIdParam) {
      const oid = toObjectIdOrNull(userIdParam);
      if (oid) match.userId = oid;
      else match.userIdStr = String(userIdParam);
    }
    if (serviceIdParam) {
      const oid = toObjectIdOrNull(serviceIdParam);
      if (oid) match.serviceId = oid;
      else match.serviceIdStr = String(serviceIdParam);
    }
    if (bookingIdParam) {
      const oid = toObjectIdOrNull(bookingIdParam);
      if (oid) match._id = oid;
      else match.bookingIdStr = String(bookingIdParam);
    }

    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "serviceDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
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
          completionPhotos: 1,
          completedAt: 1,
          rating: 1,
          review: 1,
          reviewDetail: 1,
          reviewPhotos: 1,
          reviewedAt: 1,
          serviceDetails: { $arrayElemAt: ["$serviceDetails", 0] },
          userDetails: { $arrayElemAt: ["$userDetails", 0] },
        },
      },
    ];

    const results = await bookings.aggregate(pipeline, { allowDiskUse: true }).toArray();
    return jsonOK({ message: "ดึงข้อมูลรีวิวสำเร็จ", data: results });
  } catch (error) {
    console.error("GET /api/reviews error", error);
    return jsonERR("เกิดข้อผิดพลาด", 500, { error: String(error?.message || error) });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    let { bookingId, userId, rating, comment, photos } = body || {};
    rating = Number(rating);

    if (!bookingId || !userId || !Number.isFinite(rating))
      return jsonERR("ข้อมูลไม่ครบถ้วน", 400);
    if (rating < 1 || rating > 5)
      return jsonERR("คะแนนต้องอยู่ระหว่าง 1-5", 400);

    const bookingOid = toObjectIdOrNull(bookingId);
    if (!bookingOid) return jsonERR("bookingId ไม่ถูกต้อง", 400);

    const db = await getDb();
    const bookings = db.collection("bookings");

    const booking = await bookings.findOne({ _id: bookingOid });
    if (!booking) return jsonERR("ไม่พบคำสั่งจอง", 404);

    const providedUserOid = toObjectIdOrNull(userId);
    const matches = booking.userId instanceof ObjectId
      ? (providedUserOid && booking.userId.equals(providedUserOid))
      : (String(booking.userId) === String(userId) ||
         String(booking.userIdStr || "") === String(userId));
    if (!matches) return jsonERR("คุณไม่มีสิทธิ์รีวิวคำสั่งจองนี้", 403);
    if (booking.status !== "completed")
      return jsonERR("สามารถรีวิวได้เฉพาะงานที่เสร็จสิ้นแล้วเท่านั้น", 400);

    const now = new Date();
    const hasPhotoPayload = Array.isArray(photos);
    const photoInput = hasPhotoPayload
      ? photos
      : Array.isArray(booking.reviewDetail?.photos)
      ? booking.reviewDetail.photos
      : Array.isArray(booking.reviewPhotos)
      ? booking.reviewPhotos
      : [];

    if (hasPhotoPayload && photoInput.length > MAX_REVIEW_PHOTOS) {
      return jsonERR(
        `สามารถอัปโหลดรูปภาพได้สูงสุด ${MAX_REVIEW_PHOTOS} รูป`,
        400
      );
    }

    let sanitizedPhotos = sanitizeReviewPhotosArray(photoInput, now);
    if (sanitizedPhotos.length > MAX_REVIEW_PHOTOS) {
      sanitizedPhotos = sanitizedPhotos.slice(0, MAX_REVIEW_PHOTOS);
    }

    const reviewDetail = {
      bookingId: booking._id,
      serviceId: booking.serviceId ?? null,
      userId: booking.userId ?? null,
      rating,
      comment: String(comment || "").trim(),
      createdAt: booking.reviewDetail?.createdAt || now,
      updatedAt: now,
      photos: sanitizedPhotos,
    };

    // --- อัปเดต + ขอเอกสารที่อัปเดตกลับมา
    const res = await bookings.findOneAndUpdate(
      { _id: booking._id },
      {
        $set: {
          rating,
          review: reviewDetail.comment,
          reviewDetail,
          reviewedAt: now,
          reviewPhotos: sanitizedPhotos,
        },
      },
      { returnDocument: "after" } // v5 ใช้ได้, v6 ก็ไม่ error
    );

    // รองรับทั้งรูปแบบ { value } (v5) และคืน doc ตรง ๆ (v6)
    let doc = res?.value ?? res ?? null;

    // ถ้า driver คืน null แต่จริง ๆ อัปเดตแล้ว (บาง environment เจอได้)
    if (!doc) {
      doc = await bookings.findOne(
        { _id: booking._id },
        { projection: { _id: 1, rating: 1, review: 1, reviewedAt: 1, reviewDetail: 1 } }
      );
      if (!doc) return jsonERR("บันทึกรีวิวไม่สำเร็จ", 500);
    }

    return jsonOK({
      message: "บันทึกรีวิวเรียบร้อย",
      review: toPlain(doc.reviewDetail),
      booking: toPlain({
        _id: doc._id,
        rating: doc.rating,
        review: doc.review,
        reviewedAt: doc.reviewedAt,
        reviewPhotos: doc.reviewPhotos || doc.reviewDetail?.photos || [],
      }),
    });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return jsonERR("เกิดข้อผิดพลาด", 500, { error: String(error?.message || error) });
  }
}