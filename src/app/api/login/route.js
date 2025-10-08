import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return new Response(JSON.stringify({ message: "Missing credentials" }), { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("myDB")
    const users = db.collection("users")

    const user = await users.findOne({ email })

    if (!user) {
      return new Response(JSON.stringify({ message: "Invalid email or password" }), { status: 401 })
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
      return new Response(JSON.stringify({ message: "Invalid email or password" }), { status: 401 })
    }

    // กำหนด role: ถ้า user มี role อยู่แล้วใช้ role นั้น, ถ้าไม่มีและเป็น admin@sv.com ให้เป็น admin กับ worker
    let role = user.role ? (Array.isArray(user.role) ? user.role : [user.role]) : ["user"]

    if (user.email === "admin@sv.com") {
      if (!role.includes("admin")) role.push("admin")
      if (!role.includes("worker")) role.push("worker")
    }

    // กำหนด redirect ไปหน้าที่เหมาะสม
    let redirectTo = "/"
    if (role.includes("admin")) {
      redirectTo = "/page/admin/dashboard"
    } else if (role.includes("worker")) {
      redirectTo = "/page/admin/service"
    }

    // ส่งข้อมูล user กลับ (ยกเว้น password)
    const {
      _id,
      firstName,
      lastName,
      imageUrl,
      phone,
      location,
      workerApplicationStatus,
    } = user

    return new Response(
      JSON.stringify({
        message: "Login success",
        user: {
          userId: _id,
          firstName,
          lastName,
          email,
          phone,
          location,
          imageUrl,
          role,  // array role
          workerApplicationStatus: workerApplicationStatus || "none",
        },
        redirectTo,
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error("Login Error:", error)
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 })
  }
}
