import { componentTester } from '../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/supplier/search/template.njk',
  },
};

describe('supplier search page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-1',
      backLinkText: 'Go back',
      backLinkHref: '/organisation/order-1',
    };

    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1');
    });
  }));

  it('should render error summary with correct error text and hrefs if there are errors', componentTester(setup, (harness) => {
    const context = {
      questions: [
        {
          id: 'supplierName',
          error: [{ message: 'some supplier name error message' }],
        },
      ],
      errors: [
        { text: 'some supplier name error message', href: '#supplierName' },
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

  it('should render the supplier-search page title', componentTester(setup, (harness) => {
    const context = {
      title: 'Find supplier information for order-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="supplier-search-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the supplier-search page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('h2[data-test-id="supplier-search-page-description"]');
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

  it('should render the "Enter Supplier name" textfield component', componentTester(setup, (harness) => {
    const context = {
      questions: manifest.questions,
    };

    harness.request(context, ($) => {
      const supplierNameInput = $('[data-test-id="question-supplierName"]');
      expect(supplierNameInput.length).toEqual(1);
      expect(supplierNameInput.find('label').text().trim()).toEqual(context.questions[0].mainAdvice);
      expect(supplierNameInput.find('input').length).toEqual(1);
    });
  }));

  it('should render errors on supplierName field if there are errors', componentTester(setup, (harness) => {
    const context = {
      questions: [
        {
          id: 'supplierName',
          error: [{ message: 'some supplier name error message' }],
        },
      ],
      errors: [
        { text: 'some supplier name error message', href: '#supplierName' },
      ],
    };

    harness.request(context, ($) => {
      const supplierNameQuestion = $('div[data-test-id="question-supplierName"]');
      expect(supplierNameQuestion.find('div[data-test-id="text-field-input-error"]').length).toEqual(1);
      expect(supplierNameQuestion.find('.nhsuk-error-message').text().trim()).toEqual('Error:');
    });
  }));

  it('should render the "Search" button', componentTester(setup, (harness) => {
    const context = {
      searchButtonText: 'Search',
    };

    harness.request(context, ($) => {
      const button = $('[data-test-id="search-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.searchButtonText);
    });
  }));
});
