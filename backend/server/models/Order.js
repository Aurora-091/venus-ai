import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    status: { type: String, default: "Processing" },
    itemsSummary: { type: String, default: "" },
    total: { type: Number, default: 0 },
    expectedDelivery: { type: String, default: "" },
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

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
