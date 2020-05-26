import manifest from './manifest.json';
import { baseUrl } from '../../../../config';
import { getSectionErrorContext } from '../../getSectionErrorContext';

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

export const getErrorContext = (params) => {
  const updatedManifest = getContext({ orderId: params.orderId, suppliers: params.suppliers });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
