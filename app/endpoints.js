import {
  oidcBaseUri, orderApiUrl, organisationApiUrl, solutionsApiUrl,
} from './config';

const endpoints = {
  getIdentityApiHealth: () => `${oidcBaseUri}/health/ready`,
  // GET endpoints
  getOrders: options => `${orderApiUrl}/api/v1/organisations/${options.orgId}/orders`,
  getOrderSummary: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/summary`,
  getDescription: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/description`,
  getCallOffOrderingParty: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/ordering-party`,
  getOrganisationById: options => `${organisationApiUrl}/api/v1/Organisations/${options.orgId}`,
  getSearchSuppliers: options => `${solutionsApiUrl}/api/v1/suppliers?name=${options.supplierNameToFind}`,
  // PUT endpoints
  putDescription: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/description`,
  putOrderingParty: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/ordering-party`,
  // POST endpoints
  postDescription: () => `${orderApiUrl}/api/v1/orders`,
};

export const getEndpoint = ({ endpointLocator, options }) => endpoints[endpointLocator](options);
