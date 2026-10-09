const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const url = process.env.GAME_URL || `http://127.0.0.1:${process.env.GAME_PORT || 8080}/`;

(async () => {
  const browser = await chromium.launch({headless: true, ...(process.env.BROWSER_CHANNEL ? {channel: process.env.BROWSER_CHANNEL} : {})});
  try {
    const context = await browser.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true});
    const page = await context.newPage(), errors = [], failed = [], assets = new Set();
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => failed.push(request.url()));
    page.on('response', response => {
      if (response.url().includes('/art/')) assets.add(response.url());
      if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) failed.push(response.url());
    });
    const response = await page.goto(url, {waitUntil: 'networkidle'});
    assert.equal(response.status(), 200);
    assert.ok(response.headers()['content-type'].includes('text/html'));
    assert.equal(response.headers()['cache-control'], 'no-cache');
    await page.waitForFunction(() => !!window.__sk);
    assert.ok(assets.size >= 25);
    await page.locator('#startBtn').tap();
    await page.evaluate(() => {const g = __sk.S.game; g.slot.x = 190; g.slotSpeed = 0; g.nextTier = 8; g.nextKind = 'normal';});
    await page.locator('#cv').tap();
    await page.waitForFunction(() => __sk.S.game.fruits[0]?.body.position.y > 550, null, {timeout: 10000});
    assert.equal(await page.evaluate(() => __sk.S.game.dropCount), 1);
    await page.locator('#menuBtn').tap();
    const before = await page.evaluate(() => __sk.S.game.fruits[0].body.position.y);
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => __sk.S.game.fruits[0].body.position.y), before);
    await page.locator('#resumeBtn').tap();
    assert.equal(await page.evaluate(() => __sk.S.paused), false);
    const fit = await page.evaluate(() => {
      const canvas = document.getElementById('cv').getBoundingClientRect();
      const meter = document.getElementById('fireBar').getBoundingClientRect();
      return canvas.left >= 0 && canvas.right <= innerWidth && meter.bottom < canvas.top;
    });
    assert.ok(fit);
    assert.deepEqual(errors, []);
    assert.deepEqual(failed, []);
    console.log('PASS container game loads artwork, accepts touch, drops pills, pauses and fits the phone viewport');
  } finally {await browser.close();}
})().catch(error => {console.error(error); process.exitCode = 1;});
