import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.resolve(__dirname, '..', '..', 'assets', 'fonts');
const FONT_PATH = path.join(FONTS_DIR, 'Roboto-Regular.ttf');
const FONT_BOLD_PATH = path.join(FONTS_DIR, 'Roboto-Bold.ttf');

const FONT_URLS_REGULAR = [
  'https://cdn.jsdelivr.net/gh/googlefonts/roboto@v2.138/src/hinted/Roboto-Regular.ttf',
  'https://raw.githubusercontent.com/googlefonts/roboto/v2.138/src/hinted/Roboto-Regular.ttf',
];
const FONT_URLS_BOLD = [
  'https://cdn.jsdelivr.net/gh/googlefonts/roboto@v2.138/src/hinted/Roboto-Bold.ttf',
  'https://raw.githubusercontent.com/googlefonts/roboto/v2.138/src/hinted/Roboto-Bold.ttf',
];

function downloadOne(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadOne(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      file.close();
      try { fs.unlinkSync(dest); } catch {}
      reject(err);
    });
  });
}

async function downloadWithFallback(urls, dest) {
  for (const url of urls) {
    try {
      await downloadOne(url, dest);
      return true;
    } catch (err) {
      console.warn(`[fontLoader] Failed ${url}:`, err.message);
    }
  }
  return false;
}

let cachedState = null;

export async function ensureCyrillicFonts() {
  if (cachedState !== null) return cachedState;
  if (!fs.existsSync(FONTS_DIR)) fs.mkdirSync(FONTS_DIR, { recursive: true });

  const hasRegular = fs.existsSync(FONT_PATH);
  const hasBold = fs.existsSync(FONT_BOLD_PATH);

  if (hasRegular && hasBold) {
    cachedState = { available: true, regular: FONT_PATH, bold: FONT_BOLD_PATH };
    return cachedState;
  }

  console.log('[fontLoader] Cyrillic font missing, attempting download...');
  const okR = hasRegular || await downloadWithFallback(FONT_URLS_REGULAR, FONT_PATH);
  const okB = hasBold || await downloadWithFallback(FONT_URLS_BOLD, FONT_BOLD_PATH);

  if (okR && okB) {
    console.log('[fontLoader] Roboto fonts ready, Cyrillic PDFs enabled');
    cachedState = { available: true, regular: FONT_PATH, bold: FONT_BOLD_PATH };
  } else {
    console.warn('[fontLoader] Could not obtain Roboto, falling back to English PDFs');
    cachedState = { available: false };
  }
  return cachedState;
}
