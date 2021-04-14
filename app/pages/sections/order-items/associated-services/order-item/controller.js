import { backLinkHref, getContext, getErrorContext } from './contextCreator';
import commonManifest from './commonManifest.json';
import { getSelectedPriceManifest } from '../../../../../helpers/controllers/manifestProvider';
import { removeCommas } from '../../../../../helpers/common/priceFormatter';

export const getBackLinkHref = (req, associatedServicePrices, orderId) => backLinkHref({
  req, associatedServicePrices, orderId,
});
export const formatFormData = ({ formData }) => ({
  quantity: formData.quantity
    ? formData.quantity.trim() : undefined,
  price: formData.price && formData.price.length > 0
    ? removeCommas(formData.price.trim()) : undefined,
  selectEstimationPeriod: formData.selectEstimationPeriod
    ? formData.selectEstimationPeriod.trim() : undefined,
});

export const getOrderItemContext = async ({
  orderId,
  catalogueItemId,
  orderItemType,
  itemName,
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
    catalogueItemId,
    itemName,
    selectedPrice,
    formData,
  });
};

export const getOrderItemErrorPageContext = (params) => {
  const formattedData = formatFormData({
    formData: params.formData,
  });

  const selectedPriceManifest = getSelectedPriceManifest({
    orderItemType: params.orderItemType,
    provisioningType: params.selectedPrice.provisioningType,
    type: params.selectedPrice.type,
  });

  const updatedParams = {
    ...params,
    commonManifest,
    selectedPriceManifest,
    formData: formattedData,
  };

  return getErrorContext(updatedParams);
};
