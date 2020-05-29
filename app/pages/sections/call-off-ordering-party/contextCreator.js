import manifest from './manifest.json';
import { baseUrl } from '../../../config';
import { getSectionErrorContext } from '../getSectionErrorContext';

const populateQuestionsWithData = primaryContact => (
  manifest.questions.map((question) => {
    const modifiedQuestion = { ...question };
    if (primaryContact[question.id]) {
      modifiedQuestion.data = primaryContact[question.id];
    }
    return modifiedQuestion;
  })
);

export const getContext = ({ orderId, orgData }) => ({
  ...manifest,
  questions: orgData && orgData.primaryContact
    ? populateQuestionsWithData(orgData.primaryContact)
    : manifest.questions,
  title: `${manifest.title} ${orderId}`,
  orgData,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});


export const getErrorContext = (params) => {
  const updatedManifest = getContext({
    orderId: params.orderId,
    orgData: params.data,
  });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
