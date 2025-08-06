import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// ✅ POST: เพิ่มบริการใหม่พร้อมรูป
export async function POST(req) {
  try {
    const body = await req.json();
    const { serviceType, name, priceOptions, image } = body;

    if (!serviceType || !name || !Array.isArray(priceOptions) || !image) {
      return new Response(JSON.stringify({ message: "ข้อมูลไม่ครบ" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("myDB");
    const servicesCollection = db.collection("services");

    const newService = {
      serviceType,
      name,
      priceOptions,
      image, 
      createdAt: new Date(),
    };

    await servicesCollection.insertOne(newService);

    return new Response(JSON.stringify({ message: "เพิ่มบริการสำเร็จ", service: newService }), { status: 201 });
  } catch (err) {
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