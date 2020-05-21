import {
  oidcBaseUri, orderApiUrl, organisationApiUrl, solutionsApiUrl,
} from './config';

const endpoints = {
  getIdentityApiHealth: () => `${oidcBaseUri}/health/ready`,
  getOrders: options => `${orderApiUrl}/api/v1/organisations/${options.orgId}/orders`,
  getOrderSummary: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/summary`,
  postDescription: () => `${orderApiUrl}/api/v1/orders`,
  putDescription: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/description`,
  getDescription: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/description`,
  getCallOffOrderingParty: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/ordering-party`,
  getOrganisationById: options => `${organisationApiUrl}/api/v1/Organisations/${options.orgId}`,
  getSearchSuppliers: options => `${solutionsApiUrl}/api/v1/suppliers?name=${options.supplierNameToFind}`,
};

export const getEndpoint = ({ endpointLocator, options }) => endpoints[endpointLocator](options);
