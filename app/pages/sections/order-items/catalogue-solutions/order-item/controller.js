import { getContext, getErrorContext } from './contextCreator';
import commonManifest from './commonManifest.json';
import { getSelectedPriceManifest, modifyManifestIfOnDemand } from '../../../../../helpers/controllers/manifestProvider';
import { removeCommas } from '../../../../../helpers/common/priceFormatter';
import { sessionKeys } from '../../../../../helpers/routes/sessionHelper';

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

export const getOrderItemContext = async ({
  orderId,
  orderItemId,
  orderItemType,
  solutionName,
  selectedPrice,
  formData,
  recipients,
  selectedRecipients,
  catalogueItemExists,
  odsCode,
}) => {
  const selectedPriceManifest = getSelectedPriceManifest({
    orderItemType,
    provisioningType: selectedPrice.provisioningType,
    type: selectedPrice.type,
  });

  modifyManifestIfOnDemand(selectedPrice, selectedPriceManifest, formData.selectEstimationPeriod);

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
    catalogueItemExists,
    odsCode,
  });
};

export const getOrderItemErrorContext = (params) => {
  const selectedPriceManifest = getSelectedPriceManifest({
    orderItemType: params.orderItemType,
    provisioningType: params.selectedPrice.provisioningType,
    type: params.selectedPrice.type,
  });

  modifyManifestIfOnDemand(params.selectedPrice, selectedPriceManifest,
    params.formData.selectEstimationPeriod);

  const updatedParams = {
    ...params,
    commonManifest,
    selectedPriceManifest,
    formData: params.formData,
  };

  return getErrorContext(updatedParams);
};

export const getPageData = (req, sessionManager) => {
  const pageData = sessionManager.getFromSession({ req, key: sessionKeys.orderItemPageData });

  const estimationPeriod = sessionManager.getFromSession({
    req, key: sessionKeys.selectEstimationPeriod,
  });

  if (estimationPeriod) {
    pageData.selectedPrice.timeUnit = { name: estimationPeriod, description: `per ${estimationPeriod}` };
  }

  return pageData;
};

export const setEstimationPeriod = (req, formData, sessionManager) => {
  const estimationPeriod = sessionManager.getFromSession({
    req, key: sessionKeys.selectEstimationPeriod,
  });

  if (estimationPeriod) {
    // eslint-disable-next-line no-param-reassign
    formData.selectEstimationPeriod = estimationPeriod;
  }
};
