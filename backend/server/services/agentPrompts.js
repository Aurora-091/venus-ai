export function isRealAgent(tenant) {
  return Boolean(tenant?.agentId && !tenant.agentId.startsWith("local-"));
}

export function isRealPhoneNumber(tenant) {
  return Boolean(tenant?.phoneNumberId && !tenant.phoneNumberId.startsWith("local-"));
}

export function buildGreeting(vertical, agentName, businessName) {
  if (vertical === "clinic")
    return `Namaste! Main ${agentName} hoon, ${businessName} se. Main aapki kaise madad kar sakti hoon?`;
  if (vertical === "hotel")
    return `Good day! Thank you for calling ${businessName}. I'm ${agentName}, how may I assist you?`;
  return `Hi! I'm ${agentName} from ${businessName}. How can I help you today?`;
}

export function buildSystemPrompt(vertical, agentName, businessName) {
  if (vertical === "clinic") {
    return `You are ${agentName}, a bilingual Hindi/English AI receptionist for ${businessName}. Handle appointment booking, appointment status, clinic hours, and doctor availability. Be warm, professional, and brief.`;
  }
  if (vertical === "hotel") {
    return `You are ${agentName}, an AI concierge for ${businessName}. Handle room reservations, check-in questions, housekeeping requests, and local recommendations. Be warm, professional, and concise.`;
  }
  return `You are ${agentName}, an AI support agent for ${businessName}. Handle order status, returns, and delivery queries. Be helpful and brief.`;
}

export function buildTools(vertical, tenantId, webhookBase) {
  const endCall = {
    type: "system",
    name: "end_call",
    description: "End the call when the conversation is complete or the customer says goodbye.",
  };

  if (vertical === "clinic" || vertical === "hotel") {
    return [
      {
        type: "webhook",
        name: "check_availability",
        description: "Check available appointment or room slots for a given date.",
        api_schema: {
          url: `${webhookBase}/api/tenants/${tenantId}/tools/check-availability`,
          method: "POST",
          request_headers: { "Content-Type": "application/json" },
          request_body_schema: {
            type: "object",
            properties: { date: { type: "string", description: "Date in YYYY-MM-DD format" } },
            required: ["date"],
          },
        },
      },
      {
        type: "webhook",
        name: "book_appointment",
        description: "Book a confirmed appointment slot for the caller.",
        api_schema: {
          url: `${webhookBase}/api/tenants/${tenantId}/tools/book-appointment`,
          method: "POST",
          request_headers: { "Content-Type": "application/json" },
          request_body_schema: {
            type: "object",
            properties: {
              caller_name: { type: "string", description: "Full name of the caller" },
              caller_phone: { type: "string", description: "Phone number of the caller, including country code if available" },
              slot: { type: "string", description: "Confirmed appointment time slot, such as 2026-04-18 10:00" },
              service: { type: "string", description: "Requested appointment or service type" },
            },
            required: ["caller_name", "slot"],
          },
        },
      },
      endCall,
    ];
  }

  return [
    {
      type: "webhook",
      name: "order_lookup",
      description: "Look up an order by order number.",
      api_schema: {
        url: `${webhookBase}/api/tenants/${tenantId}/tools/order-lookup`,
        method: "POST",
        request_headers: { "Content-Type": "application/json" },
        request_body_schema: {
          type: "object",
          properties: { order_number: { type: "string", description: "Customer order number to look up" } },
          required: ["order_number"],
        },
      },
    },
    endCall,
  ];
}
