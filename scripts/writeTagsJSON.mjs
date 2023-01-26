import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { parseSync } from 'svgson';
// import renderIconsObject from './render/renderIconsObject.mjs';
import { writeFile, readSvg, readSvgDirectory, getCurrentDirPath } from './helpers.mjs';

const currentDir = getCurrentDirPath(import.meta.url);
const ICONS_DIR = path.resolve(currentDir, '../icons');

const svgFiles = readSvgDirectory(ICONS_DIR, '.json')
  .filter((fileName) => fs.existsSync(`${ICONS_DIR}/${path.basename(fileName, '.json')}.svg`))
  .map((fileName) => path.basename(fileName, '.json'));

const iconNodesEntries = svgFiles.map((svgFile) => {
  const name = path.basename(svgFile, '.svg');
  const svg = readSvg(`${svgFile}.svg`, ICONS_DIR);
  const contents = parseSync(svg);
  const children = contents.children.map(({ name, attributes }) => [name, attributes]);

  return [name, children];
});

const iconNodes = Object.fromEntries(iconNodesEntries);
const iconNodeStringified = JSON.stringify(iconNodes);
const iconNodeHash = {
  hash: crypto.createHash('md5').update(iconNodeStringified).digest('hex'),
};

writeFile(iconNodeStringified, 'icon-nodes.json', path.resolve(process.cwd(), 'public'));
writeFile(
  JSON.stringify(iconNodeHash),
  'icon-nodes-hash.json',
  path.resolve(process.cwd(), 'public'),
);
