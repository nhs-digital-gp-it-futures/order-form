import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';
import { getSectionErrorContext } from '../../../getSectionErrorContext';

const generateSolutionOptions = ({ solutions, selectedSolutionId }) => (
  solutions.map(solution => ({
    value: solution.id,
    text: solution.name,
    checked: solution.id === selectedSolutionId ? true : undefined,
  }))
);

const generateQuestionsContext = ({ solutions, selectedSolutionId }) => (
  manifest.questions.map(question => ({
    ...question,
    options: generateSolutionOptions({ solutions, selectedSolutionId }),
  }))
);

export const getContext = ({ orderId, solutions, selectedSolutionId }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  questions: solutions && generateQuestionsContext({ solutions, selectedSolutionId }),
  backLinkHref: `${baseUrl}/organisation/${orderId}/solution`,
});

export const getErrorContext = (params) => {
  const updatedManifest = getContext({ orderId: params.orderId, solutions: params.solutions });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
