import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

const generateSupplierOptions = ({ suppliers }) => (
  suppliers.map(supplier => ({
    value: supplier.supplierId,
    text: supplier.name,
  }))
);

const generateQuestionsContext = ({ suppliers }) => (
  manifest.questions.map(question => ({
    ...question,
    options: generateSupplierOptions({ suppliers }),
  }))
);

export const getContext = ({ orderId, suppliers }) => ({
  ...manifest,
  questions: suppliers && generateQuestionsContext({ suppliers }),
  backLinkHref: `${baseUrl}/organisation/${orderId}/supplier/search`,
});
