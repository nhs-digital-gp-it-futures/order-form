import {
  orderApiUrl, organisationApiUrl, identityServerUrl,
} from './config';

const endpoints = {
  identity: {
    getApiHealth: () => `${identityServerUrl}/health/ready`,
  },
  oapi: {
    getOrganisation: options => `${organisationApiUrl}/api/v1/Organisations/${options.orgId}`,
    getServiceRecipients: options => `${organisationApiUrl}/api/v1/Organisations/${options.orgId}/service-recipients`,
    getServiceRecipient: options => `${organisationApiUrl}/api/v1/ods/${options.selectedRecipientId}`,
  },
  ordapi: {
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
