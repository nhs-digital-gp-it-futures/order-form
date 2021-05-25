import { getQuantityError } from './getQuantityError';
import { getSelectedPriceManifest } from './manifestProvider';

export const validateOrderItemTypeForm = ({ data, selectedPrice, orderItemType }) => {
  const errors = [];
  const selectedPriceManifest = getSelectedPriceManifest({
    orderItemType,
    provisioningType: selectedPrice.provisioningType,
    type: selectedPrice.type,
  });

  if (selectedPriceManifest.questions.quantity) {
    const quantityError = getQuantityError(data.quantity);
    if (quantityError) {
      errors.push(quantityError);
    }
  }

  if (selectedPriceManifest.questions.selectEstimationPeriod) {
    if (!data.selectEstimationPeriod) {
      errors.push({
        field: 'SelectEstimationPeriod',
        id: 'EstimationPeriodRequired',
      });
    }
  }

  return errors;
};
