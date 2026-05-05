import { getAnalytics, listBookings, listCalls, listOrders } from "../models/repositories.js";

export function createTenantStatsController() {
  return {
    async listCalls(req, res) {
      res.json({ calls: await listCalls(req.params.id) });
    },
    async listBookings(req, res) {
      res.json({ bookings: await listBookings(req.params.id) });
    },
    async listOrders(req, res) {
      res.json({ orders: await listOrders(req.params.id) });
    },
    async analytics(req, res) {
      res.json(await getAnalytics(req.params.id));
    },
  };
}
