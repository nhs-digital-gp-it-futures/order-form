import { getDocument, ErrorContext } from 'buying-catalogue-library';
import { logger } from './logger';
import { getEndpoint } from './endpoints';

export const getDocumentByFileName = async ({
  res, documentName, contentType,
}) => {
  logger.info(`Downloading ${documentName}`);
  const endpoint = getEndpoint({
    endpointLocator: 'getDocument',
    options: { documentName },
  });
  try {
    const response = await getDocument({ endpoint, logger });
    res.setHeader('Content-type', contentType);
    return response.data.pipe(res);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      throw new ErrorContext({
        status: 404,
        backLinkHref: '/',
        backLinkText: 'Back',
        description: 'Document not found',
      });
    }
    throw err;
  }
};
