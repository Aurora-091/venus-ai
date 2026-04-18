import crypto from "node:crypto";

export function configureSocket(io) {
  io.on("connection", (socket) => {
    socket.emit("server:ready", { connected: true, ts: Date.now() });

    socket.on("tenant:join", (tenantId) => {
      if (tenantId) socket.join(tenantId);
    });

    socket.on("tenant:leave", (tenantId) => {
      if (tenantId) socket.leave(tenantId);
    });

    socket.on("call:simulate", ({ tenantId, callerNumber } = {}) => {
      if (!tenantId) return;
      io.to(tenantId).emit("call:created", {
        id: crypto.randomUUID(),
        tenantId,
        callerNumber: callerNumber || "+910000000000",
        direction: "inbound",
        durationSeconds: 0,
        outcome: "live",
        summary: "Live websocket call event",
        createdAt: new Date().toISOString(),
      });
    });
  });
}
