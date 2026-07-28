import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.BASE_URL ?? 'https://och-vendor.vercel.app';
const screenshotDir = path.resolve('docs/screenshots');
const executablePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

await mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

const consoleErrors = [];
const failedRequests = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => consoleErrors.push(error.message));
page.on('requestfailed', (request) => {
  failedRequests.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText}`);
});

async function assertPage(route, title, screenshotName) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.getByText(title, { exact: true }).first().waitFor({ timeout: 30_000 });
  const mainText = (await page.locator('main').innerText()).trim();
  if (mainText.length < 40) throw new Error(`${route} rendered an unexpectedly empty main area`);
  if (/failed to load|internal server error|unauthorized/i.test(mainText)) {
    throw new Error(`${route} rendered an error state: ${mainText.slice(0, 180)}`);
  }
  await page.screenshot({
    path: path.join(screenshotDir, screenshotName),
    fullPage: true,
  });
  console.log(`PASS ${route} (${mainText.length} chars)`);
}

try {
  await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.locator('input[type="email"]').fill('accounts@acmecleaning.ca');
  await page.locator('input[type="password"]').fill('AcmeDemo2026!');
  await Promise.all([
    page.waitForURL('**/dashboard', { timeout: 45_000 }),
    page.getByRole('button', { name: /sign in/i }).click(),
  ]);

  await assertPage('/dashboard', 'Dashboard', 'dashboard.png');
  await assertPage('/work-orders', 'Work Orders', 'work-orders.png');
  await assertPage('/invoices', 'Invoices', 'invoices.png');
  await assertPage('/compliance', 'Compliance Documents', 'compliance.png');
  await assertPage('/access-requests', 'Access Requests', 'access-requests.png');
  await assertPage('/profile', 'Company Profile', 'profile.png');

  const relevantConsoleErrors = consoleErrors.filter(
    (entry) => !/favicon|third-party cookie|deprecated/i.test(entry),
  );
  const relevantFailedRequests = failedRequests.filter(
    (entry) => !/favicon|clerk.*telemetry|google-analytics|ERR_ABORTED/i.test(entry),
  );

  if (relevantConsoleErrors.length) {
    throw new Error(`Console errors:\n${relevantConsoleErrors.join('\n')}`);
  }
  if (relevantFailedRequests.length) {
    throw new Error(`Failed requests:\n${relevantFailedRequests.join('\n')}`);
  }

  console.log('LIVE_E2E_OK');
} catch (error) {
  await page.screenshot({
    path: path.join(screenshotDir, 'failure.png'),
    fullPage: true,
  });
  console.error('LIVE_E2E_FAIL', error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
