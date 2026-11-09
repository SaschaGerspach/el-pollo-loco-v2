import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { packAsync } from "free-tex-packer-core";
import sharp from "sharp";

const SOURCE_DIR = "assets-src/sprites";
const OUTPUT_DIR = "public/assets/atlases";
const MAX_TEXTURE_SIZE = 4096;

// Old display size × 2.25 (480 → 1080 px height) divided by the source size. Where the old
// game drew a sprite distorted, the larger of the width and height factor is used.
const SCALES = {
  pepe: 0.47,
  "chicken-normal": 0.91,
  "chicken-small": 0.77,
  endboss: 0.74,
  bottle: 0.57,
  coin: 0.75,
  hud: 0.72,
  ui: 1,
};

// The packer's own scale option resizes the finished texture as a whole, which leaves fractional
// frame coordinates and aliasing. Each sprite is therefore resized on its own before packing.
async function readImages(atlasDir, scale) {
  const entries = await readdir(atlasDir, {
    recursive: true,
    withFileTypes: true,
  });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".png"))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();
  return Promise.all(
    files.map(async (file) => {
      const { width, height } = await sharp(file).metadata();
      const contents = await sharp(file)
        .resize(Math.round(width * scale), Math.round(height * scale))
        .png()
        .toBuffer();
      return {
        path: path.relative(atlasDir, file).split(path.sep).join("/"),
        contents,
      };
    }),
  );
}

async function buildAtlas(name, scale) {
  const images = await readImages(path.join(SOURCE_DIR, name), scale);
  const files = await packAsync(images, {
    textureName: name,
    width: MAX_TEXTURE_SIZE,
    height: MAX_TEXTURE_SIZE,
    padding: 2,
    allowRotation: false,
    removeFileExtension: true,
    prependFolderName: true,
    packer: "OptimalPacker",
    exporter: "Phaser3",
  });

  // The exporter writes one JSON per texture; Phaser's multiatlas expects them in one file.
  const textures = [];
  for (const file of files) {
    if (file.name.endsWith(".json")) {
      textures.push(...JSON.parse(file.buffer.toString()).textures);
    } else {
      await writeFile(path.join(OUTPUT_DIR, file.name), file.buffer);
    }
  }
  await writeFile(
    path.join(OUTPUT_DIR, `${name}.json`),
    JSON.stringify({ textures }),
  );

  const sizes = textures
    .map((texture) => `${texture.size.w}×${texture.size.h}`)
    .join(", ");
  console.log(`${name}: ${images.length} frames → ${sizes}`);
}

await rm(OUTPUT_DIR, { recursive: true, force: true });
await mkdir(OUTPUT_DIR, { recursive: true });
for (const [name, scale] of Object.entries(SCALES)) {
  await buildAtlas(name, scale);
}
