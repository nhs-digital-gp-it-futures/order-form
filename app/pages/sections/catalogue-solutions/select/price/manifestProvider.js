import fs from 'fs';
import path from 'path';

export const getPriceManifest = (provisioningType) => {
  const rawManifest = fs.readFileSync(path.join(__dirname, `/${provisioningType.toLowerCase()}/manifest.json`));
  return JSON.parse(rawManifest);
};
