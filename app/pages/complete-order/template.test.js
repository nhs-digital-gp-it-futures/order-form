import { componentTester } from '../../test-utils/componentTester';
import withFundingManifest from './withFundingManifest.json';

const setup = {
  template: {
    path: 'pages/complete-order/template.njk',
  },
};

const context = {
  ...withFundingManifest,
  backLinkHref: '/organisation/order-1',
};

describe('complete order page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1');
    });
  }));

  it('should render the complete order page title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('h1[data-test-id="complete-order-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the complete order page description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const description = $('h2[data-test-id="complete-order-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the complete order button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="complete-order-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.completeOrderButtonText);
    });
  }));
});
