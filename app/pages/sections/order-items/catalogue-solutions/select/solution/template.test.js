import { componentTester } from '../../../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/order-items/catalogue-solutions/select/solution/template.njk',
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

  it('should render error summary with correct error text and hrefs if there are errors', componentTester(setup, (harness) => {
    const context = {
      questions: [
        {
          id: 'selectSolution',
          error: [{ message: 'some select solution error message' }],
        },
      ],
      errors: [
        { text: 'some select solution error message', href: '#selectSolution' },
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

  it('should render the solutions-select page title', componentTester(setup, (harness) => {
    const context = {
      title: 'Add Catalogue Solution for order-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="solution-select-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the solutions-select page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('h2[data-test-id="solution-select-page-description"]');
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
      const selectSolutionRadioOptions = $('[data-test-id="question-selectSolution"]');
      expect(selectSolutionRadioOptions.length).toEqual(1);
      expect(selectSolutionRadioOptions.find('legend').text().trim()).toEqual(context.questions[0].mainAdvice);
      expect(selectSolutionRadioOptions.find('input').length).toEqual(2);
      expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(1)').find('input').attr('value')).toEqual('solution-1');
      expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(1)').text().trim()).toEqual('Solution 1');
      expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(2)').find('input').attr('value')).toEqual('solution-2');
      expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(2)').text().trim()).toEqual('Solution 2');
    });
  }));

  it('should render errors on selectSolution field if there are errors', componentTester(setup, (harness) => {
    const context = {
      questions: [
        {
          id: 'selectSolution',
          error: [{ message: 'some select solution error message' }],
        },
      ],
      errors: [
        { text: 'some select solution error message', href: '#selectSolution' },
      ],
    };

    harness.request(context, ($) => {
      const selectSolutionQuestion = $('div[data-test-id="question-selectSolution"]');
      expect(selectSolutionQuestion.find('div[data-test-id="radiobutton-options-error"]').length).toEqual(1);
      expect(selectSolutionQuestion.find('.nhsuk-error-message').text().trim()).toEqual('Error:');
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
