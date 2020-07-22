import manifest from './manifest.json';
import { baseUrl } from '../../../config';

const generateFundingSourceOptions = ({ fundingSource }) => {
  const fundingMap = manifest.questions[0].options.map(option => ({
    ...option,
    checked: option.value === fundingSource ? true : undefined,
  }));
  return fundingMap;
};

const generateQuestionsContext = ({ fundingSource }) => (
  manifest.questions.map(question => ({
    ...question,
    options: generateFundingSourceOptions({ fundingSource }),
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
