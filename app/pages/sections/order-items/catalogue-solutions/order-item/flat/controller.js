import { getContext } from './contextCreator';
import commonManifest from './commonManifest.json';
import { getSelectedPriceManifest } from '../../../../../../helpers/controllers/manifestProvider';

export const getOnDemandOrderContext = async ({
  orderId,
  orderItemType,
  selectedPrice,
  itemName,
  orderItemId,
}) => {
  const selectedPriceManifest = getSelectedPriceManifest({
    orderItemType,
    provisioningType: selectedPrice.provisioningType,
    type: selectedPrice.type,
  });

  return getContext({
    commonManifest,
    selectedPriceManifest,
    orderId,
    itemName,
    orderItemId,
  });
};
