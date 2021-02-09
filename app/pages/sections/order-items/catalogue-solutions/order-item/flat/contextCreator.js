import { baseUrl } from '../../../../../../config';
import { generateQuestions } from '../../../../../../helpers/contextCreators/generateQuestions';

export const getContext = ({
  commonManifest,
  selectedPriceManifest,
  orderId,
  itemName,
  orderItemId,
}) => ({
  ...commonManifest,
  title: `${commonManifest.title} ${itemName} for ${orderId}`,
  questions: selectedPriceManifest && generateQuestions({
    questions: selectedPriceManifest.questions,
  }),
  description: selectedPriceManifest.description,
  backLinkHref: orderItemId === 'neworderitem' ? `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/price/recipients/date`
    : `${baseUrl}/organisation/${orderId}/catalogue-solutions`,
});
