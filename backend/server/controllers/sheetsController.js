export function createSheetsController() {
  return {
    status(_req, res) {
      res.json({ connected: false });
    },
    create(_req, res) {
      res.json({ success: false, error: "Google Sheets is not configured in the MERN backend yet" });
    },
    link(_req, res) {
      res.json({ success: true });
    },
    sync(_req, res) {
      res.json({ success: true, rowsSynced: 0 });
    },
    remove(_req, res) {
      res.json({ success: true });
    },
  };
}
