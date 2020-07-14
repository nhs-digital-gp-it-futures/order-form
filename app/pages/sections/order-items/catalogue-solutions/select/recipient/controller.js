import { getData } from 'buying-catalogue-library';
import { getEndpoint } from '../../../../../../endpoints';
import { logger } from '../../../../../../logger';
import { getContext, getErrorContext } from './contextCreator';

export const getRecipientPageContext = params => getContext(params);

export const getSolution = async ({ solutionId, accessToken }) => {
  const endpoint = getEndpoint({ api: 'bapi', endpointLocator: 'getSolution', options: { solutionId } });
  const solutionData = await getData({ endpoint, accessToken, logger });
  logger.info(`Retrived solution data from BAPI for ${solutionId}`);

  return solutionData;
};

export const getRecipientErrorPageContext = params => getErrorContext(params);

export const validateRecipientForm = ({ data }) => {
  if (data.selectRecipient && data.selectRecipient.trim().length > 0) {
    return { success: true };
  }

  const errors = [
    {
      field: 'selectRecipient',
      id: 'SelectRecipientRequired',
    },
  ];
  return { success: false, errors };
};

export const getServiceRecipientName = ({ serviceRecipientId, recipients }) => (
  recipients.find(recipient => serviceRecipientId === recipient.odsCode).name
);
