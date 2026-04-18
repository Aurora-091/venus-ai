import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ── Better Auth tables ──
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("tenant_admin"), // super_admin | tenant_admin
  tenantId: text("tenant_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ── Tenants ──
export const tenants = sqliteTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  vertical: text("vertical").notNull(), // clinic | hotel | ecommerce
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull().default("starter"), // starter | growth | enterprise
  status: text("status").notNull().default("active"),
  // ElevenLabs + Twilio
  agentId: text("agent_id").default(""),
  phoneNumberId: text("phone_number_id").default(""),
  phoneNumber: text("phone_number").default(""),
  agentStatus: text("agent_status").notNull().default("not_configured"),
  // Agent config
  agentName: text("agent_name").notNull().default("Aria"),
  agentLanguage: text("agent_language").notNull().default("en"),
  agentVoiceId: text("agent_voice_id").notNull().default("21m00Tcm4TlvDq8ikWAM"),
  agentGreeting: text("agent_greeting").default(""),
  businessHoursStart: text("business_hours_start").default("09:00"),
  businessHoursEnd: text("business_hours_end").default("18:00"),
  timezone: text("timezone").default("Asia/Kolkata"),
  // White-label
  whitelabelEnabled: integer("whitelabel_enabled", { mode: "boolean" }).default(false),
  whitelabelBrand: text("whitelabel_brand").default(""),
  createdAt: text("created_at").notNull().default(""),
});

// ── Google Calendar Integration ──
export const integrations = sqliteTable("integrations", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  type: text("type").notNull(), // google_calendar | shopify | webhook
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: text("token_expiry"),
  calendarId: text("calendar_id").default("primary"),
  config: text("config").default("{}"), // JSON blob for extra config
  connected: integer("connected", { mode: "boolean" }).default(false),
  createdAt: text("created_at").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(""),
});

// ── Call Logs ──
export const callLogs = sqliteTable("call_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(),
  callerNumber: text("caller_number"),
  direction: text("direction").notNull().default("inbound"), // inbound | outbound
  durationSeconds: integer("duration_seconds"),
  outcome: text("outcome").default("completed"), // completed | escalated | missed | voicemail
  transcript: text("transcript"),
  summary: text("summary"),
  conversationId: text("conversation_id"),
  createdAt: text("created_at").notNull().default(""),
});

// ── Bookings (appointments / reservations) ──
export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(),
  callerNumber: text("caller_number"),
  callerName: text("caller_name"),
  service: text("service"), // e.g. "General Consultation", "Room 101"
  slotStart: text("slot_start").notNull(),
  slotEnd: text("slot_end"),
  status: text("status").notNull().default("confirmed"), // confirmed | cancelled | rescheduled
  googleEventId: text("google_event_id"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(""),
});

// ── Demo / Mock data for e-com ──
export const demoOrders = sqliteTable("demo_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull(),
  orderNumber: text("order_number").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  status: text("status").notNull(),
  itemsSummary: text("items_summary").notNull(),
  total: real("total").notNull(),
  expectedDelivery: text("expected_delivery"),
  createdAt: text("created_at").notNull().default(""),
});
