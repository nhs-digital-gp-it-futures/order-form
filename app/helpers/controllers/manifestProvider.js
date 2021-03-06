import fs from 'fs';
import path from 'path';

const orderItemTypeToFolderNameMap = {
  solution: 'catalogue-solutions',
  additionalservice: 'additional-services',
  associatedservice: 'associated-services',
};

const getManifestPath = ({ orderItemType, provisioningType, type }) => {
  const orderItemsSectionPath = '../../pages/sections/order-items/';
  const pathToManifest = `${orderItemTypeToFolderNameMap[orderItemType.toLowerCase()]}/order-item/${type.toLowerCase()}/${provisioningType.toLowerCase()}/manifest.json`;
  return `${orderItemsSectionPath}${pathToManifest}`;
};

export const getSelectedPriceManifest = ({ orderItemType, provisioningType, type }) => {
  const pathToManifest = getManifestPath({ orderItemType, provisioningType, type });
  const manifestPath = path.join(__dirname, pathToManifest);
  const rawManifest = fs.readFileSync(manifestPath);

  return JSON.parse(rawManifest);
};

export const modifyManifestIfOnDemand = (selectedPrice, selectedPriceManifest,
  selectedEstimationPeriod) => {
  if (selectedPrice.provisioningType === 'OnDemand') {
    let period = selectedEstimationPeriod;
    if (!period) {
      period = selectedPrice.timeUnit ? selectedPrice.timeUnit.name : '';
    }

    const copy = { ...selectedPriceManifest };
    copy.solutionTable.columnInfo[1].data = `${copy.solutionTable.columnInfo[1].data} ${period}`;
  }
};
