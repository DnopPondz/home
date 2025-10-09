import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RANGE_MAP = {
  week: (date) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 7);
    return newDate;
  },
  month: (date) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    return newDate;
  },
  year: (date) => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() - 1);
    return newDate;
  },
};

const NORMALIZED_RANGES = new Set(["week", "month", "year"]);

const parseAmount = (booking) => {
  const { amount, estimatedPrice, price } = booking || {};

  if (typeof amount === "number" && !Number.isNaN(amount)) {
    return amount;
  }

  if (typeof amount === "string") {
    const numeric = parseFloat(amount.replace(/[^\d.-]/g, ""));
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }

  if (typeof price === "number" && !Number.isNaN(price)) {
    return price;
  }

  if (typeof estimatedPrice === "string") {
    const numeric = parseFloat(estimatedPrice.replace(/[^\d.-]/g, ""));
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }

  return 0;
};

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const rangeParam = (url.searchParams.get("range") || "month").toLowerCase();
    const range = NORMALIZED_RANGES.has(rangeParam) ? rangeParam : "month";

    const now = new Date();
    const startDate = (RANGE_MAP[range] || RANGE_MAP.month)(now);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const client = await clientPromise;
    const db = client.db("myDB");
    const bookingsCollection = db.collection("bookings");
    const servicesCollection = db.collection("services");

    const match = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    const bookings = await bookingsCollection.find(match).toArray();

    const serviceNameMap = new Map();
    const serviceIdsToFetch = [];

    for (const booking of bookings) {
      if (!booking?.serviceId) continue;

      const serviceIdString = booking.serviceId.toString();
      if (booking.serviceName) {
        serviceNameMap.set(serviceIdString, booking.serviceName);
      } else if (!serviceNameMap.has(serviceIdString)) {
        serviceIdsToFetch.push(serviceIdString);
      }
    }

    if (serviceIdsToFetch.length > 0) {
      const uniqueIds = [...new Set(serviceIdsToFetch)].map((id) => new ObjectId(id));
      const services = await servicesCollection
        .find({ _id: { $in: uniqueIds } })
        .project({ name: 1 })
        .toArray();

      services.forEach((service) => {
        serviceNameMap.set(service._id.toString(), service.name || "ไม่ระบุบริการ");
      });
    }

    const normalizeStatus = (value) => {
      const status = String(value || "").toLowerCase();
      if (!status) return "other";

      if (["completed", "เสร็จสิ้น", "จบงาน", "สำเร็จ"].includes(status)) {
        return "completed";
      }

      if (["rejected", "ยกเลิก", "ถูกยกเลิก", "cancelled", "canceled"].includes(status)) {
        return "rejected";
      }

      return "other";
    };

    const salesMap = new Map();
    let totalRevenue = 0;
    let totalCompletedBookings = 0;
    let totalCancelledRevenue = 0;
    let totalCancelledBookings = 0;

    for (const booking of bookings) {
      const revenue = parseAmount(booking);
      if (revenue < 0) {
        continue;
      }

      const normalizedStatus = normalizeStatus(booking?.status);
      if (normalizedStatus !== "completed" && normalizedStatus !== "rejected") {
        continue;
      }

      const serviceIdString = booking?.serviceId ? booking.serviceId.toString() : null;
      const serviceName = booking?.serviceName || (serviceIdString ? serviceNameMap.get(serviceIdString) : null) || "ไม่ระบุบริการ";
      const key = serviceIdString || serviceName;

      if (!salesMap.has(key)) {
        salesMap.set(key, {
          serviceId: serviceIdString,
          serviceName,
          completedRevenue: 0,
          completedBookings: 0,
          cancelledRevenue: 0,
          cancelledBookings: 0,
        });
      }

      const entry = salesMap.get(key);
      if (normalizedStatus === "completed") {
        entry.completedRevenue += revenue;
        entry.completedBookings += 1;
        totalRevenue += revenue;
        totalCompletedBookings += 1;
      }

      if (normalizedStatus === "rejected") {
        entry.cancelledRevenue += revenue;
        entry.cancelledBookings += 1;
        totalCancelledRevenue += revenue;
        totalCancelledBookings += 1;
      }
    }

    const services = Array.from(salesMap.values())
      .filter((service) => service.completedBookings > 0 || service.cancelledBookings > 0)
      .map((service) => ({
        ...service,
        totalRevenue: service.completedRevenue,
        totalBookings: service.completedBookings,
      }))
      .sort((a, b) => b.completedRevenue - a.completedRevenue);

    return NextResponse.json({
      range,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalRevenue,
      totalBookings: totalCompletedBookings,
      totalCancelledRevenue,
      totalCancelledBookings,
      services,
      currency: "THB",
    });
  } catch (error) {
    console.error("Error generating sales summary:", error);
    return NextResponse.json(
      { message: "ไม่สามารถดึงข้อมูลยอดขายได้" },
      { status: 500 }
    );
  }
}
