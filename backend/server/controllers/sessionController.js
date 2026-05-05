export function createSessionController() {
  return {
    ping(_req, res) {
      res.json({ ok: true, stack: "mern", ts: Date.now() });
    },
    me(req, res) {
      res.json({ user: req.user });
    },
  };
}
