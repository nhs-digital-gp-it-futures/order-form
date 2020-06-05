import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

const generateSolutionOptions = ({ solutions }) => (
  solutions.map(solution => ({
    value: solution.id,
    text: solution.name,
  }))
);

const generateQuestionsContext = ({ solutions }) => (
  manifest.questions.map(question => ({
    ...question,
    options: generateSolutionOptions({ solutions }),
  }))
);

export const getContext = ({ orderId, solutions }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  questions: solutions && generateQuestionsContext({ solutions }),
  backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions`,
});
