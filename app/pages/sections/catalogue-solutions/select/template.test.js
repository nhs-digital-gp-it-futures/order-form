import { componentTester } from '../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/catalogue-solutions/select/template.njk',
  },
};

describe('catalogue-solutions select page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-1',
      backLinkText: 'Go back',
      backLinkHref: '/organisation/order-1/catalogue-solutions',
    };

    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1/catalogue-solutions');
    });
  }));

  it('should render the solutions-select page title', componentTester(setup, (harness) => {
    const context = {
      title: 'Add Catalogue Solution for order-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="solutions-select-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the solutions-select page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('h2[data-test-id="solutions-select-page-description"]');
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

  it('should render the "Select Catalogue Solutions" radio button options component', componentTester(setup, (harness) => {
    const context = {
      questions: [
        {
          id: 'selectSolution',
          mainAdvice: 'Select Catalogue Solution',
          options: [
            {
              value: 'solution-1',
              text: 'Solution 1',
            },
            {
              value: 'solution-2',
              text: 'Solution 2',
            },
          ],
        },
      ],
    };

    harness.request(context, ($) => {
      const selectSupplierRadioOptions = $('[data-test-id="question-selectSolution"]');
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
