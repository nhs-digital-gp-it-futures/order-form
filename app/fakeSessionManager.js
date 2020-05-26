import { logger } from './logger';

export const sessionManager = {
  saveToSession: () => {
    logger.debug('Saving to session');
  },
  getFromSession: ({ req, key }) => {
    logger.debug(`Getting from session ${key}`);
    if (req.cookies && req.cookies[key]) {
      return JSON.parse(req.cookies[key]);
    }
    return undefined;
  },
};
