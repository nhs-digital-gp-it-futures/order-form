import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';
import { getSectionErrorContext } from '../../../../getSectionErrorContext';

const generateAdditionalServiceOptions = ({ additionalServices, selectedAdditionalServiceId }) => (
  additionalServices.map(additionalService => ({
    value: additionalService.additionalServiceId,
    text: additionalService.name,
    checked: additionalService.additionalServiceId === selectedAdditionalServiceId
      ? true
      : undefined,
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

export const getErrorContext = (params) => {
  const updatedManifest = getContext({
    orderId: params.orderId,
    additionalServices: params.additionalServices,
  });

  return {
    ...getSectionErrorContext({ ...params, manifest: updatedManifest }),
  };
};
