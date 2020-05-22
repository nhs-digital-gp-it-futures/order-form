import manifest from './manifest.json';
import { baseUrl } from '../../../config';
import { getSectionErrorContext } from '../getSectionErrorContext';

const addDataToQuestionsInManifest = contactData => (contactData ? ({
  ...manifest,
  questions: manifest.questions.map((question) => {
    const modifiedQuestion = { ...question };
    if (contactData[question.id]) {
      modifiedQuestion.data = contactData[question.id];
    }
    return modifiedQuestion;
  }),
}) : manifest);

export const getContext = ({ orderId, orgData, contactData }) => {
  const manifestWithQuestionsData = addDataToQuestionsInManifest(contactData);
  return {
    ...manifestWithQuestionsData,
    ...orgData,
    title: `${manifest.title} ${orderId}`,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
  };
};

export const getErrorContext = params => getSectionErrorContext({ ...params, manifest });
