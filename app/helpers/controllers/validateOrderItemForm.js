/* eslint-disable no-restricted-globals */
import { getDateErrors } from './getDateErrors';
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
    if (!data.quantity || data.quantity.trim().length === 0) {
      errors.push({
        field: 'Quantity',
        id: 'QuantityRequired',
      });
    } else if (isNaN(data.quantity)) {
      errors.push({
        field: 'Quantity',
        id: 'QuantityMustBeANumber',
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

  if (selectedPriceManifest.addPriceTable.cellInfo.price.question) {
    if (!data.price || data.price.trim().length === 0) {
      errors.push({
        field: 'Price',
        id: 'PriceRequired',
      });
    } else if (isNaN(data.price)) {
      errors.push({
        field: 'Price',
        id: 'PriceMustBeANumber',
      });
    } else if (data.price.includes('.') && data.price.split('.')[1].length > 3) {
      errors.push({
        field: 'Price',
        id: 'PriceMoreThan3dp',
      });
    } else if (parseFloat(data.price) > 999999999999999.999) {
      errors.push({
        field: 'Price',
        id: 'PriceLessThanMax',
      });
    }
  }

  return errors;
};