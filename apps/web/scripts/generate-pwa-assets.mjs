import sharp from "sharp";
import { mkdirSync } from "fs";
import { join } from "path";

const iconsDir = join(process.cwd(), "public", "icons");
const screenshotsDir = join(process.cwd(), "public", "screenshots");

mkdirSync(iconsDir, { recursive: true });
mkdirSync(screenshotsDir, { recursive: true });

function burgerSvg(size = 512) {
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" rx="110" fill="#061A35"/>
    <rect x="58" y="58" width="396" height="396" rx="96" fill="#FFFFFF"/>
    <circle cx="256" cy="256" r="165" fill="#E6FCFF"/>

    <path d="M145 235C158 150 354 150 367 235H145Z" fill="#F2B96F"/>
    <circle cx="213" cy="190" r="7" fill="#FFE7C2"/>
    <circle cx="254" cy="175" r="7" fill="#FFE7C2"/>
    <circle cx="295" cy="192" r="7" fill="#FFE7C2"/>
    <circle cx="326" cy="216" r="6" fill="#FFE7C2"/>

    <path d="M132 250C166 222 346 222 380 250C363 267 149 267 132 250Z" fill="#43A047"/>
    <path d="M142 274C176 253 336 253 370 274C350 293 162 293 142 274Z" fill="#FFD23F"/>
    <path d="M132 296C132 276 380 276 380 296C380 316 132 316 132 296Z" fill="#7B443F"/>
    <path d="M158 320H354V343C354 368 334 388 309 388H203C178 388 158 368 158 343V320Z" fill="#D97859"/>
    <path d="M158 336H354V350H158V336Z" fill="#B8574D"/>
  </svg>`;
}

function wideScreenshotSvg() {
  return `
  <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
    <rect width="1280" height="720" fill="#061A35"/>
    <circle cx="1090" cy="100" r="260" fill="#0B5AAE" opacity="0.65"/>
    <circle cx="180" cy="620" r="300" fill="#22D3EE" opacity="0.18"/>

    <rect x="88" y="72" width="1104" height="120" rx="38" fill="rgba(255,255,255,0.12)"/>
    <rect x="120" y="100" width="72" height="72" rx="22" fill="#FFFFFF"/>
    <text x="220" y="130" font-size="42" font-family="Arial" font-weight="900" fill="#FFFFFF">Andrés Burger</text>
    <text x="220" y="164" font-size="22" font-family="Arial" font-weight="700" fill="#CFFAFE">Pide fácil. Come rico. Sin enredos.</text>

    <rect x="88" y="232" width="510" height="330" rx="44" fill="rgba(255,255,255,0.13)"/>
    <rect x="128" y="272" width="150" height="150" rx="36" fill="#E6FCFF"/>
    <text x="318" y="315" font-size="28" font-family="Arial" font-weight="900" fill="#A5F3FC" letter-spacing="8">SABOR DE LA CASA</text>
    <text x="318" y="375" font-size="58" font-family="Arial" font-weight="900" fill="#FFFFFF">Hoy se come bien</text>
    <text x="318" y="438" font-size="58" font-family="Arial" font-weight="900" fill="#FFFFFF">en Andrés Burger</text>

    <rect x="650" y="232" width="250" height="330" rx="44" fill="#FFFFFF"/>
    <rect x="680" y="262" width="190" height="150" rx="30" fill="#E6FCFF"/>
    <text x="690" y="465" font-size="30" font-family="Arial" font-weight="900" fill="#061A35">Hamburguesas</text>
    <text x="690" y="512" font-size="34" font-family="Arial" font-weight="900" fill="#1D4ED8">$ 18.000</text>

    <rect x="930" y="232" width="250" height="330" rx="44" fill="#FFFFFF"/>
    <rect x="960" y="262" width="190" height="150" rx="30" fill="#E6FCFF"/>
    <text x="970" y="465" font-size="30" font-family="Arial" font-weight="900" fill="#061A35">Perros calientes</text>
    <text x="970" y="512" font-size="34" font-family="Arial" font-weight="900" fill="#1D4ED8">$ 12.000</text>
  </svg>`;
}

function mobileScreenshotSvg() {
  return `
  <svg width="390" height="844" viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
    <rect width="390" height="844" fill="#061A35"/>
    <circle cx="340" cy="90" r="160" fill="#0B5AAE" opacity="0.7"/>
    <circle cx="60" cy="760" r="180" fill="#22D3EE" opacity="0.18"/>

    <rect x="22" y="32" width="346" height="84" rx="28" fill="rgba(255,255,255,0.12)"/>
    <rect x="42" y="48" width="52" height="52" rx="18" fill="#FFFFFF"/>
    <text x="108" y="70" font-size="26" font-family="Arial" font-weight="900" fill="#FFFFFF">Andrés Burger</text>
    <text x="108" y="94" font-size="13" font-family="Arial" font-weight="700" fill="#CFFAFE">Pide fácil. Come rico.</text>

    <rect x="22" y="146" width="346" height="190" rx="34" fill="rgba(255,255,255,0.13)"/>
    <text x="48" y="190" font-size="15" font-family="Arial" font-weight="900" fill="#A5F3FC" letter-spacing="4">SABOR DE LA CASA</text>
    <text x="48" y="238" font-size="36" font-family="Arial" font-weight="900" fill="#FFFFFF">Hoy se come</text>
    <text x="48" y="282" font-size="36" font-family="Arial" font-weight="900" fill="#FFFFFF">bien aquí</text>

    <rect x="22" y="366" width="346" height="126" rx="30" fill="rgba(255,255,255,0.13)"/>
    <text x="48" y="410" font-size="15" font-family="Arial" font-weight="900" fill="#A5F3FC" letter-spacing="4">CATEGORÍAS</text>
    <rect x="48" y="432" width="126" height="38" rx="16" fill="#CFFAFE"/>
    <rect x="186" y="432" width="126" height="38" rx="16" fill="#254D7D"/>

    <rect x="22" y="522" width="346" height="250" rx="34" fill="#FFFFFF"/>
    <rect x="48" y="548" width="294" height="100" rx="24" fill="#E6FCFF"/>
    <text x="48" y="696" font-size="28" font-family="Arial" font-weight="900" fill="#061A35">Hamburguesa</text>
    <text x="48" y="738" font-size="34" font-family="Arial" font-weight="900" fill="#1D4ED8">$ 18.000</text>
  </svg>`;
}

async function generateIcon(size) {
  await sharp(Buffer.from(burgerSvg(size)))
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, `icon-${size}.png`));
}

async function generateMaskableIcon(size) {
  await sharp(Buffer.from(burgerSvg(size)))
    .resize(size, size)
    .png()
    .toFile(join(iconsDir, `maskable-icon-${size}.png`));
}

async function generateScreenshot(name, svg, width, height) {
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toFile(join(screenshotsDir, name));
}

await Promise.all([
  generateIcon(72),
  generateIcon(96),
  generateIcon(128),
  generateIcon(144),
  generateIcon(152),
  generateIcon(192),
  generateIcon(384),
  generateIcon(512),
  generateMaskableIcon(192),
  generateMaskableIcon(512),
  generateScreenshot("wide-home.png", wideScreenshotSvg(), 1280, 720),
  generateScreenshot("mobile-home.png", mobileScreenshotSvg(), 390, 844),
]);

console.log("PWA assets generados correctamente.");
