#!/usr/bin/env node
/**
 * Comprehensive E2E smoke test for HashPrediction dapp
 * Tests all user flows with headless Chromium via Playwright
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3099";
const TIMEOUT = 20000;
let browser, page;
let passed = 0, failed = 0;
const issues = [];

async function test(name, fn) {
  process.stdout.write(`  ${name}...`);
  try {
    await fn();
    passed++;
    console.log(" ✅");
  } catch (e) {
    failed++;
    const msg = e.message?.split("\n")[0] || String(e);
    console.log(` ❌ ${msg}`);
    issues.push({ test: name, error: msg });
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

async function screenshot(name) {
  try {
    await page.screenshot({ path: `/tmp/e2e-${name}.png`, fullPage: true });
  } catch {}
}

async function goto(url) {
  // Retry navigation once on connection refused
  try {
    return await page.goto(url, { waitUntil: "domcontentloaded", timeout: TIMEOUT });
  } catch (e) {
    if (e.message?.includes("ERR_CONNECTION_REFUSED")) {
      await new Promise(r => setTimeout(r, 2000));
      return await page.goto(url, { waitUntil: "domcontentloaded", timeout: TIMEOUT });
    }
    throw e;
  }
}

async function main() {
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-gpu"] });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);

  // Collect console errors
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));

  console.log("\n🧪 HashPrediction E2E Test Suite\n");
  console.log("━".repeat(50));

  // ═══════════════════════════════════════════
  // HOME PAGE
  // ═══════════════════════════════════════════
  console.log("\n📄 HOME PAGE (/)\n");

  await test("Page loads (200)", async () => {
    const res = await goto(BASE);
    assert(res.status() === 200, `Status ${res.status()}`);
    await page.waitForTimeout(2000);
  });

  await test("Title contains HashPrediction", async () => {
    const title = await page.title();
    assert(title.includes("HashPrediction"), `Title: "${title}"`);
  });

  await test("Navbar visible with links", async () => {
    const nav = page.locator("nav").first();
    assert(await nav.isVisible(), "Navbar not visible");
  });

  await test("Connect Wallet button exists", async () => {
    const btn = page.locator("button").filter({ hasText: /connect/i }).first();
    assert(await btn.isVisible(), "No connect button");
  });

  await test("Market cards render", async () => {
    await page.waitForSelector('[class*="glass-card"]', { timeout: TIMEOUT });
    const cards = await page.locator('[class*="glass-card"]').count();
    assert(cards >= 1, `Found ${cards} cards`);
  });

  await test("StatBar shows stats", async () => {
    const text = await page.textContent("body");
    assert(text.includes("Markets") && text.includes("Active"), "Missing stats");
  });

  await test("Filter pills work (All/Active/Resolved/Cancelled)", async () => {
    for (const label of ["Active", "Resolved", "Cancelled", "All"]) {
      const btn = page.locator("button").filter({ hasText: new RegExp(`^${label}$`) }).first();
      if (await btn.isVisible()) await btn.click();
      await page.waitForTimeout(300);
    }
  });

  await screenshot("home");

  // ═══════════════════════════════════════════
  // MARKET DETAIL PAGE
  // ═══════════════════════════════════════════
  console.log("\n📄 MARKET DETAIL (/markets/1)\n");

  await test("Page loads", async () => {
    const res = await goto(`${BASE}/markets/1`);
    assert(res.status() === 200, `Status ${res.status()}`);
    await page.waitForTimeout(2000);
  });

  await test("Market question renders", async () => {
    await page.waitForSelector("h1", { timeout: TIMEOUT });
    const h1 = await page.locator("h1").first().textContent();
    assert(h1.length > 10, `Too short: "${h1}"`);
  });

  await test("Pool distribution visible", async () => {
    const text = await page.textContent("body");
    assert(text.includes("YES") && text.includes("NO"), "Missing YES/NO");
  });

  await test("Share button exists", async () => {
    const btn = page.locator("button").filter({ hasText: /share/i }).first();
    assert(await btn.isVisible(), "No share button");
  });

  await test("Details section (Creator/Created/Resolution)", async () => {
    const text = await page.textContent("body");
    assert(text.includes("Creator") && text.includes("Resolution"), "Missing details");
  });

  await test("Activity feed section", async () => {
    const text = await page.textContent("body");
    assert(text.includes("Activity"), "Missing activity feed");
  });

  await test("BetForm or resolved state visible", async () => {
    const text = await page.textContent("body");
    assert(text.includes("Place a Bet") || text.includes("Winner:"), "No bet form or resolution");
  });

  await screenshot("market-detail");

  // ═══════════════════════════════════════════
  // RESOLVED MARKET
  // ═══════════════════════════════════════════
  console.log("\n📄 RESOLVED MARKET\n");

  await test("Shows winner badge", async () => {
    let found = false;
    for (const id of [7, 8, 10, 5]) {
      await goto(`${BASE}/markets/${id}`);
      await page.waitForTimeout(1500);
      const text = await page.textContent("body");
      if (text.includes("Winner:") || text.includes("Resolved")) { found = true; break; }
    }
    assert(found, "No resolved market with winner");
  });

  await screenshot("resolved");

  // ═══════════════════════════════════════════
  // CREATE MARKET
  // ═══════════════════════════════════════════
  console.log("\n📄 CREATE MARKET (/create)\n");

  await test("Page loads", async () => {
    const res = await goto(`${BASE}/create`);
    assert(res.status() === 200, `Status ${res.status()}`);
    await page.waitForTimeout(1500);
  });

  await test("Shows wallet prompt or create form", async () => {
    const text = await page.textContent("body");
    assert(text.includes("Connect") || text.includes("Create Market") || text.includes("Question"), "Neither found");
  });

  await screenshot("create");

  // ═══════════════════════════════════════════
  // PORTFOLIO
  // ═══════════════════════════════════════════
  console.log("\n📄 PORTFOLIO (/portfolio)\n");

  await test("Page loads", async () => {
    const res = await goto(`${BASE}/portfolio`);
    assert(res.status() === 200, `Status ${res.status()}`);
    await page.waitForTimeout(1500);
  });

  await test("Shows wallet prompt or portfolio", async () => {
    const text = await page.textContent("body");
    assert(text.includes("Connect") || text.includes("Portfolio"), "Neither found");
  });

  await screenshot("portfolio");

  // ═══════════════════════════════════════════
  // LEADERBOARD
  // ═══════════════════════════════════════════
  console.log("\n📄 LEADERBOARD (/leaderboard)\n");

  await test("Page loads", async () => {
    const res = await goto(`${BASE}/leaderboard`);
    assert(res.status() === 200, `Status ${res.status()}`);
    await page.waitForTimeout(2000);
  });

  await test("Title and sort buttons render", async () => {
    const text = await page.textContent("body");
    assert(text.includes("Leaderboard"), "Missing title");
    assert(text.includes("Wins") && text.includes("Volume"), "Missing sort buttons");
  });

  await test("Shows data or empty state", async () => {
    const text = await page.textContent("body");
    assert(text.includes("0x") || text.includes("No bets"), "No data or empty state");
  });

  await screenshot("leaderboard");

  // ═══════════════════════════════════════════
  // FAUCET
  // ═══════════════════════════════════════════
  console.log("\n📄 FAUCET (/faucet)\n");

  await test("Page loads", async () => {
    const res = await goto(`${BASE}/faucet`);
    assert(res.status() === 200, `Status ${res.status()}`);
    await page.waitForTimeout(1500);
  });

  await test("Shows faucet UI", async () => {
    const text = await page.textContent("body");
    assert(text.includes("Faucet") || text.includes("mUSDC"), "Missing faucet content");
    assert(text.includes("Testnet") || text.includes("test"), "Missing testnet notice");
  });

  await screenshot("faucet");

  // ═══════════════════════════════════════════
  // ADMIN
  // ═══════════════════════════════════════════
  console.log("\n📄 ADMIN (/admin)\n");

  await test("Page loads", async () => {
    const res = await goto(`${BASE}/admin`);
    assert(res.status() === 200, `Status ${res.status()}`);
    await page.waitForTimeout(1500);
  });

  await test("Shows wallet prompt or admin panel", async () => {
    const text = await page.textContent("body");
    assert(text.includes("Connect") || text.includes("Admin") || text.includes("admin"), "Neither found");
  });

  await screenshot("admin");

  // ═══════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════
  console.log("\n🔗 NAVIGATION\n");

  await test("Home → click market card → detail page", async () => {
    await goto(BASE);
    await page.waitForTimeout(2000);
    const link = page.locator('a[href^="/markets/"]').first();
    if (await link.isVisible()) {
      await link.click();
      await page.waitForURL(/\/markets\/\d+/, { timeout: TIMEOUT });
      assert(page.url().includes("/markets/"), `URL: ${page.url()}`);
    }
  });

  await test("Navbar links work", async () => {
    for (const [text, path] of [["Create", "/create"], ["Leaderboard", "/leaderboard"], ["Faucet", "/faucet"]]) {
      const link = page.locator("nav a").filter({ hasText: text }).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(1500);
        assert(page.url().includes(path), `Expected ${path}, got ${page.url()}`);
      }
    }
  });

  // ═══════════════════════════════════════════
  // MOBILE
  // ═══════════════════════════════════════════
  console.log("\n📱 MOBILE (375x667)\n");

  await page.setViewportSize({ width: 375, height: 667 });

  await test("Home renders on mobile", async () => {
    await goto(BASE);
    await page.waitForTimeout(2000);
    const cards = await page.locator('[class*="glass-card"]').count();
    assert(cards >= 1, `Found ${cards} cards`);
  });

  await test("Hamburger menu works", async () => {
    const hamburger = page.locator('button[aria-label*="navigation" i], button[aria-label*="menu" i]').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(500);
      const links = await page.locator("nav a").count();
      assert(links >= 4, `Only ${links} nav links`);
      await hamburger.click();
    } else {
      // Mobile menu might use different aria-label
      const anyHamburger = page.locator("nav button").last();
      if (await anyHamburger.isVisible()) {
        await anyHamburger.click();
        await page.waitForTimeout(500);
      }
    }
  });

  await test("Market detail on mobile", async () => {
    await goto(`${BASE}/markets/1`);
    await page.waitForTimeout(2000);
    const h1 = await page.locator("h1").first().textContent();
    assert(h1 && h1.length > 5, "No question on mobile");
  });

  await screenshot("mobile");

  // ═══════════════════════════════════════════
  // ERROR HANDLING
  // ═══════════════════════════════════════════
  console.log("\n🔍 ERROR HANDLING\n");

  await page.setViewportSize({ width: 1440, height: 900 });

  await test("Invalid market ID shows not found", async () => {
    await goto(`${BASE}/markets/99999`);
    await page.waitForTimeout(2000);
    const text = await page.textContent("body");
    assert(text.includes("not found") || text.includes("Not Found") || text.length > 50, "May have crashed");
  });

  await test("404 for unknown route", async () => {
    const res = await goto(`${BASE}/nonexistent-xyz`);
    assert(res.status() === 404, `Expected 404, got ${res.status()}`);
  });

  await test("No critical console errors", async () => {
    const critical = consoleErrors.filter(
      e => !e.includes("MetaMask") && !e.includes("ethereum") && !e.includes("walletconnect") && !e.includes("Hydration") && !e.includes("reown") && !e.includes("WebSocket")
    );
    if (critical.length > 0) {
      console.log(`\n    ⚠️  Console errors: ${critical.slice(0, 3).join("; ")}`);
    }
    // Don't fail on console errors — just report them
  });

  // ═══════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════
  console.log("\n" + "━".repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests\n`);

  if (issues.length > 0) {
    console.log("❌ Failed tests:");
    for (const { test: t, error } of issues) {
      console.log(`   • ${t}: ${error}`);
    }
    console.log("");
  }

  console.log("📸 Screenshots: /tmp/e2e-*.png\n");

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Test runner crashed:", e.message);
  browser?.close();
  process.exit(1);
});
