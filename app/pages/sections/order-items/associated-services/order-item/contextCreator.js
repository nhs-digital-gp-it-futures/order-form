import { baseUrl } from '../../../../../config';
import { generateQuestions } from '../../../../../helpers/contextCreators/generateQuestions';
import { generateAddPriceTable } from '../../../../../helpers/contextCreators/generateAddPriceTable';

export const getContext = ({
  commonManifest,
  selectedPriceManifest,
  orderId,
  orderItemId,
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
    disabled: orderItemId === 'neworderitem',
  },
  backLinkHref: orderItemId === 'neworderitem' ? `${baseUrl}/organisation/${orderId}/associated-services/select/associated-service/price`
    : `${baseUrl}/organisation/${orderId}/associated-services`,
});
