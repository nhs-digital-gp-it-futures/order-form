import {
  oidcBaseUri, orderApiUrl, organisationApiUrl, solutionsApiUrl, documentApiHost,
} from './config';

const endpoints = {
  getIdentityApiHealth: () => `${oidcBaseUri}/health/ready`,
  getDocumentApiHealth: () => `${documentApiHost}/health/ready`,
  getDocument: options => `${documentApiHost}/api/v1/documents/${options.documentName}`,
  // GET endpoints
  getOrders: options => `${orderApiUrl}/api/v1/organisations/${options.orgId}/orders`,
  getOrderSummary: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/summary`,
  getDescription: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/description`,
  getCallOffOrderingParty: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/ordering-party`,
  getOrganisationById: options => `${organisationApiUrl}/api/v1/Organisations/${options.orgId}`,
  getSearchSuppliers: options => `${solutionsApiUrl}/api/v1/suppliers?name=${options.name}&solutionPublicationStatus=Published`,
  getSupplier: options => `${solutionsApiUrl}/api/v1/suppliers/${options.supplierId}`,
  getOrdapiSupplier: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/supplier`,
  getCommencementDate: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/commencement-date`,
  getAddedCatalogueSolutions: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/catalogue-solutions`,
  getServiceRecipientsFromOapi: options => `${organisationApiUrl}/api/v1/Organisations/${options.orgId}/service-recipients`,
  getSelectedServiceRecipientsFromOrdapi: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/service-recipients`,
  getSolutionsForSupplier: options => `${solutionsApiUrl}/api/v1/solutions?supplierId=${options.supplierId}`,
  getSolution: options => `${solutionsApiUrl}/api/v1/solutions/${options.solutionId}`,
  getSolutionPricing: options => `${solutionsApiUrl}/api/v1/solutions/${options.solutionId}/pricing`,
  // PUT endpoints
  putDescription: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/description`,
  putOrderingParty: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/ordering-party`,
  putCommencementDate: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/commencement-date`,
  putSupplier: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/supplier`,
  putCatalogueSolutions: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/catalogue-solutions`,
  putServiceRecipients: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/service-recipients`,
  // POST endpoints
  postDescription: () => `${orderApiUrl}/api/v1/orders`,
};

export const getEndpoint = ({ endpointLocator, options }) => (
  encodeURI(endpoints[endpointLocator](options))
);
