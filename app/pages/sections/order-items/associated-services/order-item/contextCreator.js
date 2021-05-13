import { baseUrl } from '../../../../../config';
import { generateErrorMap } from '../../../../../helpers/contextCreators/generateErrorMap';
import { generateQuestions } from '../../../../../helpers/contextCreators/generateQuestions';
import { generateErrorSummary } from '../../../../../helpers/contextCreators/generateErrorSummary';
import { generateAddPriceTable } from '../../../../../helpers/contextCreators/generateAddPriceTable';

export const backLinkHref = ({
  req, associatedServicePrices, orderId, odsCode,
}) => {
  const { referer } = req.headers;
  const slug = (referer ? referer.split('/').pop() : '').toLowerCase();

  const singlePriceItemBackLink = ((associatedServicePrices || {}).prices || {}).length === 1
    ? `${baseUrl}/organisation/${odsCode}/order/${orderId}/associated-services/select/associated-service`
    : `${baseUrl}/organisation/${odsCode}/order/${orderId}/associated-services/select/associated-service/price`;

  if (slug === 'associated-service' || slug === 'price' || slug === 'associated-services') {
    return referer;
  }

  return slug === 'neworderitem' ? singlePriceItemBackLink : `${baseUrl}/organisation/${odsCode}/order/${orderId}/associated-services`;
};

export const getContext = ({
  commonManifest,
  selectedPriceManifest,
  orderId,
  catalogueItemId,
  itemName,
  selectedPrice,
  formData,
  errorMap,
  odsCode,
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
    altText: catalogueItemId === 'neworderitem' ? commonManifest.deleteButton.altText : '',
    disabled: catalogueItemId === 'neworderitem',
    href: `${baseUrl}/organisation/${odsCode}/order/${orderId}/associated-services/delete/${catalogueItemId}/confirmation/${itemName}`,
    text: commonManifest.deleteButton.text,
  },
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
    odsCode: params.formData,
  });

  const errorSummary = generateErrorSummary({ errorMap });

  return ({
    errors: errorSummary,
    ...contextWithErrors,
  });
};
