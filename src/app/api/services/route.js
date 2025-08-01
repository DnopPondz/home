import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

export async function POST(req) {
  try {
    // สมมติ client ส่ง multipart/form-data (เหมือน register)
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(JSON.stringify({ message: "Invalid content type" }), { status: 400 });
    }

    const formData = await req.formData();

    const serviceType = formData.get("serviceType");
    const name = formData.get("name");
    const priceOptions = JSON.parse(formData.get("priceOptions") || "[]");
    const file = formData.get("image");

    if (!serviceType || !name || !Array.isArray(priceOptions) || !file) {
      return new Response(JSON.stringify({ message: "ข้อมูลไม่ครบ" }), { status: 400 });
    }

    // อัปโหลดรูปไป imgbb
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const body = new URLSearchParams();
    body.append("image", base64Image);

    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const imgbbData = await imgbbRes.json();
    const imageUrl = imgbbData?.data?.url;

    if (!imageUrl) {
      return new Response(JSON.stringify({ message: "Failed to upload image to ImgBB" }), { status: 500 });
    }

    // บันทึกข้อมูลลง MongoDB
    const client = await clientPromise;
    const db = client.db("myDB");
    const servicesCollection = db.collection("services");

    const newService = {
      serviceType,
      name,
      priceOptions,
      image: imageUrl, // เก็บ url ที่ได้จาก imgbb
      createdAt: new Date(),
    };

    await servicesCollection.insertOne(newService);

    return new Response(JSON.stringify({ message: "เพิ่มบริการสำเร็จ", service: newService }), { status: 201 });
  } catch (err) {
    console.error("Service POST Error:", err);
    return new Response(JSON.stringify({ message: "เกิดข้อผิดพลาด" }), { status: 500 });
  }
}


// ✅ GET: ดึงรายการบริการทั้งหมด
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("myDB");
    const servicesCollection = db.collection("services");

    const services = await servicesCollection.find({}).toArray();

    return new Response(JSON.stringify(services), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: "ดึงข้อมูลไม่สำเร็จ" }), { status: 500 });
  }
}
