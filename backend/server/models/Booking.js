import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    callerName: { type: String, default: "" },
    callerPhone: { type: String, default: "" },
    service: { type: String, default: "Consultation" },
    slotStart: { type: String, default: "" },
    slotEnd: { type: String, default: "" },
    status: { type: String, default: "confirmed" },
    googleEventId: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        ret.createdAt = ret.createdAt?.toISOString?.() || ret.createdAt;
        delete ret._id;
        return ret;
      },
    },
  },
);

export const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
