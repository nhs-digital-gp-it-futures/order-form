import manifest from './manifest.json';
import config from '../../config';
import { getContext } from './contextCreator';

const defaultContext = {
  error: {
    backLinkHref: `${config.baseUrl}/`,
    ...manifest.error,
  },
};

describe('getErrorContext', () => {
  it('should get the default error context if no error provided', () => {
    const context = getContext();

    expect(context.error.status).toEqual(defaultContext.error.status);
    expect(context.error.backLinkText).toEqual(defaultContext.error.backLinkText);
    expect(context.error.backLinkHref).toEqual(defaultContext.error.backLinkHref);
    expect(context.error.title).toEqual(defaultContext.error.title);
    expect(context.error.description).toEqual(defaultContext.error.description);
  });

  it('should get the error status with the default error context', () => {
    const context = getContext({
      status: 999,
    });

    expect(context.error.status).toEqual(context.error.status);
  });

  it('should get the error backLinkText with the default error context', () => {
    const context = getContext({
      backLinkText: 'Error backLinkText',
    });

    expect(context.error.backLinkText).toEqual(context.error.backLinkText);
  });

  it('should get the error backLinkHref with the default error context', () => {
    const context = getContext({
      backLinkHref: 'http://errorBackLinkHref.com',
    });

    expect(context.error.backLinkHref).toEqual(context.error.backLinkHref);
  });

  it('should get the error title with the default error context', () => {
    const context = getContext({
      title: 'Error Title',
    });

    expect(context.error.title).toEqual(context.error.title);
  });

  it('should get the error title with the default error context', () => {
    const context = getContext({
      description: 'Error Description',
    });

    expect(context.error.description).toEqual(context.error.description);
  });
});
