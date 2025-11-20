import puppeteer from 'puppeteer';

export async function htmlToPdfBuffer(html, format = 'SMALL') {
  const widthByFormat = {
    TINY: '40mm',
    SMALL: '60mm',
    STANDARD: '90mm'
  };

  const heightByFormat = {
    TINY: '20mm',
    SMALL: '35mm',
    STANDARD: '50mm'
  };

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const buffer = await page.pdf({
      printBackground: true,
      width: widthByFormat[format] || widthByFormat.SMALL,
      height: heightByFormat[format] || heightByFormat.SMALL,
      pageRanges: '1',
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    return buffer;
  } finally {
    await browser.close();
  }
}
