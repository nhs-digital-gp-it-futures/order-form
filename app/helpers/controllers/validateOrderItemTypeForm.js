import { getSelectedPriceManifest } from './manifestProvider';

export const validateOrderItemTypeForm = ({ data, selectedPrice, orderItemType }) => {
  const errors = [];
  const selectedPriceManifest = getSelectedPriceManifest({
    orderItemType,
    provisioningType: selectedPrice.provisioningType,
    type: selectedPrice.type,
  });

  if (selectedPriceManifest.questions.quantity) {
    if (!data.quantity || data.quantity.trim().length === 0) {
      errors.push({
        field: 'Quantity',
        id: 'QuantityRequired',
      });
    } else if (Number.isNaN(Number(data.quantity))) {
      errors.push({
        field: 'Quantity',
        id: 'QuantityMustBeANumber',
      });
    } else if (data.quantity <= 0) {
      errors.push({
        field: 'Quantity',
        id: 'QuantityGreaterThanZero',
      });
    } else if (data.quantity.indexOf('.') !== -1) {
      errors.push({
        field: 'Quantity',
        id: 'QuantityInvalid',
      });
    } else if (data.quantity > 2147483646) {
      errors.push({
        field: 'Quantity',
        id: 'QuantityLessThanMax',
      });
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
