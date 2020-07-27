import {
  orderApiUrl, organisationApiUrl, solutionsApiUrl, documentApiHost, identityServerUrl,
} from './config';

const endpoints = {
  identity: {
    getApiHealth: () => `${identityServerUrl}/health/ready`,
  },
  bapi: {
    getSearchSuppliers: options => `${solutionsApiUrl}/api/v1/suppliers?name=${encodeURIComponent(options.name)}&solutionPublicationStatus=Published`,
    getSupplier: options => `${solutionsApiUrl}/api/v1/suppliers/${options.supplierId}`,
    getSolutionsForSupplier: options => `${solutionsApiUrl}/api/v1/solutions?supplierId=${options.supplierId}`,
    getSolution: options => `${solutionsApiUrl}/api/v1/solutions/${options.solutionId}`,
    getSolutionPricing: options => `${solutionsApiUrl}/api/v1/solutions/${options.solutionId}/prices`,
    getSelectedPrice: options => `${solutionsApiUrl}/api/v1/prices/${options.selectedPriceId}`,
    getAdditionalServices: (options) => {
      const queryString = `solutionIds=${options.addedCatalogueSolutions.join('&solutionIds=')}`;
      return `${solutionsApiUrl}/api/v1/additional-services?${queryString}`;
    },
  },
  dapi: {
    getApiHealth: () => `${documentApiHost}/health/ready`,
    getDocument: options => `${documentApiHost}/api/v1/documents/${options.documentName}`,
  },
  oapi: {
    getOrganisation: options => `${organisationApiUrl}/api/v1/Organisations/${options.orgId}`,
    getServiceRecipients: options => `${organisationApiUrl}/api/v1/Organisations/${options.orgId}/service-recipients`,
    getServiceRecipient: options => `${organisationApiUrl}/api/v1/ods/${options.selectedRecipientId}`,
  },
  ordapi: {
    getOrders: options => `${orderApiUrl}/api/v1/organisations/${options.orgId}/orders`,
    getOrderSummary: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/summary`,
    getCallOffOrderingParty: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/ordering-party`,
    getSupplier: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/supplier`,
    postSolutionOrderItem: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/catalogue-solutions`,
    putCatalogueOrderItem: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/catalogue-solutions/${options.orderItemId}`,
    getCommencementDate: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/commencement-date`,
    getSelectedServiceRecipients: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/service-recipients`,
    putDescription: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/description`,
    putOrderingParty: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/ordering-party`,
    putCommencementDate: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/commencement-date`,
    putSupplier: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/supplier`,
    putServiceRecipients: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/service-recipients`,
    postDescription: () => `${orderApiUrl}/api/v1/orders`,
  },
};

export const getEndpoint = ({ api, endpointLocator, options }) => (
  endpoints[api][endpointLocator](options)
);
