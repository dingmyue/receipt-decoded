import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resultsReviewFixtures } from '../tests/results-review-fixtures.mjs';
const root = 'docs/app-store/marketing/source';
await mkdir(root, { recursive: true });
const esc = text => text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]));
const lines = resultsReviewFixtures.complete.lineItems;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1800">
<rect width="1200" height="1800" fill="#F1F0EB"/><rect x="100" y="65" width="1000" height="1670" rx="12" fill="#fff"/>
<g fill="#27332D" font-family="Menlo,monospace"><text x="600" y="200" text-anchor="middle" font-family="Arial,sans-serif" font-size="64" font-weight="700">SAMPLE MARKET</text>
<text x="600" y="270" text-anchor="middle" font-size="34">Shopping receipt</text><text x="160" y="370" font-size="32">Oct 12, 2026 · USD</text><path d="M160 420H1040 M160 1150H1040" stroke="#9CA59E" stroke-width="2" stroke-dasharray="8 8"/>
${lines.map((line, index) => `<text x="${line.lineType === 'discount' ? 190 : 160}" y="${490 + index * 64}" font-size="30">${esc(line.originalDescription)}</text><text x="1040" y="${490 + index * 64}" text-anchor="end" font-size="32">${(line.amountCents / 100).toFixed(2)}</text>`).join('')}
${[['SUBTOTAL','25.73'],['TAX','0.00'],['TOTAL USD','25.73']].map(([label, price], index) => `<text x="160" y="${1240 + index * 78}" font-size="38" font-weight="${index === 2 ? '700' : '400'}">${label}</text><text x="1040" y="${1240 + index * 78}" text-anchor="end" font-size="38" font-weight="${index === 2 ? '700' : '400'}">${price}</text>`).join('')}
<text x="600" y="1630" text-anchor="middle" font-size="28">Sample receipt · Not for purchase</text></g></svg>`;
await sharp(Buffer.from(svg)).removeAlpha().png().toFile(`${root}/sample-receipt-v1.1.png`);
console.log('Generated matching fictional three-product sample receipt.');
