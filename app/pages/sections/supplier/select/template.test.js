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

  it('should render error summary with correct error text and hrefs if there are errors', componentTester(setup, (harness) => {
    const context = {
      questions: [
        {
          id: 'selectSupplier',
          error: [{ message: 'some select supplier error message' }],
        },
      ],
      errors: [
        { text: 'some select supplier error message', href: '#selectSupplier' },
      ],
    };

    harness.request(context, ($) => {
      const errorSummary = $('[data-test-id="error-summary"]');
      const errorArray = $('[data-test-id="error-summary"] li a');
      expect(errorSummary.length).toEqual(1);
      expect(errorArray.length).toEqual(context.errors.length);
      context.errors.forEach((error, i) => {
        expect(errorArray[i].attribs.href).toEqual(error.href);
        expect(errorArray[i].children[0].data.trim()).toEqual(error.text);
      });
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

  it('should render errors on selectSupplier field if there are errors', componentTester(setup, (harness) => {
    const context = {
      questions: [
        {
          id: 'selectSupplier',
          error: [{ message: 'some select supplier error message' }],
        },
      ],
      errors: [
        { text: 'some select supplier error message', href: '#selectSupplier' },
      ],
    };

    harness.request(context, ($) => {
      const supplierNameQuestion = $('div[data-test-id="question-selectSupplier"]');
      expect(supplierNameQuestion.find('div[data-test-id="radiobutton-options-error"]').length).toEqual(1);
      expect(supplierNameQuestion.find('.nhsuk-error-message').text().trim()).toEqual('Error:');
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
