import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

const generateSupplierOptions = ({ suppliers }) => {
  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.supplierId,
    text: supplier.name,
  }));

  return supplierOptions;
};

const generateQuestionsContext = ({ suppliers }) => {
  const questions = manifest.questions.map(question => ({
    ...question,
    options: generateSupplierOptions({ suppliers }),
  }));

  return questions;
};

export const getContext = ({ orderId, suppliers }) => {
  const context = ({
    ...manifest,
    questions: suppliers && generateQuestionsContext({ suppliers }),
    backLinkHref: `${baseUrl}/organisation/${orderId}/supplier/search`,
  });
  return context;
};
