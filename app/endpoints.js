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
  getSearchSuppliers: options => `${solutionsApiUrl}/api/v1/suppliers?name=${options.name}&limitToPublishedSolutions=true`,
  getSupplier: options => `${solutionsApiUrl}/api/v1/suppliers/${options.supplierId}`,
  getOrdapiSupplier: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/supplier`,
  getCommencementDate: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/commencement-date`,
  getAddedCatalogueSolutions: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/catalogue-solutions`,
  getServiceRecipientsFromOapi: options => `${organisationApiUrl}/api/v1/Organisations/${options.orgId}/service-recipients`,
  // PUT endpoints
  putDescription: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/description`,
  putOrderingParty: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/ordering-party`,
  putCommencementDate: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/commencement-date`,
  putSupplier: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/supplier`,
  // POST endpoints
  postDescription: () => `${orderApiUrl}/api/v1/orders`,
};

export const getEndpoint = ({ endpointLocator, options }) => endpoints[endpointLocator](options);
