import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';

const source = fileURLToPath(new URL('../src/razorbox.d.ts', import.meta.url));
const destination = fileURLToPath(new URL('../dist/razorbox.d.ts', import.meta.url));
await mkdir(fileURLToPath(new URL('../dist/', import.meta.url)), { recursive: true });
await copyFile(source, destination);
console.log('Type declarations copied to dist/razorbox.d.ts');
