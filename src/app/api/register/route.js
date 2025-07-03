import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import FormData from "form-data"
import { Readable } from "stream"
import { promisify } from "util"

export const runtime = "nodejs"

const IMGBB_API_KEY = process.env.IMGBB_API_KEY // ใส่ใน .env.local

export async function POST(req) {
  try {
    // ดึงข้อมูล multipart/form-data
    const contentType = req.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ message: "Invalid content type" }), { status: 400 })
    }

    const formData = await req.formData()

    const firstName = formData.get("firstName")
    const lastName = formData.get("lastName")
    const email = formData.get("email")
    const password = formData.get("password")
    const phone = formData.get("phone")
    const location = formData.get("location")
    const file = formData.get("image") // รูปภาพ
    

    if (!firstName || !lastName || !email || !password || !phone || !location || !file) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), { status: 400 })
    }

    // 📤 อัปโหลดรูปไป ImgBB
    const arrayBuffer = await file.arrayBuffer()
const base64Image = Buffer.from(arrayBuffer).toString("base64")

const body = new URLSearchParams()
body.append("image", base64Image)


    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: body.toString(),
})

    const imgbbData = await imgbbRes.json()
    const imageUrl = imgbbData?.data?.url

    if (!imageUrl) {
      return new Response(JSON.stringify({ message: "Failed to upload image to ImgBB" }), { status: 500 })
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 🛢 บันทึกข้อมูลลง MongoDB
    const client = await clientPromise
    const db = client.db("myDB")
    const users = db.collection("users")

    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return new Response(JSON.stringify({ message: "User already exists" }), { status: 409 })
    }

    const result = await users.insertOne({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      location,
      imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return new Response(JSON.stringify({ message: "User registered", userId: result.insertedId }), { status: 201 })

  } catch (error) {
    console.error("Register Error:", error)
    return new Response(JSON.stringify({ message: "Server Error" }), { status: 500 })
  }
}
