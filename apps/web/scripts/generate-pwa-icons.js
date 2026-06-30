const sharp = require('sharp');
const path = require('path');

const svgPath = path.join(__dirname, '..', 'public', 'icons', 'icon.svg');
const maskableSvgPath = path.join(
  __dirname,
  '..',
  'public',
  'icons',
  'maskable-icon.svg',
);

const outputDir = path.join(__dirname, '..', 'public', 'icons');

async function generate() {
  await sharp(svgPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(outputDir, 'icon-192.png'));

  await sharp(svgPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'icon-512.png'));

  await sharp(maskableSvgPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(outputDir, 'maskable-icon-192.png'));

  await sharp(maskableSvgPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'maskable-icon-512.png'));

  await sharp(svgPath)
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));

  console.log('Iconos PWA generados correctamente.');
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
