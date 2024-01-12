const { PDFDocument } = require('pdf-lib');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function run(urls) {
  const browser = await puppeteer.launch({
    headless: "new"
  });

  const pdfPaths = await Promise.all(urls.map(async (url, i) => {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    const pdfPath = `output/output${i}.pdf`;
    await page.pdf({ path: pdfPath, format: 'A4' });
    return pdfPath;
  }));

  const pdfDoc = await PDFDocument.create();
  for (const pdfPath of pdfPaths) {
    const pdfBytes = await fs.readFile(pdfPath);
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
    for (const page of pages) {
      pdfDoc.addPage(page);
    }
  }
  const mergedPdfBytes = await pdfDoc.save();
  await fs.writeFile('merged.pdf', mergedPdfBytes);
  await browser.close();
}


const urls = [];


run(urls);