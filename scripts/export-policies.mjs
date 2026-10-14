import {mkdir,writeFile} from 'node:fs/promises';
import {renderPage} from '../server/public-pages.mjs';
await mkdir('docs/app-store',{recursive:true});
for(const page of ['privacy','support','terms'])await writeFile(`docs/app-store/${page}.html`,renderPage(page));
console.log('Exported the three public policy/support pages. Complete the placeholders and regenerate before publishing.');
