import { getContext, getErrorContext } from './contextCreator';
import commonManifest from './commonManifest.json';
import { getSelectedPriceManifest } from '../../../../../../helpers/controllers/manifestProvider';

export const formatFormData = ({ formData }) => ({
  quantity: Array.isArray(formData.quantity)
    ? formData.quantity : formData.quantity.split(),
  selectEstimationPeriod: formData.selectEstimationPeriod
    ? formData.selectEstimationPeriod.trim() : undefined,
});

export const getProvisionTypeOrderContext = async ({
  orderId,
  orderItemType,
  selectedPrice,
  itemName,
  formData,
  odsCode,
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
    itemName,
    selectedPrice,
    formData,
    odsCode,
  });
};

export const getProvisionTypeOrderErrorContext = (params) => {
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
