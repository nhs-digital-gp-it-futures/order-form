import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

const populateQuestionsWithData = ({ primaryContact }) => (
  manifest.questions.map((question) => {
    const modifiedQuestion = { ...question };
    if (primaryContact[question.id]) {
      modifiedQuestion.data = primaryContact[question.id];
    }
  })
);

export const getContext = ({ orderId, supplierData }) => ({
  ...manifest,
  questions: supplierData && supplierData.primaryContact
    ? populateQuestionsWithData({ supplierData })
    : manifest.questions,
  title: `${manifest.title} ${orderId}`,
  supplierData,
  backLinkHref: `${baseUrl}/organisation/${orderId}/supplier/search/select`,
});
