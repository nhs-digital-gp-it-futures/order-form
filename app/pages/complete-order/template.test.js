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
  orderDescription: 'some description',
  csrfToken: 'mockCsrfToken',
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

  it('should render the complete order order details', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const orderDescriptionTitle = $('h3[data-test-id="order-description-title"]');
      const orderDescription = $('h4[data-test-id="order-description"]');
      expect(orderDescriptionTitle.length).toEqual(1);
      expect(orderDescriptionTitle.text().trim()).toEqual(context.orderDescriptionTitle);
      expect(orderDescription.length).toEqual(1);
      expect(orderDescription.text().trim()).toEqual(context.orderDescription);
    });
  }));

  it('should render hidden input with csrf token', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const formElement = $('input[name=_csrf]');
      expect(formElement.length).toEqual(1);
      expect(formElement.attr('type')).toEqual('hidden');
      expect(formElement.attr('value')).toEqual(context.csrfToken);
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
