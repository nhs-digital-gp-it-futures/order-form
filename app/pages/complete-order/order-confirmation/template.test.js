import { componentTester } from '../../../test-utils/componentTester';
import withFundingManifest from './withFundingManifest.json';

const setup = {
  template: {
    path: 'pages/complete-order/order-confirmation/template.njk',
  },
};

const context = {
  ...withFundingManifest,
  backLinkHref: '/organisation',
};

describe('order confirmation page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back to all orders');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation');
    });
  }));

  it('should render the order confirmation page title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('h1[data-test-id="order-confirmation-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the order confirmation page description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const description = $('h2[data-test-id="order-confirmation-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));
});
