import { putData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const formatPutData = data => Object.entries(data).filter(item => item[0] !== '_csrf')
  .map(([odsCode, name]) => ({ name, odsCode }));

const getPutServiceRecipientsEndpoint = orderId => (
  `${orderApiUrl}/api/v1/orders/${orderId}/sections/service-recipients`
);

export const putServiceRecipients = async ({ accessToken, data, orderId }) => {
  const endpoint = getPutServiceRecipientsEndpoint(orderId);
  const body = { serviceRecipients: formatPutData(data) };
  await putData({
    endpoint,
    body,
    accessToken,
    logger,
  });
  logger.info(`Service recipients updated - order id: ${orderId}, ${JSON.stringify(body)}`);
  return { success: true };
};
