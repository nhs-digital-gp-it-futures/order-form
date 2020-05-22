import { componentTester } from '../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/supplier/select/template.njk',
  },
};

describe('supplier select page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-1',
      backLinkText: 'Go back',
      backLinkHref: '/organisation/order-1/supplier/search',
    };

    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1/supplier/search');
    });
  }));

  it('should render the supplier-select page title', componentTester(setup, (harness) => {
    const context = {
      title: 'Suppliers found',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="supplier-select-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the supplier-select page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('h2[data-test-id="supplier-select-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render hidden input with csrf token', componentTester(setup, (harness) => {
    const context = {
      csrfToken: 'mockCsrfToken',
    };

    harness.request(context, ($) => {
      const formElement = $('input[name=_csrf]');
      expect(formElement.length).toEqual(1);
      expect(formElement.attr('type')).toEqual('hidden');
      expect(formElement.attr('value')).toEqual(context.csrfToken);
    });
  }));

  it('should render the "Select Supplier" radio button options component', componentTester(setup, (harness) => {
    const context = {
      questions: [
        {
          id: 'selectSupplier',
          mainAdvice: 'Select Supplier',
          options: [
            {
              value: 'supplier-1',
              text: 'Supplier 1',
            },
            {
              value: 'supplier-2',
              text: 'Supplier 2',
            },
          ],
        },
      ],
    };

    harness.request(context, ($) => {
      const selectSupplierRadioOptions = $('[data-test-id="question-selectSupplier"]');
      expect(selectSupplierRadioOptions.length).toEqual(1);
      expect(selectSupplierRadioOptions.find('legend').text().trim()).toEqual(context.questions[0].mainAdvice);
      expect(selectSupplierRadioOptions.find('input').length).toEqual(2);
    });
  }));

  it('should render the "Continue" button', componentTester(setup, (harness) => {
    const context = {
      continueButtonText: 'Continue',
    };

    harness.request(context, ($) => {
      const button = $('[data-test-id="continue-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.continueButtonText);
    });
  }));
});
