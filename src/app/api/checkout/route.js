// /app/api/checkout/route.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const body = await req.json();
  console.log("💬 [Checkout API] body:", body);

  try {
    const {
      amount,
      serviceName,
      bookingDate,
      bookingTime,
      userId,
      customerEmail,
    } = body;

    if (!amount || !serviceName || !bookingDate || !bookingTime || !userId || !customerEmail) {
      console.warn("❌ Missing required fields:", body);
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: serviceName,
              description: `จองวันที่ ${bookingDate}, เวลา ${bookingTime}`,
            },
            unit_amount: amount * 100, // Stripe ใช้หน่วยเป็นสตางค์
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/page/booking-status?bookingId=${response.data.booking._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/page/booking-status?canceled=true`,
      metadata: {
        userId,
        customerEmail,
        bookingInfo: JSON.stringify(body), // เก็บข้อมูลการจองทั้งหมดใน metadata
      },
    });

    return new Response(JSON.stringify({ id: session.id }), { status: 200 });
  } catch (err) {
    console.error("🔥 [Stripe API Error]:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
