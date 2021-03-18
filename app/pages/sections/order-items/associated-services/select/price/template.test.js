import { componentTester } from '../../../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/order-items/associated-services/select/price/template.njk',
  },
};

describe('associated-services select-price page', () => {
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
          id: 'selectAssociatedServicePrice',
          error: [{ message: 'some select associated service price error message' }],
        },
      ],
      errors: [
        { text: 'some select associated service price error message', href: '#selectAssociatedServicePrice' },
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

  it('should render the associated service price page title', componentTester(setup, (harness) => {
    const context = {
      title: 'List price for associated-service-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="associated-service-price-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the associated service price page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('p[data-test-id="associated-service-price-page-description"]');
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

  it('should render the "Select list price" radio button options component', componentTester(setup, (harness) => {
    const context = {
      questions: [{
        id: 'selectAssociatedServicePrice',
        mainAdvice: 'Select list price',
        options: [{
          value: 'price-1',
          text: 'Price 1',
        }, {
          value: 'price-2',
          text: 'Price 2',
        }],
      }],
    };

    harness.request(context, ($) => {
      const selectAssociatedServiceRadioOptions = $('[data-test-id="question-selectAssociatedServicePrice"]');
      expect(selectAssociatedServiceRadioOptions.length).toEqual(1);
      expect(selectAssociatedServiceRadioOptions.find('legend').text().trim()).toEqual('Select list price');
      expect(selectAssociatedServiceRadioOptions.find('input').length).toEqual(2);
      expect(selectAssociatedServiceRadioOptions.find('.nhsuk-radios__item:nth-child(1)').find('input').attr('value')).toEqual('price-1');
      expect(selectAssociatedServiceRadioOptions.find('.nhsuk-radios__item:nth-child(1)').text().trim()).toEqual('Price 1');
      expect(selectAssociatedServiceRadioOptions.find('.nhsuk-radios__item:nth-child(2)').find('input').attr('value')).toEqual('price-2');
      expect(selectAssociatedServiceRadioOptions.find('.nhsuk-radios__item:nth-child(2)').text().trim()).toEqual('Price 2');
    });
  }));

  it('should render errors on selectAssociatedServicePrice field if there are errors', componentTester(setup, (harness) => {
    const context = {
      questions: [
        {
          id: 'selectAssociatedServicePrice',
          error: [{ message: 'some select associated service price error message' }],
        },
      ],
      errors: [
        { text: 'some select associated service price error message', href: '#selectAssociatedServicePrice' },
      ],
    };

    harness.request(context, ($) => {
      const supplierNameQuestion = $('div[data-test-id="question-selectAssociatedServicePrice"]');
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
