const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

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

async function main() {
  const urls = (process.env.CRAWL_URLS || '').split(',').map(u => u.trim()).filter(Boolean);
  const outputDir = 'output/nodejs';
  for (const url of urls) {
    const domain = getDomain(url);
    const folder = path.join(outputDir, domain);
    fs.mkdirSync(folder, { recursive: true });
    const { links, text } = await extractLinksAndText(url);
    saveLinksCsv(links, path.join(folder, 'links.csv'));
    saveTextJson(text, path.join(folder, 'text.json'));
    console.log(`Crawled ${url} -> ${folder}`);
  }
}

main();
