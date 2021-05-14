import manifest from './manifest.json';
import { baseUrl } from '../../../../config';
import { getSectionErrorContext } from '../../getSectionErrorContext';

export const getContext = ({ orderId, odsCode }) => ({
  ...manifest,
  title: `${manifest.title} ${orderId}`,
  backLinkHref: `${baseUrl}/organisation/${odsCode}/order/${orderId}`,
});

export const getErrorContext = (params) => ({
  ...getSectionErrorContext({ ...params, manifest }),
  title: `${manifest.title} ${params.orderId}`,
});
