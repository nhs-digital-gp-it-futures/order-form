import {
  oidcBaseUri, orderApiUrl, organisationApiUrl, solutionsApiUrl, documentApiHost,
} from './config';

const endpoints = {
  identity: {
    getApiHealth: () => `${oidcBaseUri}/health/ready`,
  },
  bapi: {
    getSearchSuppliers: options => `${solutionsApiUrl}/api/v1/suppliers?name=${encodeURIComponent(options.name)}&solutionPublicationStatus=Published`,
    getSupplier: options => `${solutionsApiUrl}/api/v1/suppliers/${options.supplierId}`,
    getSolutionsForSupplier: options => `${solutionsApiUrl}/api/v1/solutions?supplierId=${options.supplierId}`,
    getSolution: options => `${solutionsApiUrl}/api/v1/solutions/${options.solutionId}`,
    getSolutionPricing: options => `${solutionsApiUrl}/api/v1/solutions/${options.solutionId}/pricing`,
  },
  dapi: {
    getApiHealth: () => `${documentApiHost}/health/ready`,
    getDocument: options => `${documentApiHost}/api/v1/documents/${options.documentName}`,
  },
  oapi: {
    getOrganisation: options => `${organisationApiUrl}/api/v1/Organisations/${options.orgId}`,
    getServiceRecipients: options => `${organisationApiUrl}/api/v1/Organisations/${options.orgId}/service-recipients`,
  },
  ordapi: {
    getOrders: options => `${orderApiUrl}/api/v1/organisations/${options.orgId}/orders`,
    getOrderSummary: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/summary`,
    getDescription: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/description`,
    getCallOffOrderingParty: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/ordering-party`,
    getSupplier: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/supplier`,
    getCommencementDate: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/commencement-date`,
    getAddedCatalogueSolutions: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/catalogue-solutions`,
    getSelectedServiceRecipients: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/service-recipients`,
    putDescription: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/description`,
    putOrderingParty: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/ordering-party`,
    putCommencementDate: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/commencement-date`,
    putSupplier: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/supplier`,
    putCatalogueSolutions: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/catalogue-solutions`,
    putServiceRecipients: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/service-recipients`,
    postDescription: () => `${orderApiUrl}/api/v1/orders`,
  },
};

export const getEndpoint = ({ api, endpointLocator, options }) => (
  endpoints[api][endpointLocator](options)
);
