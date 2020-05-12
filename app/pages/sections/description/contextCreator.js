import manifest from './manifest.json';
import { baseUrl } from '../../../config';

export const getContext = ({ orderId }) => ({
  ...manifest,
  backlinkHref: `${baseUrl}/organisation/${orderId}`,
});
