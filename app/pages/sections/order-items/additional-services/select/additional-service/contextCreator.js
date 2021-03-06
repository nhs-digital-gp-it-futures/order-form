import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';
import { getSectionErrorContext } from '../../../../getSectionErrorContext';

const generateAdditionalServiceOptions = ({ additionalServices, selectedAdditionalServiceId }) => (
  additionalServices.map((additionalService) => ({
    value: additionalService.catalogueItemId,
    text: additionalService.name,
    checked: additionalService.catalogueItemId === selectedAdditionalServiceId
      ? true
      : undefined,
  }))
);

const generateQuestionsContext = ({ additionalServices, selectedAdditionalServiceId }) => (
  manifest.questions.map((question) => ({
    ...question,
    options: generateAdditionalServiceOptions({ additionalServices, selectedAdditionalServiceId }),
  }))
);

export const getContext = ({
  orderId, additionalServices, selectedAdditionalServiceId, odsCode,
}) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  questions: additionalServices && generateQuestionsContext({
    additionalServices,
    selectedAdditionalServiceId,
  }),
  backLinkHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}/additional-services`,
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
