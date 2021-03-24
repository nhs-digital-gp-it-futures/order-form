import { baseUrl } from '../../../../../config';
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
  selectedPrice,
  formData,
  errorMap,
}) => ({
  ...commonManifest,
  title: `${itemName} ${commonManifest.title} ${orderId}`,
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
    disabled: catalogueItemId === 'neworderitem',
  },
  backLinkHref: catalogueItemId === 'neworderitem' ? `${baseUrl}/organisation/${orderId}/associated-services/select/associated-service/price`
    : `${baseUrl}/organisation/${orderId}/associated-services`,
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
