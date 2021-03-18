import { componentTester } from '../../../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/order-items/additional-services/select/recipient/template.njk',
  },
};

describe('additional-services select recipient page', () => {
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

  it('should render the additional-service-recipient page title', componentTester(setup, (harness) => {
    const context = {
      title: 'Service Recipient for Solution One',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="additional-service-recipient-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the additional-service-recipient page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('[data-test-id="additional-service-recipient-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the "Select Service Recipient" radio button options component', componentTester(setup, (harness) => {
    const context = {
      questions: [
        {
          id: 'selectRecipient',
          mainAdvice: 'Select Service Recipient (ODS code)',
          options: [
            {
              value: 'recipient-1',
              text: 'Recipient 1 (recipient-1)',
            },
            {
              value: 'recipient-2',
              text: 'Recipient 2 (recipient-2)',
            },
          ],
        },
      ],
    };

    harness.request(context, ($) => {
      const selectRecipientRadioOptions = $('[data-test-id="question-selectRecipient"]');
      expect(selectRecipientRadioOptions.length).toEqual(1);
      expect(selectRecipientRadioOptions.find('legend').text().trim()).toEqual(context.questions[0].mainAdvice);
      expect(selectRecipientRadioOptions.find('input').length).toEqual(2);
      expect(selectRecipientRadioOptions.find('.nhsuk-radios__item:nth-child(1)').find('input').attr('value')).toEqual('recipient-1');
      expect(selectRecipientRadioOptions.find('.nhsuk-radios__item:nth-child(1)').text().trim()).toEqual('Recipient 1 (recipient-1)');
      expect(selectRecipientRadioOptions.find('.nhsuk-radios__item:nth-child(2)').find('input').attr('value')).toEqual('recipient-2');
      expect(selectRecipientRadioOptions.find('.nhsuk-radios__item:nth-child(2)').text().trim()).toEqual('Recipient 2 (recipient-2)');
    });
  }));

  it('should render errors on selectRecipient field if there are errors', componentTester(setup, (harness) => {
    const context = {
      questions: [
        {
          id: 'selectRecipient',
          error: [{ message: 'some select recipient error message' }],
        },
      ],
      errors: [
        { text: 'some select recipient error message', href: '#selectRecipient' },
      ],
    };

    harness.request(context, ($) => {
      const selectRecipientQuestion = $('div[data-test-id="question-selectRecipient"]');
      expect(selectRecipientQuestion.find('div[data-test-id="radiobutton-options-error"]').length).toEqual(1);
      expect(selectRecipientQuestion.find('.nhsuk-error-message').text().trim()).toEqual('Error:');
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
