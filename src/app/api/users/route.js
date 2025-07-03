import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("myDB");
    const users = db.collection("users");

    const allUsers = await users.find({}).toArray();

    // ตัด password ออกก่อนส่งกลับ
    const usersWithoutPassword = allUsers.map(({ password, ...rest }) => rest);

    return new Response(JSON.stringify(usersWithoutPassword), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch users" }), {
      status: 500,
    });
  }
}
