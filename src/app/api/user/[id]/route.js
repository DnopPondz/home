import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;

  const imageUrl = userDoc.imageUrl || "";
  const firstName = userDoc.firstName || "";
  const lastName = userDoc.lastName || "";

  return {
    userId: userDoc._id?.toString?.() || userDoc._id,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email: userDoc.email || "",
    phone: userDoc.phone || "",
    location: userDoc.location || "",
    imageUrl,
    avatar: imageUrl,
    role: userDoc.role || "user",
  };
};

const uploadAvatarToImgBB = async (file) => {
  if (!file || typeof file.arrayBuffer !== "function") {
    return null;
  }

  if (!IMGBB_API_KEY) {
    throw new Error("ไม่พบค่า IMGBB_API_KEY ในระบบ");
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString("base64");
  const body = new URLSearchParams();
  body.append("image", base64Image);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error("อัปโหลดรูปภาพไม่สำเร็จ");
  }

  const result = await response.json();
  return result?.data?.url || null;
};

const getFormValue = (formData, key) => {
  const value = formData.get(key);
  if (value === null || typeof value === "undefined") return undefined;
  if (typeof value === "string") return value.trim();
  return value;
};

// PATCH: อัปเดตข้อมูลผู้ใช้ (เช่น role, name, email)
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const data = await req.json(); // รองรับหลายฟิลด์ เช่น { firstName, lastName, role }

    const client = await clientPromise;
    const db = client.db("myDB");
    const users = db.collection("users");

    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "User updated" }), { status: 200 });
  } catch (err) {
    console.error("Update error:", err);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}

// DELETE: ลบผู้ใช้
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    const client = await clientPromise;
    const db = client.db("myDB");
    const users = db.collection("users");

    const result = await users.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "User deleted" }), { status: 200 });
  } catch (err) {
    console.error("Delete error:", err);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ message: "รหัสผู้ใช้ไม่ถูกต้อง" }), { status: 400 });
    }

    const contentType = req.headers.get("content-type") || "";
    const client = await clientPromise;
    const db = client.db("myDB");
    const users = db.collection("users");

    let updatePayload = {};
    let avatarFile = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const firstName = getFormValue(formData, "firstName");
      const lastName = getFormValue(formData, "lastName");
      const email = getFormValue(formData, "email");
      const phone = getFormValue(formData, "phone");
      const location = getFormValue(formData, "location");
      const imageUrl = getFormValue(formData, "imageUrl");
      const avatar = formData.get("avatar");

      updatePayload = {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(location !== undefined ? { location } : {}),
      };

      if (avatar && typeof avatar === "object" && "arrayBuffer" in avatar) {
        avatarFile = avatar;
      } else if (typeof imageUrl === "string" && imageUrl) {
        updatePayload.imageUrl = imageUrl;
      }
    } else {
      const body = await req.json();
      updatePayload = { ...body };
    }

    if (Object.keys(updatePayload).length === 0 && !avatarFile) {
      return new Response(JSON.stringify({ message: "ไม่มีข้อมูลที่ต้องการอัปเดต" }), { status: 400 });
    }

    if (avatarFile) {
      const uploadedUrl = await uploadAvatarToImgBB(avatarFile);
      if (uploadedUrl) {
        updatePayload.imageUrl = uploadedUrl;
      }
    }

    updatePayload.updatedAt = new Date();
    if (updatePayload.firstName || updatePayload.lastName) {
      const firstName = updatePayload.firstName ?? "";
      const lastName = updatePayload.lastName ?? "";
      updatePayload.name = `${firstName} ${lastName}`.trim();
    }

    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatePayload },
      { returnDocument: "after", projection: { password: 0 } }
    );

    const updatedUser = result?.value ?? result;

    if (!updatedUser) {
      return new Response(JSON.stringify({ message: "ไม่พบข้อมูลผู้ใช้" }), { status: 404 });
    }

    const sanitized = sanitizeUser(updatedUser);

    return new Response(
      JSON.stringify({ message: "อัปเดตข้อมูลสำเร็จ", user: sanitized }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("PUT /api/user/[id] error:", err);
    return new Response(
      JSON.stringify({ message: err.message || "เกิดข้อผิดพลาดภายในระบบ" }),
      { status: 500 }
    );
  }
}
