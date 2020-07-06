import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';

const generateAdditionalServiceOptions = ({ additionalServices, selectedAdditionalServiceId }) => (
  additionalServices.map(additionalService => ({
    value: additionalService.id,
    text: additionalService.name,
    checked: additionalService.id === selectedAdditionalServiceId ? true : undefined,
  }))
);

const generateQuestionsContext = ({ additionalServices, selectedAdditionalServiceId }) => (
  manifest.questions.map(question => ({
    ...question,
    options: generateAdditionalServiceOptions({ additionalServices, selectedAdditionalServiceId }),
  }))
);

export const getContext = ({ orderId, additionalServices, selectedAdditionalServiceId }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  questions: additionalServices && generateQuestionsContext({
    additionalServices,
    selectedAdditionalServiceId,
  }),
  backLinkHref: `${baseUrl}/organisation/${orderId}/additional-services`,
});
