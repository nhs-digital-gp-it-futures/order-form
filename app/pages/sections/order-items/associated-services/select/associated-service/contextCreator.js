import manifest from './manifest.json';
import { baseUrl } from '../../../../../../config';

export const getContext = ({ orderId }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  backLinkHref: `${baseUrl}/organisation/${orderId}/associated-services`,
});
