import { putData } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { orderApiUrl } from '../../../config';
import { extractDate } from '../../controllers/extractDate';

const formatPutData = data => ({
  commencementDate: extractDate('commencementDate', data),
});

const getPutCommencementDateEndpoint = orderId => (
  `${orderApiUrl}/api/v1/orders/${orderId}/sections/commencement-date`
);

export const putCommencementDate = async ({
  orderId, data, accessToken,
}) => {
  const endpoint = getPutCommencementDateEndpoint(orderId);
  try {
    await putData({
      endpoint,
      body: formatPutData(data),
      accessToken,
      logger,
    });
    logger.info(`Commencement date updated - order id: ${orderId}, ${JSON.stringify(data)}`);
    return { success: true };
  } catch (err) {
    if (err.response.status === 400 && err.response.data && err.response.data.errors) {
      return err.response.data;
    }
    logger.error('Error updating commencement date');
    throw new Error();
  }
};
