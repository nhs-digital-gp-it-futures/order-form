import { componentTester } from '../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/funding-source/template.njk',
  },
};

const context = {
  ...manifest,
  title: 'org1 orders',
  backLinkHref: '/organisation/odsCode/order/order-1',
  questions: [
    {
      id: 'selectFundingSource',
      mainAdvice: 'Are you paying for this order in full using your GP IT Futures centrally held funding allocation?',
      options: [{
        value: true,
        text: 'Yes',
      },
      {
        value: false,
        text: 'No',
      }],
    },
  ],
  csrfToken: 'mockCsrfToken',
};

describe('funding source page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/odsCode/order/order-1');
    });
  }));

  it('should render the funding source page title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('h1[data-test-id="funding-source-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the funding source page description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const description = $('[data-test-id="funding-source-page-description"]');
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

  it('should render the "Select funding source" radio button options component', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const selectRecipientRadioOptions = $('[data-test-id="question-selectFundingSource"]');
      expect(selectRecipientRadioOptions.length).toEqual(1);
      expect(selectRecipientRadioOptions.find('legend').text().trim()).toEqual(context.questions[0].mainAdvice);
      expect(selectRecipientRadioOptions.find('input').length).toEqual(2);
      expect(selectRecipientRadioOptions.find('.nhsuk-radios__item:nth-child(1)').find('input').attr('value')).toEqual('true');
      expect(selectRecipientRadioOptions.find('.nhsuk-radios__item:nth-child(1)').text().trim()).toEqual('Yes');
      expect(selectRecipientRadioOptions.find('.nhsuk-radios__item:nth-child(2)').find('input').attr('value')).toEqual('false');
      expect(selectRecipientRadioOptions.find('.nhsuk-radios__item:nth-child(2)').text().trim()).toEqual('No');
    });
  }));

  it('should render the insetAdvice', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      context.insetAdvice.map((advice, idx) => {
        expect($(`div[data-test-id="funding-source-page-insetAdvice"] p:nth-child(${idx + 1})`).text().trim()).toEqual(advice);
      });
    });
  }));

  it('should render errors on selectFundingSource field if there are errors', componentTester(setup, (harness) => {
    const errorContext = {
      questions: [
        {
          id: 'selectFundingSource',
          error: [{ message: 'some select funding source error message' }],
        },
      ],
      errors: [
        { text: 'some select funding source error message', href: '#selectFundingSource' },
      ],
    };

    harness.request(errorContext, ($) => {
      const supplierNameQuestion = $('div[data-test-id="question-selectFundingSource"]');
      expect(supplierNameQuestion.find('div[data-test-id="radiobutton-options-error"]').length).toEqual(1);
      expect(supplierNameQuestion.find('.nhsuk-error-message').text().trim()).toEqual('Error:');
    });
  }));

  it('should render the save button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="save-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.saveButtonText);
    });
  }));
});
