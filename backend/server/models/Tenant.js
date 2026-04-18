import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    vertical: { type: String, default: "clinic" },
    slug: { type: String, required: true, unique: true },
    plan: { type: String, default: "starter" },
    status: { type: String, default: "active" },
    agentName: { type: String, default: "Aria" },
    agentLanguage: { type: String, default: "en" },
    agentVoiceId: { type: String, default: "" },
    agentGreeting: { type: String, default: "" },
    agentStatus: { type: String, default: "not_configured" },
    agentId: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    phoneNumberId: { type: String, default: "" },
    businessHoursStart: { type: String, default: "09:00" },
    businessHoursEnd: { type: String, default: "18:00" },
    timezone: { type: String, default: "Asia/Kolkata" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  },
);

export const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", tenantSchema);
