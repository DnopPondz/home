// server.js
const { MongoClient } = require("mongodb")
require("dotenv").config()

const uri = process.env.MONGODB_URI

async function testConnection() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB successfully!")
    const db = client.db("myDB") // ← เปลี่ยนชื่อ DB
    const collections = await db.listCollections().toArray()
    console.log("📦 Collections:", collections.map(c => c.name))
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err)
  } finally {
    await client.close()
  }
}

testConnection()