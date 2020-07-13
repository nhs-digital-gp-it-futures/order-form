import manifest from './manifest.json';
import { baseUrl } from '../../../../../config';

export const getContext = ({
  orderId, itemName,
}) => ({
  ...manifest,
  title: `${manifest.title} ${itemName}`,
  backLinkHref: `${baseUrl}/organisation/${orderId}/additional-services/select/additional-service/price`,
});
