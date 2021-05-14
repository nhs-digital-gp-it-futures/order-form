import manifest from './manifest.json';
import { baseUrl } from '../../../../config';
import { getSectionErrorContext } from '../../getSectionErrorContext';

const populateQuestionsWithData = (primaryContact) => (
  manifest.questions.map((question) => {
    const modifiedQuestion = { ...question };
    if (primaryContact[question.id]) {
      modifiedQuestion.data = primaryContact[question.id];
    }
    return modifiedQuestion;
  })
);

export const getContext = ({
  orderId, supplierData, hasSavedData, odsCode,
}) => ({
  ...manifest,
  questions: supplierData && supplierData.primaryContact
    ? populateQuestionsWithData(supplierData.primaryContact)
    : manifest.questions,
  title: `${manifest.title} ${orderId}`,
  supplierData,
  searchAgainLinkHref: hasSavedData
    ? undefined
    : `${baseUrl}/organisation/${odsCode}/order/${orderId}/supplier/search`,
  backLinkHref: hasSavedData
    ? `${baseUrl}/organisation/${odsCode}/order/${orderId}`
    : `${baseUrl}/organisation/${odsCode}/order/${orderId}/supplier/search/select`,
  showSearchAgainLink: !hasSavedData,
});

export const getErrorContext = (params) => {
  const updatedManifest = getContext({
    orderId: params.orderId,
    supplierData: params.data,
    hasSavedData: params.hasSavedData,
    odsCode: params.odsCode,
  });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
