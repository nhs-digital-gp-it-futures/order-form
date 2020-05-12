import { oidcBaseUri, orderApiUrl } from './config';

const endpoints = {
  getIdentityApiHealth: () => `${oidcBaseUri}/health/ready`,
  getOrders: options => `${orderApiUrl}/api/v1/organisation/${options.orgId}/orders`,
  postDescription: () => `${orderApiUrl}/api/v1/orders`,
};

export const getEndpoint = ({ endpointLocator, options }) => endpoints[endpointLocator](options);
