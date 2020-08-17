import { componentTester } from '../../test-utils/componentTester';
import { t } from 'testcafe';

const setup = {
  template: {
    path: 'pages/complete-order/template.njk',
  },
};

describe('complete order page', () => {
  const context = {
    backLinkText: 'some go back text',
    description: 'some page description',
    orderDescriptionTitle: 'some order description title',
    completeOrderButtonText: 'Complete order',
    continueEditingOrderButtonText: 'Continue editing order',
    title: 'some complete order title',
    backLinkHref: '/organisation/order-1',
    continueEditingOrderButtonHref: '/organisation/order-1',
    orderDescription: 'some order description',
    csrfToken: 'mockCsrfToken',
  };

  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1');
    });
  }));

  it('should render the backLink text', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.text().trim()).toEqual(context.backLinkText);
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

  it('should not render the complete order inset advice', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const insetAdvice = $('[data-test-id="complete-order-page-inset-advice"]');
      expect(insetAdvice.length).toEqual(0);
    });
  }));

  it('should render the complete order inset advice', componentTester(setup, (harness) => {
    const contextWithInsetAdvice = {
      ...context,
      insetAdvice: 'some inset advice',
    };

    harness.request(contextWithInsetAdvice, ($) => {
      const insetAdvice = $('div[data-test-id="complete-order-page-inset-advice"]');
      expect(insetAdvice.length).toEqual(1);
      expect(insetAdvice.text().trim()).toContain(contextWithInsetAdvice.insetAdvice);
    });
  }));

  it('should render the complete order page order description title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const orderDescriptionTitle = $('h3[data-test-id="order-description-title"]');
      expect(orderDescriptionTitle.length).toEqual(1);
      expect(orderDescriptionTitle.text().trim()).toEqual(context.orderDescriptionTitle);
    });
  }));

  it('should render the complete order page order description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const description = $('h2[data-test-id="complete-order-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
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

  it('should render the complete order page continue editing order button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="continue-editing-order-button"] a');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.continueEditingOrderButtonText);
      expect($(button).attr('href')).toEqual('/organisation/order-1');
    });
  }));

  it('should render the complete order page complete order button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="complete-order-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.completeOrderButtonText);
    });
  }));
});
