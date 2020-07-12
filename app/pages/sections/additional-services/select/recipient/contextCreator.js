import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';

export const getContext = ({
  orderId, solutionName,
}) => ({
  ...manifest,
  title: `${manifest.title} ${solutionName}`,
  backLinkHref: `${baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price`,
});
