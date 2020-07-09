import fs from 'fs';
import path from 'path';

export const getSelectedPriceManifest = ({ orderItemType, provisioningType, type }) => {
  const manifestPath = path.join(__dirname, `../../pages/sections/${orderItemType}/order-item/${type.toLowerCase()}/${provisioningType.toLowerCase()}/manifest.json`);
  const rawManifest = fs.readFileSync(manifestPath);

  return JSON.parse(rawManifest);
};
