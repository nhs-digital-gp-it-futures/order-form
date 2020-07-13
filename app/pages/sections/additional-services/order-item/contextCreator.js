import { baseUrl } from '../../../../config';
import { generateErrorMap } from '../../../../helpers/contextCreators/generateErrorMap';
import { generateQuestions } from '../../../../helpers/contextCreators/generateQuestions';
import { generateErrorSummary } from '../../../../helpers/contextCreators/generateErrorSummary';
import { generateAddPriceTable } from '../../../../helpers/contextCreators/generateAddPriceTable';

export const getContext = ({
  commonManifest,
  selectedPriceManifest,
  orderId,
  orderItemId,
  itemName,
  serviceRecipientName,
  odsCode,
  selectedPrice,
  formData,
  errorMap,
}) => ({
  ...commonManifest,
  title: `${itemName} ${commonManifest.title} ${serviceRecipientName} (${odsCode})`,
  questions: selectedPriceManifest && generateQuestions({
    questions: selectedPriceManifest.questions,
    formData,
    errorMap,
  }),
  addPriceTable: selectedPriceManifest && generateAddPriceTable({
    addPriceTable: selectedPriceManifest.addPriceTable,
    price: formData && formData.price,
    itemUnitDescription: selectedPrice
      && selectedPrice.itemUnit
      && selectedPrice.itemUnit.description,
    timeUnitDescription: selectedPrice
      && selectedPrice.timeUnit
      && selectedPrice.timeUnit.description,
    errorMap,
  }),
  deleteButton: {
    text: commonManifest.deleteButton.text,
    href: commonManifest.deleteButton.href,
    disabled: orderItemId === 'neworderitem',
  },
  backLinkHref: orderItemId === 'neworderitem' ? `${baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price/recipient`
    : `${baseUrl}/organisation/${orderId}/additional-services`,
});

export const getErrorContext = (params) => {
  const errorMap = generateErrorMap({
    validationErrors: params.validationErrors,
    errorMessagesFromManifest: params.selectedPriceManifest.errorMessages,
  });

  const contextWithErrors = getContext({
    commonManifest: params.commonManifest,
    selectedPriceManifest: params.selectedPriceManifest,
    orderId: params.orderId,
    orderItemId: params.orderItemId,
    itemName: params.itemName,
    serviceRecipientName: params.serviceRecipientName,
    odsCode: params.serviceRecipientId,
    selectedPrice: params.selectedPrice,
    formData: params.formData,
    errorMap,
  });

  const errorSummary = generateErrorSummary({ errorMap });

  return ({
    errors: errorSummary,
    ...contextWithErrors,
  });
};
