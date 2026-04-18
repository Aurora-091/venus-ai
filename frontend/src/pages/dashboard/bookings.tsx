import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface Props { tenant?: any; }

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-400",
  pending: "bg-amber-500/10 text-amber-400",
  cancelled: "bg-red-500/10 text-red-400",
  completed: "bg-blue-500/10 text-blue-400",
};

export default function Bookings({ tenant }: Props) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"bookings" | "orders">("bookings");

  useEffect(() => {
    if (!tenant?.id) return;
    setLoading(true);
    const ps: Promise<any>[] = [api.get(`/tenants/${tenant.id}/bookings`)];
    if (tenant.vertical === "ecommerce") {
      ps.push(api.get(`/tenants/${tenant.id}/orders`));
    }
    Promise.all(ps)
      .then(([b, o]) => {
        setBookings(b.bookings || []);
        setOrders(o?.orders || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenant?.id]);

  const isEcom = tenant?.vertical === "ecommerce";

  const formatSlot = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    } catch { return iso; }
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">{isEcom ? "Orders & Bookings" : "Bookings"}</h1>
        <p className="text-sm text-[#475569] mt-0.5">Appointments and reservations made via your voice agent</p>
      </div>

      {/* Tabs — only for ecom */}
      {isEcom && (
        <div className="flex gap-2 mb-5">
          {(["bookings", "orders"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors ${
                tab === t ? "bg-[#1E2A3E] text-white" : "text-[#475569] hover:text-[#94A3B8]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Bookings table */}
      {(!isEcom || tab === "bookings") && (
        <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_140px_100px] gap-0 border-b border-[#1E2A3E] px-5 py-3">
            {["Customer", "Service / Room", "Slot", "Status"].map(h => (
              <div key={h} className="text-xs font-medium text-[#475569]">{h}</div>
            ))}
          </div>
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-[#475569]">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="text-3xl mb-3">◻</div>
              <div className="text-sm text-[#475569]">No bookings yet.</div>
              <div className="text-xs text-[#475569] mt-1">Bookings made via voice agent appear here automatically.</div>
            </div>
          ) : (
            <div className="divide-y divide-[#1E2A3E]">
              {bookings.map((b, i) => (
                <div key={b.id || i} className="grid grid-cols-[1fr_1fr_140px_100px] gap-0 px-5 py-3.5">
                  <div className="text-sm">{b.callerName || "—"}</div>
                  <div className="text-sm text-[#94A3B8]">{b.service || "—"}</div>
                  <div className="text-xs font-mono text-[#94A3B8]">{b.slotStart ? formatSlot(b.slotStart) : "—"}</div>
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[b.status] || "bg-[#1E2A3E] text-[#475569]"}`}>
                      {b.status || "unknown"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders table — ecom only */}
      {isEcom && tab === "orders" && (
        <div className="bg-[#0F1623] border border-[#1E2A3E] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_1fr_100px_100px] gap-0 border-b border-[#1E2A3E] px-5 py-3">
            {["Order #", "Customer", "Items", "Total", "Status"].map(h => (
              <div key={h} className="text-xs font-medium text-[#475569]">{h}</div>
            ))}
          </div>
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-[#475569]">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-[#475569]">No orders.</div>
          ) : (
            <div className="divide-y divide-[#1E2A3E]">
              {orders.map((o, i) => (
                <div key={o.id || i} className="grid grid-cols-[80px_1fr_1fr_100px_100px] gap-0 px-5 py-3.5">
                  <div className="text-sm font-mono text-blue-400">#{o.orderNumber}</div>
                  <div>
                    <div className="text-sm">{o.customerName || "—"}</div>
                    <div className="text-xs font-mono text-[#475569]">{o.customerPhone || ""}</div>
                  </div>
                  <div className="text-sm text-[#94A3B8] truncate pr-2">{o.itemsSummary || "—"}</div>
                  <div className="text-sm font-mono">₹{o.total?.toLocaleString("en-IN") || "—"}</div>
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      o.status === "Delivered" ? "bg-emerald-500/10 text-emerald-400" :
                      o.status === "In Transit" || o.status === "Shipped" ? "bg-blue-500/10 text-blue-400" :
                      o.status === "Processing" ? "bg-amber-500/10 text-amber-400" :
                      o.status === "Cancelled" ? "bg-red-500/10 text-red-400" :
                      "bg-[#1E2A3E] text-[#475569]"
                    }`}>
                      {o.status || "unknown"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
