import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';
import { getSectionErrorContext } from '../../../../getSectionErrorContext';

const generateAssociatedServiceOptions = ({ associatedServices, selectedAssociatedServiceId }) => (
  associatedServices.map((associatedService) => ({
    value: associatedService.catalogueItemId,
    text: associatedService.name,
    checked: associatedService.catalogueItemId === selectedAssociatedServiceId
      ? true
      : undefined,
  }))
);

const generateQuestionsContext = ({ associatedServices, selectedAssociatedServiceId }) => (
  manifest.questions.map((question) => ({
    ...question,
    options: generateAssociatedServiceOptions({ associatedServices, selectedAssociatedServiceId }),
  }))
);

export const getContext = ({
  orderId, associatedServices, selectedAssociatedServiceId, odsCode,
}) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  questions: associatedServices && generateQuestionsContext({
    associatedServices,
    selectedAssociatedServiceId,
  }),
  backLinkHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}/associated-services`,
});

export const getErrorContext = (params) => {
  const updatedManifest = getContext({
    orderId: params.orderId,
    associatedServices: params.associatedServices,
  });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
