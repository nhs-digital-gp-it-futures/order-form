/* eslint-disable no-restricted-globals */
import { getDateErrors } from './getDateErrors';
import { getQuantityError } from './getQuantityError';
import { getSelectedPriceManifest } from './manifestProvider';

export const validateOrderItemForm = ({ data, selectedPrice, orderItemType }) => {
  const errors = [];
  const selectedPriceManifest = getSelectedPriceManifest({
    orderItemType,
    provisioningType: selectedPrice.provisioningType,
    type: selectedPrice.type,
  });

  if (selectedPriceManifest.questions.deliveryDate) {
    const deliveryDateError = getDateErrors('deliveryDate', data);
    if (deliveryDateError) {
      errors.push(deliveryDateError);
    }
  }

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

  if (selectedPriceManifest.addPriceTable.cellInfo.price.question) {
    if (!data.price || data.price.trim().length === 0) {
      errors.push({
        field: 'Price',
        id: 'PriceRequired',
      });
    } else if (Number.isNaN(Number(data.price))) {
      errors.push({
        field: 'Price',
        id: 'PriceMustBeANumber',
      });
    } else if (data.price.includes('.') && data.price.split('.')[1].length > 4) {
      errors.push({
        field: 'Price',
        id: 'PriceMoreThan4dp',
      });
    } else if (parseFloat(data.price) > 999999999999999.999) {
      errors.push({
        field: 'Price',
        id: 'PriceLessThanMax',
      });
    } else if (parseFloat(data.price) > selectedPrice.listPrice) {
      errors.push({
        field: 'Price',
        id: 'PriceGreaterThanListPrice',
      });
    }
  }

  return errors;
};
