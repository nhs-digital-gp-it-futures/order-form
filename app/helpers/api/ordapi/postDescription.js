import { postData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';

const formatPostData = ({
  formData,
  orgId,
}) => ({
  description: formData.description.trim(),
  organisationId: orgId,
});

const getPostDescriptionEndpoint = () => (
  `${orderApiUrl}/api/v1/orders`
);

export const postDescription = async ({
  accessToken,
  orgId,
  formData,
}) => {
  const endpoint = getPostDescriptionEndpoint();
  const body = formatPostData({
    formData,
    orgId,
  });

  const response = await postData({
    endpoint, body, accessToken, logger,
  });
  const { orderId } = response.data;
  logger.info(`Order description added - id: ${orderId}`);
  return { success: true, orderId };
};
