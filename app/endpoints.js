import { oidcBaseUri, orderApiUrl } from './config';

const endpoints = {
  getIdentityApiHealth: () => `${oidcBaseUri}/health/ready`,
  getOrders: () => `${orderApiUrl}/api/v1/orders`,
};

export const getEndpoint = ({ endpointLocator, options }) => endpoints[endpointLocator](options);
