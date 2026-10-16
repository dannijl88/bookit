import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const SIZES = [192, 512]

async function render(svgPath, size, outputPath) {
  const buffer = await sharp(readFileSync(svgPath)).resize(size, size).png().toBuffer()
  writeFileSync(outputPath, buffer)
}

for (const size of SIZES) {
  await render(`icons/logo-source.svg`, size, `public/pwa-${size}x${size}.png`)
  await render(`icons/logo-maskable.svg`, size, `public/pwa-maskable-${size}x${size}.png`)
}

await render(`icons/logo-source.svg`, 180, `public/apple-touch-icon.png`)
console.log('Iconos PWA generados en public/.')