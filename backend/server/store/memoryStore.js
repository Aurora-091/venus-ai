import crypto from "node:crypto";

const now = () => new Date().toISOString();

export const memoryStore = {
  users: [
    {
      id: "demo-user-001",
      name: "VoiceOS Demo",
      email: "demo@voiceos.ai",
      password: "demo1234",
      role: "super_admin",
      tenantId: "",
    },
  ],
  tenants: [
    {
      id: "demo-clinic-001",
      name: "City Clinic Delhi",
      vertical: "clinic",
      slug: "city-clinic-delhi",
      plan: "growth",
      status: "active",
      agentName: "Priya",
      agentLanguage: "hi",
      agentVoiceId: "1Z7Y8o9cvUeWq8oLKgMY",
      agentGreeting: "Namaste! Main Priya hoon, City Clinic Delhi se. Main aapki kaise madad kar sakti hoon?",
      agentStatus: "active",
      agentId: "",
      phoneNumber: "",
      phoneNumberId: "",
      businessHoursStart: "09:00",
      businessHoursEnd: "18:00",
      timezone: "Asia/Kolkata",
      createdAt: now(),
    },
    {
      id: "demo-hotel-001",
      name: "The Grand Residency",
      vertical: "hotel",
      slug: "grand-residency",
      plan: "growth",
      status: "active",
      agentName: "Aria",
      agentLanguage: "en",
      agentVoiceId: "21m00Tcm4TlvDq8ikWAM",
      agentGreeting: "Good day! Thank you for calling The Grand Residency. I'm Aria, how may I assist you?",
      agentStatus: "active",
      agentId: "",
      phoneNumber: "",
      phoneNumberId: "",
      businessHoursStart: "09:00",
      businessHoursEnd: "21:00",
      timezone: "Asia/Kolkata",
      createdAt: now(),
    },
  ],
  calls: [],
  bookings: [],
  orders: [],
};

for (let i = 0; i < 12; i += 1) {
  const tenantId = i % 2 === 0 ? "demo-clinic-001" : "demo-hotel-001";
  memoryStore.calls.push({
    id: crypto.randomUUID(),
    tenantId,
    callerNumber: `+91${9876543210 - i}`,
    direction: "inbound",
    durationSeconds: 80 + i * 12,
    outcome: i % 4 === 0 ? "escalated" : "completed",
    summary: tenantId === "demo-clinic-001" ? "Appointment enquiry handled" : "Room reservation question handled",
    createdAt: now(),
  });
}

memoryStore.bookings.push(
  {
    id: crypto.randomUUID(),
    tenantId: "demo-clinic-001",
    callerName: "Aarav Sharma",
    callerPhone: "+919876543210",
    service: "General Consultation",
    slotStart: "2026-04-17T10:00:00.000Z",
    slotEnd: "2026-04-17T10:30:00.000Z",
    status: "confirmed",
    createdAt: now(),
  },
  {
    id: crypto.randomUUID(),
    tenantId: "demo-hotel-001",
    callerName: "Sneha Reddy",
    callerPhone: "+919876543213",
    service: "Deluxe Room",
    slotStart: "2026-04-20T14:00:00.000Z",
    slotEnd: "2026-04-21T10:00:00.000Z",
    status: "confirmed",
    createdAt: now(),
  },
);

memoryStore.orders.push({
  id: crypto.randomUUID(),
  tenantId: "demo-clinic-001",
  orderNumber: "101",
  customerName: "Aarav Sharma",
  customerPhone: "+919876543210",
  status: "In Transit",
  itemsSummary: "Clinic report package",
  total: 1598,
  expectedDelivery: "18 April 2026",
  createdAt: now(),
});
