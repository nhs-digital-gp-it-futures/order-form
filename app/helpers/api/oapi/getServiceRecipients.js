import { getData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { organisationApiUrl } from '../../../config';

const getServiceRecipientsEndpoint = ({ orgId }) => (
  `${organisationApiUrl}/api/v1/Organisations/${orgId}/service-recipients`
);

export const getServiceRecipients = async ({ orgId, accessToken }) => {
  const serviceRecipientEndpoint = getServiceRecipientsEndpoint({ orgId });
  const serviceRecipientsData = await getData({
    endpoint: serviceRecipientEndpoint,
    accessToken,
    logger,
  });
  logger.info(`Service recipients for organisation with id: ${orgId} found in OAPI.`);
  return serviceRecipientsData;
};
