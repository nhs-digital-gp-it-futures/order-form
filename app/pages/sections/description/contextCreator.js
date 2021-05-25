import manifest from './manifest.json';
import { baseUrl } from '../../../config';
import { getSectionErrorContext } from '../getSectionErrorContext';

export const getContext = ({ odsCode, orderId, description }) => {
  const context = ({
    ...manifest,
    backLinkHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}`,
  });
  context.questions[0].data = description;
  return context;
};

export const getErrorContext = (params) => getSectionErrorContext({ ...params, manifest });
