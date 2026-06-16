import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const username = process.env.THM_USERNAME ?? "harryschlorke";
const outputPath = process.env.THM_OUTPUT ?? "./assets/thm_propic.png";
const userPublicId = process.env.THM_USER_PUBLIC_ID?.trim();

async function captureFromBadgeApi(page) {
  const badgeUrl = `https://tryhackme.com/api/v2/badges/public-profile?userPublicId=${userPublicId}`;
  await page.setViewportSize({ width: 350, height: 170 });
  await page.goto(badgeUrl, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(5000);

  const clip = await page.evaluate(() => {
    const elements = [...document.querySelectorAll("*")].filter(
      (el) =>
        el.offsetWidth > 0 &&
        el.offsetHeight > 0 &&
        (el.textContent?.trim().length > 0 || el.querySelector("img")),
    );
    elements.sort(
      (a, b) => (b.textContent?.length || 0) - (a.textContent?.length || 0),
    );
    const mainEl = elements.find(
      (el) => el.offsetWidth > 300 && el.offsetHeight > 50,
    );
    if (!mainEl) return null;
    const rect = mainEl.getBoundingClientRect();
    return {
      x: Math.max(0, rect.x - 5),
      y: Math.max(0, rect.y - 5),
      width: rect.width + 10,
      height: rect.height + 10,
    };
  });

  if (clip) {
    await page.screenshot({ path: outputPath, clip });
    return;
  }

  await page.screenshot({ path: outputPath });
}

async function captureFromProfile(page) {
  const profileUrl = `https://tryhackme.com/p/${username}`;
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(profileUrl, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("text=Rank", { timeout: 60000 });
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: outputPath,
    clip: { x: 60, y: 90, width: 1150, height: 320 },
  });
}

await mkdir(dirname(outputPath), { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  if (userPublicId) {
    await captureFromBadgeApi(page);
  } else {
    await captureFromProfile(page);
  }
  console.log(`Badge saved to ${outputPath}`);
} finally {
  await browser.close();
}
