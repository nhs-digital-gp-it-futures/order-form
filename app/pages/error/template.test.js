import { componentTester } from '../../test-utils/componentTester';

const setup = {
  template: {
    path: 'pages/error/template.njk',
  },
};

describe('error page', () => {
  it('should render the error backLink', componentTester(setup, (harness) => {
    const context = {
      backLinkText: 'Error backLinkText',
      backLinkHref: 'http://errorBackLinkHref.com',
    };

    harness.request(context, ($) => {
      const errorBackLink = $('[data-test-id="error-back-link"] a');
      expect(errorBackLink.length).toEqual(1);
      expect(errorBackLink.text().trim()).toEqual(context.backLinkText);
      expect(errorBackLink.attr('href')).toEqual(context.backLinkHref);
    });
  }));

  it('should render the error title', componentTester(setup, (harness) => {
    const context = {
      title: 'Error Title',
    };

    harness.request(context, ($) => {
      const errorTitle = $('[data-test-id="error-title"]');
      expect(errorTitle.length).toEqual(1);
      expect(errorTitle.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the error description', componentTester(setup, (harness) => {
    const context = {
      description: 'Error Description',
    };

    harness.request(context, ($) => {
      const errorDescription = $('[data-test-id="error-description"]');
      expect(errorDescription.length).toEqual(1);
      expect(errorDescription.text().trim()).toEqual(context.description);
    });
  }));
});
