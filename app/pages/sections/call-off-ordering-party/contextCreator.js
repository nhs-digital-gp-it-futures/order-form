import manifest from './manifest.json';
import { baseUrl } from '../../../config';

export const getContext = ({ orderId, data }) => ({
  ...manifest,
  ...data,
  title: `${manifest.title} ${orderId}`,
  backlinkHref: `${baseUrl}/organisation/${orderId}`,
});
