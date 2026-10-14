import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
await mkdir('assets', {recursive:true});
const mark = `<path d="M335 230L375 252L415 230L455 252L495 230L535 252L575 230L615 252L655 230L695 252V784L655 762L615 784L575 762L535 784L495 762L455 784L415 762L375 784L335 762Z" fill="#fffdf8"/><path d="M401 359H630M401 428H560M401 497H630M401 566H535" stroke="#27332D" stroke-width="28" stroke-linecap="round"/><circle cx="670" cy="670" r="106" fill="#D99C44"/><path d="M620 668L653 702L719 634" stroke="#27332D" fill="none" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="#27332D"/>${mark}</svg>`;
await sharp(Buffer.from(svg)).png().toFile('assets/icon.png');
await sharp(Buffer.from(svg.replace('fill="#27332D"/>','fill="#F7F5EF"/>'))).resize(512,512).png().toFile('assets/splash.png');
console.log('Generated opaque app icon and splash artwork.');
