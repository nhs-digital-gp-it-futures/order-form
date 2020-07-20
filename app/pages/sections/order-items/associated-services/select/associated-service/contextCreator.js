import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';

const generateAssociatedServiceOptions = ({ associatedServices, selectedAssociatedServiceId }) => (
  associatedServices.map(associatedService => ({
    value: associatedService.catalogueItemId,
    text: associatedService.name,
    checked: associatedService.catalogueItemId === selectedAssociatedServiceId
      ? true
      : undefined,
  }))
);

const generateQuestionsContext = ({ associatedServices, selectedAssociatedServiceId }) => (
  manifest.questions.map(question => ({
    ...question,
    options: generateAssociatedServiceOptions({ associatedServices, selectedAssociatedServiceId }),
  }))
);

export const getContext = ({ orderId, associatedServices, selectedAssociatedServiceId }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  questions: associatedServices && generateQuestionsContext({
    associatedServices,
    selectedAssociatedServiceId,
  }),
  backLinkHref: `${baseUrl}/organisation/${orderId}/associated-services`,
});
