import manifest from './manifest.json';
import { baseUrl } from '../../../../config';

export const getContext = ({
  orderId, solutionName, serviceRecipientName, odsCode,
}) => ({
  ...manifest,
  title: `${solutionName} ${manifest.title} ${serviceRecipientName} (${odsCode})`,
  deleteButtonHref: '#',
  backLinkHref: `${baseUrl}/organisation/${orderId}/catalogue-solutions/select/solution/recipient`,
});
