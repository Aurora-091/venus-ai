import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    callerNumber: { type: String, default: "" },
    direction: { type: String, default: "inbound" },
    durationSeconds: { type: Number, default: 0 },
    outcome: { type: String, default: "completed" },
    summary: { type: String, default: "" },
    conversationId: { type: String, default: "" },
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

export const CallLog = mongoose.models.CallLog || mongoose.model("CallLog", callLogSchema);
