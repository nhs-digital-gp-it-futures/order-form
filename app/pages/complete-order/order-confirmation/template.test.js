import { componentTester } from '../../../test-utils/componentTester';

const setup = {
  template: {
    path: 'pages/complete-order/order-confirmation/template.njk',
  },
};

const context = {
  backLinkText: 'some go back text',
  title: 'some order confirmation page title',
  description: 'some order confirmation page description',
  backLinkHref: '/some-back-link',
};

describe('order confirmation page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual(context.backLinkText);
      expect($(backLink).find('a').attr('href')).toEqual(context.backLinkHref);
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

  it('should render the order summary button text', componentTester(setup, (harness) => {
    const withOrderSummaryButtonTextContext = {
      ...context,
      orderSummaryButtonText: 'some order summary button text',
    };

    harness.request(withOrderSummaryButtonTextContext, ($) => {
      const orderSummaryButton = $('[data-test-id="order-confirmation-page-orderSummaryButton"]');
      expect(orderSummaryButton.length).toEqual(1);
      expect(orderSummaryButton.text().trim()).toEqual(
        withOrderSummaryButtonTextContext.orderSummaryButtonText,
      );
    });
  }));

  it('should not render the order summary button when no order summary button text is provided', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const orderSummaryButton = $('[data-test-id="order-confirmation-page-orderSummaryButton"]');
      expect(orderSummaryButton.length).toEqual(0);
    });
  }));

  it('should render order summary advice', componentTester(setup, (harness) => {
    const withOrderSummaryAdviceContext = {
      ...context,
      orderSummaryAdvice: [
        'some order summary advice',
        'some more order summary advice',
      ],
    };

    harness.request(withOrderSummaryAdviceContext, ($) => {
      withOrderSummaryAdviceContext.orderSummaryAdvice.map((advice, idx) => {
        expect($(`div[data-test-id="order-confirmation-page-orderSummaryAdvice"] p:nth-child(${idx + 1})`).text().trim()).toEqual(advice);
      });
    });
  }));

  it('should not render order summary advice when order summary advice is provided', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const orderSummaryAdvice = $('div[data-test-id="order-confirmation-page-orderSummaryAdvice"]');
      expect(orderSummaryAdvice.length).toEqual(0);
    });
  }));
});
