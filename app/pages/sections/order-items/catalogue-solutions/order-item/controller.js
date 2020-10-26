import { getContext, getErrorContext } from './contextCreator';
import commonManifest from './commonManifest.json';
import { getSelectedPriceManifest } from '../../../../../helpers/controllers/manifestProvider';

export const formatFormData = ({ formData }) => {
  const day = Array.isArray(formData['deliveryDate-day']) ? formData['deliveryDate-day'] : formData['deliveryDate-day'].split();
  const month = Array.isArray(formData['deliveryDate-month']) ? formData['deliveryDate-month'] : formData['deliveryDate-month'].split();
  const year = Array.isArray(formData['deliveryDate-year']) ? formData['deliveryDate-year'] : formData['deliveryDate-year'].split();
  const deliveryDate = [];
  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < day.length; index++) {
    deliveryDate.push({
      'deliveryDate-day': day[index] ? day[index].trim() : undefined,
      'deliveryDate-month': month[index] ? month[index].trim() : undefined,
      'deliveryDate-year': year[index] ? year[index].trim() : undefined,
    });
  }

  return {
    price: formData.price.trim(),
    practiceSize: Array.isArray(formData.practiceSize)
      ? formData.practiceSize : formData.practiceSize.split(),
    deliveryDate,
  };
};

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

export const getOrderItemErrorContext = (params) => {
  const selectedPriceManifest = getSelectedPriceManifest({
    orderItemType: params.orderItemType,
    provisioningType: params.selectedPrice.provisioningType,
    type: params.selectedPrice.type,
  });

  const updatedParams = {
    ...params,
    commonManifest,
    selectedPriceManifest,
    formData: params.formData,
  };

  return getErrorContext(updatedParams);
};
