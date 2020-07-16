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
    getCatalogueItem: options => `${solutionsApiUrl}/api/v1/catalogue-items/${options.itemId}`,
    getSolutionPricing: options => `${solutionsApiUrl}/api/v1/solutions/${options.solutionId}/prices`,
    getSelectedPrice: options => `${solutionsApiUrl}/api/v1/prices/${options.selectedPriceId}`,
    getAdditionalServices: (options) => {
      const queryString = `solutionIds=${options.addedCatalogueSolutions.join('&solutionIds=')}`;
      return `${solutionsApiUrl}/api/v1/additional-services?${queryString}`;
    },
    getCatalogueItemPricing: options => `${solutionsApiUrl}/api/v1/prices?catalogueItemId=${options.catalogueItemId}`,
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
    getOrder: options => `${orderApiUrl}/api/v1/orders/${options.orderId}`,
    getOrders: options => `${orderApiUrl}/api/v1/organisations/${options.orgId}/orders`,
    getOrderItem: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/order-items/${options.orderItemId}`,
    postOrderItem: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/order-items`,
    putOrderItem: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/order-items/${options.orderItemId}`,
    getOrderSummary: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/summary`,
    getDescription: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/description`,
    getCallOffOrderingParty: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/ordering-party`,
    getSupplier: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/supplier`,
    getCatalogueOrderItem: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/catalogue-solutions/${options.orderItemId}`,
    postSolutionOrderItem: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/catalogue-solutions`,
    putCatalogueOrderItem: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/catalogue-solutions/${options.orderItemId}`,
    getCommencementDate: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/commencement-date`,
    getAddedAdditionalServices: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/order-items?catalogueItemType=AdditionalServices`,
    getSelectedServiceRecipients: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/service-recipients`,
    putDescription: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/description`,
    putOrderingParty: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/ordering-party`,
    putCommencementDate: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/commencement-date`,
    putSupplier: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/supplier`,
    putCatalogueSolutions: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/catalogue-solutions`,
    putAdditionalServices: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/additional-services`,
    putServiceRecipients: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/service-recipients`,
    postDescription: () => `${orderApiUrl}/api/v1/orders`,
  },
};

export const getEndpoint = ({ api, endpointLocator, options }) => (
  endpoints[api][endpointLocator](options)
);
