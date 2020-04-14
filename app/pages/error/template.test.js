import { createTestHarness } from '../../test-utils/testHarness';

const setup = {
  template: {
    path: 'pages/error/template.njk',
  },
};

describe('error page', () => {
  it('should render the error title', createTestHarness(setup, (harness) => {
    const context = { message: 'an error message', backLinkHref: '/' };

    harness.request(context, ($) => {
      const errorTitle = $('[data-test-id="error-page-title"]');
      expect(errorTitle.length).toEqual(1);
      expect(errorTitle.text().trim()).toEqual(`Error: ${context.message}`);
    });
  }));

  it('should render a backLink to the home page', createTestHarness(setup, (harness) => {
    const context = { backLinkHref: '/' };

    harness.request(context, ($) => {
      const homepageBackLink = $('[data-test-id="go-to-home-page-link"]');
      expect(homepageBackLink.length).toEqual(1);
      expect(homepageBackLink.text().trim()).toEqual('Go to Home Page');
      expect($(homepageBackLink).find('a').attr('href')).toEqual('/');
    });
  }));
});
