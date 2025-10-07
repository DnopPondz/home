import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const resolveBaseUrl = (req) => {
  const candidates = [
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.BASE_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  const headerOrigin = req.headers.get("origin");
  if (typeof headerOrigin === "string" && headerOrigin.trim()) {
    return headerOrigin.trim();
  }

  const host = req.headers.get("host");
  if (typeof host === "string" && host.trim()) {
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return null;
};

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

    const parsedAmount = Number(amount);
    console.log("💰 amount:", amount, typeof amount, "=>", parsedAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      console.warn("❌ จำนวนเงินไม่ถูกต้อง:", amount);
      return new Response(JSON.stringify({ error: "จำนวนเงินไม่ถูกต้อง" }), {
        status: 400,
      });
    }

    if (!serviceName || !bookingDate || !bookingTime || !userId || !customerEmail) {
      console.warn("❌ Missing required fields:", body);
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
      });
    }

    const baseUrl = resolveBaseUrl(req);
    if (!baseUrl) {
      console.warn("⚠️ ไม่พบ base URL สำหรับ Stripe success/cancel URL");
      return new Response(
        JSON.stringify({ error: "ไม่สามารถกำหนดเส้นทางกลับหลังชำระเงินได้" }),
        {
          status: 500,
        }
      );
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
            unit_amount: Math.round(parsedAmount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/page/booking-status?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/page/booking-status?canceled=true`,
      metadata: {
        userId,
        customerEmail,
        bookingInfo: JSON.stringify(body),
      },
    });

    return new Response(
      JSON.stringify({ id: session.id, url: session.url ?? null }),
      {
        status: 200,
      }
    );
  } catch (err) {
    console.error("🔥 [Stripe API Error]:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
