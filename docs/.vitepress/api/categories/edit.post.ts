import iconMetaData from '../../data/iconMetaData';
import fs from 'fs';
import path from 'path';

// function findIcon(name: string) {
//   const icon = fs.readFileSync(`../icons/${}`, 'utf8');
// }

interface Body {
  icon: string
  category: string
}

export default eventHandler(async (event) => {
  const body: Body = await readBody(event);

  const iconJsonRaw = fs.readFileSync(`../icons/${body.icon}.json`, 'utf8');

  const iconJson = JSON.parse(iconJsonRaw);

  iconJson.categories = iconJson.categories.filter((category: string) => category !== body.category);

  fs.writeFileSync(`../icons/${body.icon}.json`, JSON.stringify(iconJson, null, 2));

  console.log('write!');


  return {
    status: 200,
    body: {
      success: true,
    },
  };
});
