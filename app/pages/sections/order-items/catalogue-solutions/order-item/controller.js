import { getContext } from './contextCreator';
import commonManifest from './commonManifest.json';
import { getSelectedPriceManifest } from '../../../../../helpers/controllers/manifestProvider';

export const getOrderItemContext = async ({
  orderId,
  orderItemId,
  orderItemType,
  solutionName,
  selectedPrice,
  formData,
  recipients,
  selectedRecipients,
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
    solutionName,
    formData,
    recipients,
    selectedRecipients,
  });
};
