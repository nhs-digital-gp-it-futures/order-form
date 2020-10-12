import fs from 'fs';
import path from 'path';

const orderItemTypeToFolderNameMap = {
  solution: 'catalogue-solutions/edit-solution',
  additionalservice: 'additional-services/order-item',
  associatedservice: 'associated-services/order-item',
};

const getManifestPath = ({ orderItemType, provisioningType, type }) => {
  const orderItemsSectionPath = '../../pages/sections/order-items/';
  const pathToManifest = `${orderItemTypeToFolderNameMap[orderItemType.toLowerCase()]}/${type.toLowerCase()}/${provisioningType.toLowerCase()}/manifest.json`;
  return `${orderItemsSectionPath}${pathToManifest}`;
};

export const getSelectedPriceManifest = ({ orderItemType, provisioningType, type }) => {
  const pathToManifest = getManifestPath({ orderItemType, provisioningType, type });
  const manifestPath = path.join(__dirname, pathToManifest);
  const rawManifest = fs.readFileSync(manifestPath);

  return JSON.parse(rawManifest);
};
