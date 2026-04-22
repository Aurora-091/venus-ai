#!/usr/bin/env node
/**
 * Append one row to a Notion database for each push to `refs/heads/main`.
 * One row per push event (HEAD commit only).
 *
 * Required env: NOTION_TOKEN, NOTION_DATABASE_ID
 * Optional: NOTION_BRANCH_NAME (default main), NOTION_STATUS_NAME (default Merged)
 * Property names (if yours differ): NOTION_PROP_* — see Notion "Integrations setup" (Commits / GitHub automation)
 *
 * "Author" (person) is not set — GitHub users are not Notion people. Leave Author empty in Notion
 * or fill manually; do not mark Author as required on new rows.
 */

import fs from "node:fs";

const NOTION_VERSION = "2022-06-28";
const PROP_NAME = process.env.NOTION_PROP_NAME || "Name";
const PROP_LINK = process.env.NOTION_PROP_LINK || "PR";
const PROP_UPDATED = process.env.NOTION_PROP_UPDATED || "Updated";
const PROP_BRANCH = process.env.NOTION_PROP_BRANCH || "Branch";
const PROP_STATUS = process.env.NOTION_PROP_STATUS || "Status";

const BRANCH_VALUE = process.env.NOTION_BRANCH_NAME || "main";
const STATUS_VALUE = process.env.NOTION_STATUS_NAME || "Merged";

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

/** Accept 32-char hex or dashed UUID; strip accidental ?v= view query from pasted URLs. */
function normalizeDatabaseId(raw) {
  if (!raw) return "";
  const base = raw.split("?")[0].trim().replace(/-/g, "");
  if (base.length !== 32) return raw.split("?")[0].trim();
  return `${base.slice(0, 8)}-${base.slice(8, 12)}-${base.slice(12, 16)}-${base.slice(16, 20)}-${base.slice(20, 32)}`;
}

const token = process.env.NOTION_TOKEN;
const databaseId = normalizeDatabaseId(process.env.NOTION_DATABASE_ID || "");
const eventPath = process.env.GITHUB_EVENT_PATH;

if (!token || !databaseId) {
  console.log("Skipping: NOTION_TOKEN or NOTION_DATABASE_ID not set.");
  process.exit(0);
}

if (!eventPath || !fs.existsSync(eventPath)) {
  fail("GITHUB_EVENT_PATH missing or not readable.");
}

const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));

if (event.pull_request) {
  console.log("Skipping: pull_request events are not logged (use push to main only).");
  process.exit(0);
}

if (event.ref !== "refs/heads/main") {
  console.log(`Skipping: ref is ${event.ref}, only refs/heads/main is logged.`);
  process.exit(0);
}

const hc = event.head_commit;
if (!hc) {
  console.log("No head_commit in payload; nothing to log.");
  process.exit(0);
}

if (/^\s*\[(skip notion|notion skip)\]/i.test(hc.message)) {
  console.log("Skipping: commit message requests [skip notion].");
  process.exit(0);
}

const short = hc.id.slice(0, 7);
const firstLine = hc.message.split("\n")[0].slice(0, 1800);
const rowTitle = `[main] ${short}: ${firstLine}`.slice(0, 2000);
const updated = (hc.timestamp || new Date().toISOString()).slice(0, 10);

const properties = {
  [PROP_NAME]: {
    title: [{ type: "text", text: { content: rowTitle } }],
  },
  [PROP_LINK]: { url: hc.url },
  [PROP_UPDATED]: {
    date: { start: updated },
  },
  [PROP_BRANCH]: {
    select: { name: BRANCH_VALUE },
  },
  [PROP_STATUS]: {
    status: { name: STATUS_VALUE },
  },
};

const body = {
  parent: { database_id: databaseId },
  properties,
};

const res = await fetch("https://api.notion.com/v1/pages", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
  },
  body: JSON.stringify(body),
});

const text = await res.text();
if (!res.ok) {
  console.error("Notion API error:", res.status, text);
  process.exit(1);
}

console.log("Notion row created:", JSON.parse(text).url || "ok");
