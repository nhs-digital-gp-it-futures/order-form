import { getData, putData } from 'buying-catalogue-library';
import { getContext, getErrorContext } from './contextCreator';
import { getDateErrors } from '../../../helpers/getDateErrors';
import { getEndpoint } from '../../../endpoints';
import { logger } from '../../../logger';
import { extractDate } from '../../../helpers/extractDate';
import { formatCommencementDate } from '../../../helpers/dateFormatter';

const formatPutData = data => ({
  commencementDate: extractDate('commencementDate', data),
});

const generateFormData = (commencementDateData) => {
  if (commencementDateData.commencementDate) {
    const [day, month, year] = formatCommencementDate(commencementDateData.commencementDate);
    return ({
      'commencementDate-day': day,
      'commencementDate-month': month,
      'commencementDate-year': year,
    });
  }
  return undefined;
};

export const getCommencementDateContext = async ({ orderId, accessToken }) => {
  const commencementDateDataEndpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'getCommencementDate', options: { orderId } });
  const commencementDateData = await getData({
    endpoint: commencementDateDataEndpoint, accessToken, logger,
  });

  logger.info(`Commencement date ${commencementDateData ? '' : 'not '}found for ${orderId}`);
  return getContext({
    orderId,
    data: generateFormData(commencementDateData),
  });
};

export const validateCommencementDateForm = ({ data }) => {
  const errors = [];
  const dateErrors = getDateErrors('commencementDate', data);
  if (dateErrors) {
    errors.push(dateErrors);
  }

  return errors;
};

export const putCommencementDate = async ({
  orderId, data, accessToken,
}) => {
  const endpoint = getEndpoint({ api: 'ordapi', endpointLocator: 'putCommencementDate', options: { orderId } });
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

export const getCommencementDateErrorContext = async params => getErrorContext(params);
