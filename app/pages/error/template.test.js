import { createTestHarness } from '../../test-utils/testHarness';

const setup = {
  template: {
    path: 'pages/error/template.njk',
  },
};

describe('error page', () => {
  it('should render the error backLink', createTestHarness(setup, (harness) => {
    const context = {
      error: {
        backLinkText: 'Error backLinkText',
        backLinkHref: 'http://errorBackLinkHref.com',
      },
    };

    harness.request(context, ($) => {
      const errorBackLink = $('[data-test-id="error-back-link"] a');
      expect(errorBackLink.length).toEqual(1);
      expect(errorBackLink.text().trim()).toEqual(context.error.backLinkText);
      expect(errorBackLink.attr('href')).toEqual(context.error.backLinkHref);
    });
  }));

  it('should render the error title', createTestHarness(setup, (harness) => {
    const context = {
      error: {
        title: 'Error Title',
      },
    };

    harness.request(context, ($) => {
      const errorTitle = $('[data-test-id="error-title"]');
      expect(errorTitle.length).toEqual(1);
      expect(errorTitle.text().trim()).toEqual(context.error.title);
    });
  }));

  it('should render the error description', createTestHarness(setup, (harness) => {
    const context = {
      error: {
        description: 'Error Description',
      },
    };

    harness.request(context, ($) => {
      const errorDescription = $('[data-test-id="error-description"]');
      expect(errorDescription.length).toEqual(1);
      expect(errorDescription.text().trim()).toEqual(context.error.description);
    });
  }));
});
