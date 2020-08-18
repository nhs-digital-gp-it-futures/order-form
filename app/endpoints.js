import {
  orderApiUrl, organisationApiUrl, documentApiHost, identityServerUrl,
} from './config';

const endpoints = {
  identity: {
    getApiHealth: () => `${identityServerUrl}/health/ready`,
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
    putCommencementDate: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/commencement-date`,
    putSupplier: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/supplier`,
    putServiceRecipients: options => `${orderApiUrl}/api/v1/orders/${options.orderId}/sections/service-recipients`,
  },
};

export const getEndpoint = ({ api, endpointLocator, options }) => (
  endpoints[api][endpointLocator](options)
);
