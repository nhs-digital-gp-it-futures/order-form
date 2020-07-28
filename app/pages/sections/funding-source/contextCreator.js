import manifest from './manifest.json';
import { baseUrl } from '../../../config';
import { getSectionErrorContext } from '../getSectionErrorContext';

const generateFundingSourceOptions = ({ question, fundingSource }) => {
  const fundingMap = question.options.map(option => ({
    ...option,
    checked: option.value === fundingSource ? true : undefined,
  }));
  return fundingMap;
};

const generateQuestionsContext = ({ fundingSource }) => (
  manifest.questions.map(question => ({
    ...question,
    options: generateFundingSourceOptions({ question, fundingSource }),
  }))
);

export const getContext = ({ orderId, fundingSource }) => {
  const context = ({
    ...manifest,
    title: `${manifest.title} ${orderId}`,
    backLinkHref: `${baseUrl}/organisation/${orderId}`,
    questions: generateQuestionsContext({ fundingSource }),
  });
  return context;
};

export const getErrorContext = (params) => {
  const updatedManifest = getContext({
    orderId: params.orderId,
  });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
