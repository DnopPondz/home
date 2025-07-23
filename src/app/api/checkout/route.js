// /app/api/checkout/route.js (Next.js 13+)
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const body = await req.json();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: {
              name: body.serviceName,
              description: `จองวันที่ ${body.bookingDate}, เวลา ${body.bookingTime}`,
            },
            unit_amount: body.amount * 100, // หน่วยเป็นสตางค์
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/page/booking-status?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/page/booking-status?canceled=true`,
      metadata: {
        userId: body.userId,
        bookingInfo: JSON.stringify(body), // เก็บข้อมูลที่จำเป็น
      },
    });

    return new Response(JSON.stringify({ id: session.id }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
