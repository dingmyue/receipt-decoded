import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
await mkdir('tests/fixtures',{recursive:true});
const escape = (s) => s.replaceAll('&','&amp;').replaceAll('<','&lt;');
const cases = {
 'duplicate-fees': ['SYNTHETIC TEST RECEIPT','COSTCO WHOLESALE','USA · USD','10/12/2026','--------------------------------','1449879 CHIFORESTVTY      17.89','        CRV              1.20','1449879 CHIFORESTVTY      17.89','        CRV              1.20','100111  ORGANIC EGGS      6.99','--------------------------------','SUBTOTAL                45.17','TAX                      0.00','TOTAL USD               45.17','ITEMS SOLD                  3','NOT VALID FOR PURCHASE'],
 'quantity-two': ['SYNTHETIC TEST RECEIPT','DECODED MARKET','USA · USD','10/12/2026','--------------------------------','100111 ORGANIC EGGS','2 x 6.99                13.98','200222 WHOLE MILK        4.50','--------------------------------','TOTAL USD               18.48','NOT VALID FOR PURCHASE'],
 'reversal': ['SYNTHETIC TEST RECEIPT','DECODED MARKET','USA · USD','10/12/2026','--------------------------------','100111 ORGANIC EGGS      6.99','100111 ORGANIC EGGS      6.99','VOID 100111 EGGS        -6.99','--------------------------------','TOTAL USD                6.99','NOT VALID FOR PURCHASE'],
 'two-groups': ['SYNTHETIC TEST RECEIPT','DECODED MARKET','USA · USD','10/12/2026','--------------------------------','100111 ORGANIC EGGS      6.99','100111 ORGANIC EGGS      6.99','200222 WHOLE MILK        4.50','200222 WHOLE MILK        4.50','--------------------------------','TOTAL USD               22.98','NOT VALID FOR PURCHASE'],
 'not-receipt': ['THIS IS A SYNTHETIC TEST IMAGE','A picnic beneath a tree.','There is no shopping receipt here.']
};
cases['long-overlap']=['SYNTHETIC TEST RECEIPT','DECODED MARKET','USA · USD','10/12/2026','--------------------------------','1449879 CHIFORESTVTY 17.89','        CRV          1.20', ...Array.from({length:35},(_,i)=>`${990000+i} PANTRY ITEM ${String(i+1).padStart(2,'0')} 1.00`),'1449879 CHIFORESTVTY 17.89','        CRV          1.20','--------------------------------','SUBTOTAL            73.18','TAX                  0.00','TOTAL USD           73.18','NOT VALID FOR PURCHASE'];
for (const [name, lines] of Object.entries(cases)) {
 const long=name==='long-overlap', rowHeight=long?44:48, width=long?640:960, fontSize=long?24:34;
 const height=150+lines.length*rowHeight;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="white"/>${lines.map((line,i)=>`<text x="60" y="${90+i*rowHeight}" font-family="Menlo,monospace" font-size="${fontSize}" fill="black">${escape(line)}</text>`).join('')}</svg>`;
 await sharp(Buffer.from(svg)).png().toFile(`tests/fixtures/${name}.png`);
}
console.log(`Generated ${Object.keys(cases).length} clearly synthetic, non-personal test receipts.`);
