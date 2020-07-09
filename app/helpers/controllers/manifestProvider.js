import fs from 'fs';
import path from 'path';

export const getSelectedPriceManifest = ({ provisioningType, type }) => {
  const manifestPath = path.join(__dirname, `../../pages/sections/catalogue-solutions/order-item/${type.toLowerCase()}/${provisioningType.toLowerCase()}/manifest.json`);
  const rawManifest = fs.readFileSync(manifestPath);

  return JSON.parse(rawManifest);
};
