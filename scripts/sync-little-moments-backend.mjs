// Vendor only the backend runtime; never copy .env, mobile config or credentials.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const targetRoot = resolve(process.argv[2] || join(sourceRoot, '../little-moments'));
const targetPackage = JSON.parse(await readFile(join(targetRoot, 'package.json'), 'utf8'));
if (targetPackage.name !== 'little-moments-kids-say') throw new Error('Choose the Little Moments repository root.');
const files = ['server/index.mjs', 'server/errors.mjs', 'server/receipt-analyzer.mjs', 'server/usage-guard.mjs', 'server/public-pages.mjs', 'shared/receipt-contract.mjs', 'shared/receipt-math.mjs', 'shared/app-info.json', 'shared/legal-copy.json'];
const destination = join(targetRoot, 'server/receipt-decoded');
const manifest = { source: 'Receipt Decoded backend', files: {} };
for (const file of files) {
  const bytes = await readFile(join(sourceRoot, file));
  await mkdir(dirname(join(destination, file)), { recursive: true });
  await copyFile(join(sourceRoot, file), join(destination, file));
  manifest.files[file] = createHash('sha256').update(bytes).digest('hex');
}
await writeFile(join(destination, 'source-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('Synced nine backend runtime/policy files into Little Moments. No environment files copied.');
