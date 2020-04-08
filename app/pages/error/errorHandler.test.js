import { errorHandler } from './errorHandler';

describe('errorHandler', () => {
  it('should return the default formatted error when no error is provided', () => {
    expect(errorHandler()).toEqual(expect.objectContaining({
      message: 'Something went wrong',
      status: 400,
    }));
  });

  it('should construct backLinkHref', () => {
    expect(errorHandler().backLinkHref).toEqual('/');
  });

  describe('when status or message is provided', () => {
    it('should change the message to the provided message', () => {
      expect(errorHandler({ message: 'a new message' })).toEqual(expect.objectContaining({
        message: 'a new message',
        status: 400,
      }));
    });

    it('should change the status to the provided status', () => {
      expect(errorHandler({ status: 500 })).toEqual(expect.objectContaining({
        message: 'Something went wrong',
        status: 500,
      }));
    });
  });

  describe('when error comes back from api', () => {
    let apiError;
    beforeEach(() => {
      apiError = {
        response: {
          status: 500,
          statusText: 'server error',
          config: {
            url: 'theurl/for/the/solution/55/Public',
          },
          data: {
            errors: ['some error'],
          },
        },
      };
    });

    it('should change the message to the response error and status text', () => {
      expect(errorHandler(apiError)).toEqual(expect.objectContaining({
        message: 'some error server error',
      }));
    });

    it('should change the status to the response status', () => {
      expect(errorHandler({ status: 500 })).toEqual(expect.objectContaining({
        status: 500,
      }));
    });
  });
});
