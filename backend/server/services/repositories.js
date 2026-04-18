import crypto from "node:crypto";
import mongoose from "mongoose";
import { Booking } from "../models/Booking.js";
import { CallLog } from "../models/CallLog.js";
import { Order } from "../models/Order.js";
import { Tenant } from "../models/Tenant.js";
import { User } from "../models/User.js";
import { memoryStore } from "../store/memoryStore.js";

const isMongoReady = () => mongoose.connection.readyState === 1;
const asLean = (doc) => doc?.toJSON?.() || doc;
const makeSlug = (name, id) => `${name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")}-${id.slice(0, 6)}`;

export async function findUserByEmail(email) {
  if (isMongoReady()) return User.findOne({ email: email.toLowerCase() }).lean();
  return memoryStore.users.find((user) => user.email === email.toLowerCase()) || null;
}

export async function findUserById(id) {
  if (isMongoReady()) return User.findById(id).lean();
  return memoryStore.users.find((user) => user.id === id) || null;
}

export async function createUser(payload) {
  if (isMongoReady()) return asLean(await User.create(payload));
  const user = { id: crypto.randomUUID(), role: "tenant_admin", tenantId: "", ...payload };
  memoryStore.users.push(user);
  return user;
}

export async function listTenants(user) {
  if (isMongoReady()) {
    if (user?.role === "super_admin") return Tenant.find().sort({ createdAt: -1 });
    if (user?.tenantId) return Tenant.find({ _id: user.tenantId });
    return [];
  }

  if (user?.role === "super_admin") return memoryStore.tenants;
  if (user?.tenantId) return memoryStore.tenants.filter((tenant) => tenant.id === user.tenantId);
  return memoryStore.tenants;
}

export async function findTenantById(id) {
  if (isMongoReady()) return Tenant.findById(id).lean();
  return memoryStore.tenants.find((tenant) => tenant.id === id) || null;
}

export async function createTenant(payload, user) {
  const id = crypto.randomUUID();
  const tenant = {
    ...payload,
    slug: makeSlug(payload.name, id),
    agentName: payload.agentName || "Aria",
    agentLanguage: payload.agentLanguage || "en",
    agentGreeting: buildGreeting(payload.vertical, payload.agentName || "Aria", payload.name),
    status: "active",
    plan: "starter",
  };

  if (isMongoReady()) {
    const created = await Tenant.create(tenant);
    if (user?._id && user.role !== "super_admin") {
      await User.findByIdAndUpdate(user._id, { tenantId: created._id.toString(), role: "tenant_admin" });
    }
    return created.toJSON();
  }

  const created = { id, ...tenant, createdAt: new Date().toISOString() };
  memoryStore.tenants.unshift(created);
  const storeUser = memoryStore.users.find((item) => item.id === user?.id);
  if (storeUser && storeUser.role !== "super_admin") {
    storeUser.tenantId = id;
    storeUser.role = "tenant_admin";
  }
  return created;
}

export async function updateTenant(id, payload) {
  if (isMongoReady()) return Tenant.findByIdAndUpdate(id, payload, { new: true });
  const tenant = memoryStore.tenants.find((item) => item.id === id);
  if (!tenant) return null;
  Object.assign(tenant, payload);
  return tenant;
}

export async function deleteTenant(id) {
  if (isMongoReady()) {
    await Tenant.findByIdAndDelete(id);
    return;
  }
  memoryStore.tenants = memoryStore.tenants.filter((tenant) => tenant.id !== id);
}

export async function listCalls(tenantId) {
  if (isMongoReady()) return CallLog.find({ tenantId }).sort({ createdAt: -1 }).limit(50);
  return memoryStore.calls.filter((call) => call.tenantId === tenantId);
}

export async function listBookings(tenantId) {
  if (isMongoReady()) return Booking.find({ tenantId }).sort({ createdAt: -1 }).limit(50);
  return memoryStore.bookings.filter((booking) => booking.tenantId === tenantId);
}

export async function listOrders(tenantId) {
  if (isMongoReady()) return Order.find({ tenantId }).sort({ createdAt: -1 }).limit(50);
  return memoryStore.orders.filter((order) => order.tenantId === tenantId);
}

export async function createCallLog(payload) {
  if (isMongoReady()) return asLean(await CallLog.create(payload));
  const call = { id: crypto.randomUUID(), ...payload, createdAt: new Date().toISOString() };
  memoryStore.calls.unshift(call);
  return call;
}

export async function getAnalytics(tenantId) {
  const [calls, bookings, orders] = await Promise.all([
    listCalls(tenantId),
    listBookings(tenantId),
    listOrders(tenantId),
  ]);
  const completed = calls.filter((call) => call.outcome === "completed").length;
  const totalDuration = calls.reduce((sum, call) => sum + Number(call.durationSeconds || 0), 0);
  const callsByDay = buildCallsByDay(calls);

  return {
    totalCalls: calls.length,
    completedCalls: completed,
    escalatedCalls: calls.length - completed,
    resolutionRate: calls.length ? Math.round((completed / calls.length) * 100) : 0,
    avgDuration: calls.length ? Math.round(totalDuration / calls.length) : 0,
    totalBookings: bookings.length,
    totalOrders: orders.length,
    callsByDay,
  };
}

function buildCallsByDay(calls) {
  const days = [];
  const counts = new Map();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    days.push(key);
    counts.set(key, 0);
  }

  for (const call of calls) {
    const key = String(call.createdAt || "").slice(0, 10);
    if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
  }

  return days.map((date) => ({ date, count: counts.get(date) || 0 }));
}

function buildGreeting(vertical, agentName, businessName) {
  if (vertical === "clinic") return `Namaste! Main ${agentName} hoon, ${businessName} se. Main aapki kaise madad kar sakti hoon?`;
  if (vertical === "hotel") return `Good day! Thank you for calling ${businessName}. I'm ${agentName}, how may I assist you?`;
  return `Hi! I'm ${agentName} from ${businessName}. How can I help you today?`;
}
