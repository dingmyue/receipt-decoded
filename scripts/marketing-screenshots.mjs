// Compose marketing artwork around unedited current native screenshots.
import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const project=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const root=resolve(project,'docs/app-store/marketing');
const copy=JSON.parse(await readFile(resolve(root,'copy.json'),'utf8'));
const {width:W,height:H}=copy.size,L=copy.layout;
if(W!==1320||H!==2868||copy.screenshots.length!==3)throw Error('Expected three accepted-size portrait screenshots.');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
await mkdir(resolve(root,'exports'),{recursive:true});await mkdir(resolve(root,'source/layouts'),{recursive:true});
const output=[],inputs=[];
for(const item of copy.screenshots){
 const input=await readFile(resolve(root,item.input));const meta=await sharp(input).metadata();
 if(meta.width!==1320||meta.height!==2868||item.headline.length!==2)throw Error('Input/layout does not match the reviewed screenshot geometry.');
 const sw=L.screenWidth,sh=sw*meta.height/meta.width,b=L.bezel,fw=sw+b*2,fh=sh+b*2,fx=(W-fw)/2,fy=L.phoneY;
 if(fy+fh>H-60)throw Error('Phone frame clips bottom margin.');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
 <defs><clipPath id="screen"><rect x="${fx+b}" y="${fy+b}" width="${sw}" height="${sh}" rx="88"/></clipPath><filter id="shadow" x="-40%" y="-25%" width="180%" height="160%"><feGaussianBlur stdDeviation="24"/></filter></defs>
 <rect width="${W}" height="${H}" fill="${item.background}"/>
 <g font-family="Helvetica Neue,Arial,sans-serif"><text x="${L.textX}" y="${L.brandY}" fill="${item.supportColor}" font-size="36" font-weight="500" letter-spacing="0.4">Receipt Decoded</text>
 <text x="${L.textX}" y="${L.headlineY}" fill="${item.headlineColor}" font-size="${L.headlineSize}" font-weight="700" letter-spacing="-3">${item.headline.map((line,i)=>`<tspan x="${L.textX}" dy="${i===0?0:L.headlineLeading}">${esc(line)}</tspan>`).join('')}</text>
 <text x="${L.textX}" y="${L.supportY}" fill="${item.supportColor}" font-size="${L.supportSize}" font-weight="400">${esc(item.support)}</text></g>
 <rect x="${fx+6}" y="${fy+28}" width="${fw-12}" height="${fh-4}" rx="112" fill="#111915" opacity="0.15" filter="url(#shadow)"/>
 <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="110" fill="#18201C"/>
 <rect x="${fx+9}" y="${fy+9}" width="${fw-18}" height="${fh-18}" rx="101" fill="none" stroke="#56605A" stroke-width="3"/>
 <image x="${fx+b}" y="${fy+b}" width="${sw}" height="${sh}" clip-path="url(#screen)" xlink:href="data:image/png;base64,${input.toString('base64')}"/>
 </svg>`;
 const file=resolve(root,`exports/${item.id}.png`);
 await writeFile(resolve(root,`source/layouts/${item.id}.svg`),svg);
 await sharp(Buffer.from(svg)).removeAlpha().png().toFile(file);
 const info=await sharp(file).metadata();if(info.width!==W||info.height!==H||info.hasAlpha)throw Error('Invalid marketing export.');
 output.push(file);inputs.push({file:item.input,sha256:createHash('sha256').update(input).digest('hex'),width:meta.width,height:meta.height});
}
const thumbs=await Promise.all(output.map(p=>sharp(p).resize(330,717).png().toBuffer()));
await sharp({create:{width:1014,height:717,channels:3,background:'#FFFFFF'}}).composite(thumbs.map((input,i)=>({input,left:i*342,top:0}))).png().toFile(resolve(root,'review-contact-sheet.png'));
await writeFile(resolve(root,'render-manifest.json'),JSON.stringify({format:'PNG',size:copy.size,opaque:true,screenSource:'Current standalone native Debug app, unedited UI, fictional sample data',inputs,outputs:copy.screenshots.map(s=>`exports/${s.id}.png`)},null,2)+'\n');
console.log('Rendered and verified three opaque 1320×2868 marketing PNGs and quarter-size review sheet.');
