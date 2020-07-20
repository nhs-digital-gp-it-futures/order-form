import { getContext } from './contextCreator';
import commonManifest from './commonManifest.json';
import { getSelectedPriceManifest } from '../../../../../helpers/controllers/manifestProvider';

export const getOrderItemContext = async ({
  orderId,
  orderItemId,
  orderItemType,
  itemName,
  odsCode,
  serviceRecipientName,
  selectedPrice,
  formData,
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
    orderItemId,
    itemName,
    serviceRecipientName,
    odsCode,
    selectedPrice,
    formData,
  });
};
