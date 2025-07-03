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

    // กำหนด role: ถ้า user มี role อยู่แล้วใช้ role นั้น, ถ้าไม่มีและเป็น admin@sv.com ก็ให้เป็น admin
    let role = "user"
    if (user.role) {
      role = user.role
    } else if (user.email === "admin@sv.com") {
      role = "admin"
    }

    // กำหนดหน้า redirect ตาม role
    const redirectTo = role === "admin" ? "/page/admin/dashboard" : "/"

    // ส่งข้อมูล user บางส่วน (ไม่รวม password) และ role กับ redirectTo กลับไปด้วย
    const { _id, firstName, lastName, imageUrl, phone, location } = user

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
          role,         // เพิ่ม role เพื่อให้ frontend ใช้งานได้
        },
        redirectTo,      // เพิ่ม redirectTo ให้ frontend
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error("Login Error:", error)
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 })
  }
}
