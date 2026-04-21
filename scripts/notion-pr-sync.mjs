#!/usr/bin/env node
/**
 * Append one row to a Notion database for each push to `refs/heads/main`.
 * One row per push event (HEAD commit only — avoids PR / per-commit clutter).
 *
 * Required env: NOTION_TOKEN, NOTION_DATABASE_ID
 * Reads GitHub webhook payload from GITHUB_EVENT_PATH (GitHub Actions).
 */

import fs from "node:fs";

const NOTION_VERSION = "2022-06-28";
const PROP_NAME = process.env.NOTION_PROP_NAME || "Name";
const PROP_LINK = process.env.NOTION_PROP_LINK || "PR";
const PROP_UPDATED = process.env.NOTION_PROP_UPDATED || "Updated";

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID?.trim();
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

const body = {
  parent: { database_id: databaseId },
  properties: {
    [PROP_NAME]: {
      title: [{ type: "text", text: { content: rowTitle } }],
    },
    [PROP_LINK]: { url: hc.url },
    [PROP_UPDATED]: {
      date: { start: updated },
    },
  },
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
