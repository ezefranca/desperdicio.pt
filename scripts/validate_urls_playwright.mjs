#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const modulePath = process.env.PLAYWRIGHT_MODULE || 'playwright';
const { chromium } = await import(modulePath);

function usage() {
  console.error('Usage: validate_urls_playwright.mjs <inventory.json> <category> <output.json>');
  process.exit(1);
}

const [, , inventoryPath, category, outputPath] = process.argv;
if (!inventoryPath || !category || !outputPath) {
  usage();
}

const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
const urls = (inventory.categories?.[category] || []).map((entry) => entry.url).filter(Boolean);
if (!urls.length) {
  console.error(`No URLs found for category "${category}" in ${inventoryPath}`);
  process.exit(2);
}

const CONCURRENCY = Number(process.env.PLAYWRIGHT_CONCURRENCY || 4);
const TIMEOUT_MS = Number(process.env.PLAYWRIGHT_TIMEOUT_MS || 30000);
const POST_LOAD_WAIT_MS = Number(process.env.PLAYWRIGHT_POST_LOAD_WAIT_MS || 1200);
const userAgent = 'desperdicio.pt browser validator/1.0';

const browser = await chromium.launch({ headless: true });

function failureFromResult(result) {
  if (result.gotoError) return true;
  if (typeof result.status === 'number' && result.status >= 400) return true;
  if ((result.finalUrl || '').startsWith('chrome-error://')) return true;
  const haystack = `${result.title || ''}\n${result.bodySnippet || ''}`.toLowerCase();
  if (result.url.includes('arquivo.pt')) {
    const patterns = [
      'erro 404',
      'error 404',
      '404 not found',
      'não foi encontrada',
      'pagina não encontrada',
      'página não encontrada',
      'url not found',
      'não existe no arquivo',
      'document not found',
    ];
    if (patterns.some((pattern) => haystack.includes(pattern))) {
      return true;
    }
  }
  return false;
}

async function validateOne(url) {
  const context = await browser.newContext({ userAgent });
  const page = await context.newPage();
  const result = {
    url,
    ok: false,
    status: null,
    finalUrl: '',
    title: '',
    bodySnippet: '',
    gotoError: '',
  };

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
    result.status = response ? response.status() : null;
    await page.waitForTimeout(POST_LOAD_WAIT_MS);
    result.finalUrl = page.url();
    result.title = (await page.title()).trim();
    const bodyText = await page.locator('body').innerText().catch(() => '');
    result.bodySnippet = (bodyText || '').replace(/\s+/g, ' ').trim().slice(0, 320);
  } catch (error) {
    result.gotoError = error instanceof Error ? error.message : String(error);
  } finally {
    result.ok = !failureFromResult(result);
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }

  return result;
}

const results = [];
let nextIndex = 0;

async function worker() {
  while (true) {
    const index = nextIndex++;
    if (index >= urls.length) {
      return;
    }
    const url = urls[index];
    const result = await validateOne(url);
    results[index] = result;
    const state = result.ok ? 'ok' : 'fail';
    console.log(`${index + 1}/${urls.length}\t${state}\t${url}`);
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, () => worker()));
await browser.close();

const payload = {
  generatedAt: new Date().toISOString(),
  inventoryPath,
  category,
  count: results.length,
  okCount: results.filter((item) => item.ok).length,
  failCount: results.filter((item) => !item.ok).length,
  results,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Wrote ${outputPath}`);
