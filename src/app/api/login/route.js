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

    // ส่งข้อมูลผู้ใช้บางส่วนกลับไป (ไม่รวม password)
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
        },
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error("Login Error:", error)
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 })
  }
}
