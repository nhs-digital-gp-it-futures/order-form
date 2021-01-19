import { putData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const formatPutData = ({
  formData,
}) => ({
  description: formData.description.trim(),
});

const getPutDescriptionEndpoint = (orderId) => (
  `${orderApiUrl}/api/v1/orders/${orderId}/sections/description`
);

export const putDescription = async ({
  accessToken,
  orderId,
  formData,
}) => {
  const endpoint = getPutDescriptionEndpoint(orderId);
  const body = formatPutData({
    formData,
  });

  await putData({
    endpoint, body, accessToken, logger,
  });
  logger.info(`Order description updated - id: ${orderId}`);
  return { success: true, orderId };
};
