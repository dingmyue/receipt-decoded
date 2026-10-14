// Export the reviewed designs for App Store Connect's required medium iPhone slot.
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/app-store/marketing');
const copy = JSON.parse(await readFile(resolve(root, 'copy.json'), 'utf8'));
const outputDir = resolve(root, 'exports-medium');
await mkdir(outputDir, { recursive: true });
const outputs = [];
for (const item of copy.screenshots) {
  const input = await readFile(resolve(root, `exports/${item.id}.png`));
  const path = resolve(outputDir, `${item.id}.png`);
  await sharp(input).resize(1206, 2622, { fit: 'contain', background: item.background }).removeAlpha().png().toFile(path);
  const meta = await sharp(path).metadata();
  if (meta.width !== 1206 || meta.height !== 2622 || meta.hasAlpha) throw new Error('Invalid medium iPhone export');
  outputs.push({ file: `exports-medium/${item.id}.png`, sourceSha256: createHash('sha256').update(input).digest('hex') });
}
await writeFile(resolve(outputDir, 'manifest.json'), JSON.stringify({ size: { width: 1206, height: 2622 }, opaque: true, method: 'Proportional resize of reviewed marketing exports; no content changes', outputs }, null, 2) + '\n');
console.log('Verified three opaque 1206×2622 PNGs for medium iPhone displays.');
