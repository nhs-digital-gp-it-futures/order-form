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

  if (selectedPriceManifest.questions.price) {
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

  if (selectedPriceManifest.solutionTable.cellInfo.practiceSize.question) {
    data.practiceSize.map((size) => {
      if (!size || size.trim().length === 0) {
        errors.push({
          field: 'PracticeSize',
          id: 'PracticeSizeRequired',
        });
      } else if (isNaN(size)) {
        errors.push({
          field: 'PracticeSize',
          id: 'PracticeSizeMustBeANumber',
        });
      } else if (size.indexOf('.') !== -1) {
        errors.push({
          field: 'PracticeSize',
          id: 'PracticeSizeInvalid',
        });
      } else if (size > 2147483646) {
        errors.push({
          field: 'PracticeSize',
          id: 'PracticeSizeLessThanMax',
        });
      }
    });
  }

  if (selectedPriceManifest.solutionTable.cellInfo.deliveryDate.question) {
    data.deliveryDate.map((date) => {
      const deliveryDateError = getDateErrors('deliveryDate', date);
      if (deliveryDateError) {
        errors.push(deliveryDateError);
      }
    });
  }

  return [...new Set(errors.map(errorObject => JSON.stringify(errorObject)))]
    .map(errorString => JSON.parse(errorString));
};
