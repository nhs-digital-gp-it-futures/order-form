import { getContext, getErrorContext } from './contextCreator';
import commonManifest from './commonManifest.json';
import { getSelectedPriceManifest } from '../../../../../helpers/controllers/manifestProvider';
import { removeCommas } from '../../../../../helpers/common/priceFormatter';

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
    price: formData.price && formData.price.length > 0
      ? removeCommas(formData.price.trim()) : undefined,
    quantity: Array.isArray(formData.quantity)
      ? formData.quantity : formData.quantity.split(),
    deliveryDate,
  };
};

const modifyManifest = (selectedPriceManifest, selectedEstimationPeriod) => {
  const copy = { ...selectedPriceManifest };
  copy.solutionTable.columnInfo[1].data = `${copy.solutionTable.columnInfo[1].data} ${selectedEstimationPeriod}`;
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
  if (selectedPrice.provisioningType === 'OnDemand') {
    modifyManifest(selectedPriceManifest, formData.selectEstimationPeriod);
  }
  return getContext({
    commonManifest,
    selectedPriceManifest,
    orderId,
    orderItemId,
    solutionName,
    formData,
    recipients,
    selectedPrice,
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
