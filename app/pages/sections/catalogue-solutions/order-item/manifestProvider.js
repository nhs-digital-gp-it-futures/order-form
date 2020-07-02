import fs from 'fs';
import path from 'path';

export const getSelectedPriceManifest = ({ provisioningType, type }) => {
  const manifestPath = path.join(__dirname, `/${type.toLowerCase()}/${provisioningType.toLowerCase()}/manifest.json`);
  const rawManifest = fs.readFileSync(manifestPath);

  return JSON.parse(rawManifest);
};
