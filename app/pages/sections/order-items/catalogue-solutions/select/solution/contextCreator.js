import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';
import { getSectionErrorContext } from '../../../../getSectionErrorContext';

const generateSolutionOptions = ({ solutions, selectedSolutionId }) => (
  solutions.map((solution) => ({
    value: solution.catalogueItemId,
    text: solution.name,
    checked: solution.catalogueItemId === selectedSolutionId ? true : undefined,
  }))
);

const generateQuestionsContext = ({ solutions, selectedSolutionId }) => (
  manifest.questions.map((question) => ({
    ...question,
    options: generateSolutionOptions({ solutions, selectedSolutionId }),
  }))
);

export const getContext = ({
  orderId, solutions, selectedSolutionId, odsCode,
}) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  questions: solutions && generateQuestionsContext({ solutions, selectedSolutionId }),
  backLinkHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions`,
});

export const getErrorContext = (params) => {
  const updatedManifest = getContext({
    orderId: params.orderId,
    solutions: params.solutions,
    odsCode: params.odsCode,
  });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
