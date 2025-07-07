import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// GET /api/services/[id] — ดึงบริการตาม id
export async function GET(context) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ message: "ID ไม่ถูกต้อง" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const service = await db.collection("services").findOne({ _id: new ObjectId(id) });

    if (!service) {
      return new Response(JSON.stringify({ message: "ไม่พบบริการนี้" }), { status: 404 });
    }

    return new Response(JSON.stringify(service), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
  }
}

// PATCH /api/services/[id] — แก้ไขบริการ
export async function PATCH(req, context) {
  try {
    // await context.params เพราะ Next.js ใช้ async params
    const params = await context.params;
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ message: "ID ไม่ถูกต้อง" }), { status: 400 });
    }

    const body = await req.json();
    const { serviceType, name, priceOptions } = body;

    if (!serviceType || !name || !Array.isArray(priceOptions)) {
      return new Response(JSON.stringify({ message: "ข้อมูลไม่ครบ" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const servicesCollection = db.collection("services");

    const service = await servicesCollection.findOne({ _id: new ObjectId(id) });
    if (!service) {
      return new Response(JSON.stringify({ message: "ไม่พบบริการนี้" }), { status: 404 });
    }

    const updated = await servicesCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { serviceType, name, priceOptions } },
      { returnDocument: "after" } // หรือถ้า driver รุ่นเก่า ใช้ { returnOriginal: false }
    );

    return new Response(JSON.stringify({ message: "แก้ไขบริการสำเร็จ", service: updated.value }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
  }
}

// DELETE /api/services/[id] — ลบบริการ
export async function DELETE(req, context) {
  try {
    const params = await context.params;
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ message: "ID ไม่ถูกต้อง" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const servicesCollection = db.collection("services");

    const deleted = await servicesCollection.deleteOne({ _id: new ObjectId(id) });

    if (deleted.deletedCount === 0) {
      return new Response(JSON.stringify({ message: "ไม่พบบริการนี้" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "ลบบริการสำเร็จ" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
  }
}
