import mongoose, { Schema } from "mongoose";

const ReviewSchema = new Schema(
  {
    bookingId: { type: String, required: true, index: true }, // ใช้ string กันปัญหา ObjectId ไม่ครบ 24 ตัว
    userId: { type: String, required: true, index: true },
    serviceId: { type: String }, // มีหรือไม่มีก็ได้ ตามข้อมูลจริง
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, default: "" },
  },
  { timestamps: true }
);

// กัน re-compile เวลา hot reload
export const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);