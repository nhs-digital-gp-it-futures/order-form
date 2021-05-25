import config from '../../../../../config';
import { generateErrorMap } from '../../../../../helpers/contextCreators/generateErrorMap';
import { generateQuestions } from '../../../../../helpers/contextCreators/generateQuestions';
import { generateErrorSummary } from '../../../../../helpers/contextCreators/generateErrorSummary';
import { generateAddPriceTable } from '../../../../../helpers/contextCreators/generateAddPriceTable';

export const getContext = ({
  commonManifest,
  selectedPriceManifest,
  orderId,
  catalogueItemId,
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
    ...commonManifest.deleteButton,
    disabled: catalogueItemId === 'neworderitem',
  },
  backLinkHref: catalogueItemId === 'neworderitem'
    ? `${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services/select/additional-service/price/recipients`
    : `${config.baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services`,
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
    catalogueItemId: params.catalogueItemId,
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
