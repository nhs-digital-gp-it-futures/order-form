import { getData, putData } from 'buying-catalogue-library';
import { getContext, getErrorContext } from './contextCreator';
import { getDateErrors } from './getDateErrors';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';

const formatPutData = data => ({
  commencementDate: `${data['commencementDate-year']}-${data['commencementDate-month']}-${data['commencementDate-day']}`,
});

export const getCommencementDateContext = async ({ orderId, accessToken }) => {
  const commencementDateDataEndpoint = getEndpoint({ endpointLocator: 'getCommencementDate', options: { orderId } });
  const commencementDateData = await getData({
    endpoint: commencementDateDataEndpoint, accessToken, logger,
  });

  logger.info(`Commencement date ${commencementDateData ? '' : 'not '}found for ${orderId}`);
  return getContext({
    orderId,
    data: commencementDateData ? commencementDateData.commencementDate : undefined,
  });
};

export const putCommencementDate = async ({
  orderId, data, accessToken,
}) => {
  const errors = [getDateErrors(data)];
  if (errors[0]) return { success: false, errors };

  const endpoint = getEndpoint({ endpointLocator: 'putCommencementDate', options: { orderId } });
  try {
    const body = formatPutData(data);
    await putData({
      endpoint,
      body,
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

export const getCommencementDateErrorContext = async params => getErrorContext(params);
