import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const runtime = "nodejs";

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
