import manifest from './manifest.json';
import { baseUrl } from '../../../../config';
import { getSectionErrorContext } from '../../getSectionErrorContext';

export const getContext = ({ orderId }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  backLinkHref: `${baseUrl}/organisation/${orderId}`,
});

export const getErrorContext = (params) => ({
  ...getSectionErrorContext({ ...params, manifest }),
  title: `${manifest.title} ${params.orderId}`,
});
