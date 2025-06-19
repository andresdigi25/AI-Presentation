import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import cliProgress from 'cli-progress';
import chalk from 'chalk';

function getDomain(url) {
  return new URL(url).hostname.replace(/\./g, '_');
}

async function extractLinksAndText(url) {
  try {
    const resp = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(resp.data);
    const links = [];
    $('a[href]').each((_, el) => {
      links.push($(el).attr('href'));
    });
    const body = $('body');
    const text = body.text().replace(/\s+/g, ' ').trim();
    return { links, text };
  } catch (e) {
    console.error(`Error fetching ${url}:`, e.message);
    return { links: [], text: '' };
  }
}

function saveLinksCsv(links, filePath) {
  fs.writeFileSync(filePath, links.map(l => `${l}\n`).join(''), 'utf8');
}

function saveTextJson(text, filePath) {
  fs.writeFileSync(filePath, JSON.stringify({ text }, null, 2), 'utf8');
}

function renderJsonText(text) {
  console.log(chalk.cyan.bold('Extracted Text (JSON):'));
  console.log(chalk.cyan(JSON.stringify({ text }, null, 2)));
}

function renderCsvLinks(links) {
  const n = links.length ? Math.max(1, Math.floor(links.length / 10)) : 0;
  console.log(chalk.yellow.bold('Extracted Links (CSV) [showing 10%]:'));
  for (const link of links.slice(0, n)) {
    console.log(chalk.yellow(link));
  }
  if (links.length > n) {
    console.log(chalk.yellow(`... (${links.length - n} more) ...`));
  }
}

async function main() {
  const urls = (process.env.CRAWL_URLS || '').split(',').map(u => u.trim()).filter(Boolean);
  const outputDir = 'output/nodejs';
  const bar = new cliProgress.SingleBar({ format: 'Crawling |{bar}| {percentage}% | {value}/{total} | {url}' }, cliProgress.Presets.shades_classic);
  bar.start(urls.length, 0, { url: '' });
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    bar.update(i + 1, { url });
    const domain = getDomain(url);
    const folder = path.join(outputDir, domain);
    fs.mkdirSync(folder, { recursive: true });
    const { links, text } = await extractLinksAndText(url);
    saveLinksCsv(links, path.join(folder, 'links.csv'));
    saveTextJson(text, path.join(folder, 'text.json'));
    console.log(chalk.green(`Crawled ${url} -> ${folder}`));
    renderJsonText(text);
    renderCsvLinks(links);
    await new Promise(r => setTimeout(r, 1000)); // sleep for progress bar effect
  }
  bar.stop();
}

main();
