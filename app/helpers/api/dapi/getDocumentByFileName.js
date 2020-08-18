import { getDocument, ErrorContext } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import { documentApiHost } from '../../../config';

export const getDocumentEndpoint = ({ documentName }) => (
  `${documentApiHost}/api/v1/documents/${documentName}`
);

export const getDocumentByFileName = async ({ res, documentName, contentType }) => {
  logger.info(`Downloading ${documentName}`);
  const documentEndpoint = getDocumentEndpoint({ documentName });
  try {
    const response = await getDocument({ documentEndpoint, logger });
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
