import { componentTester } from '../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/commencement-date/template.njk',
  },
};

// const context = {
//   ...manifest,
//   title: 'Commencement date for order-id',
//   backLinkHref: '/organisation/order-1',
//   csrfToken: 'mockCsrfToken',
// };

// const contextWithErrors = {
//   ...context,
//   questions: [{
//     ...manifest.questions[0],
//     error: {
//       message: 'error message',
//       fields: ['day', 'month'],
//     },
//   }],
//   errors: [{ text: 'summary error message', href: '#commencementDate' }],
// };

describe('commencement-date page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    const context = {
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
      errors: [
        { text: 'quantity error message', href: '#quantity' },
        { text: 'price error message', href: '#price' },
      ],
    };

    harness.request(context, ($) => {
      const errorSummary = $('[data-test-id="error-summary"]');
      const error = $('[data-test-id="error-summary"] li a');
      expect(errorSummary.length).toEqual(1);
      expect(error.length).toEqual(context.errors.length);
      expect(error[0].attribs.href).toEqual(context.errors[0].href);
      expect(error[0].children[0].data.trim()).toEqual(context.errors[0].text);
    });
  }));

  it('should render the page title', componentTester(setup, (harness) => {
    const context = {
      title: 'Commencement date for order-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="commencement-date-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('h2[data-test-id="commencement-date-page-description"]');
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

  describe('Commencement Date', () => {
    const context = {
      questions: {
        commencementDate: {
          id: 'commencementDate',
          mainAdvice: 'Commencement date',
          additionalAdvice: 'For example 14 01 2020',
        },
      },
    };

    it('should render legend with mainAdvice', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const legend = $('legend');
        expect(legend.length).toEqual(1);
        expect(legend.text().trim()).toEqual(context.questions.commencementDate.mainAdvice);
      });
    }));

    it('should render additionalAdvice', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const addAdvice = $('[data-test-id="date-field-input"] span.nhsuk-hint');
        expect(addAdvice.length).toEqual(1);
        expect(addAdvice.text().trim())
          .toEqual(context.questions.commencementDate.additionalAdvice);
      });
    }));

    it('should render 3 labels for date question', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const labels = $('label');
        expect(labels.length).toEqual(3);
        expect(labels[0].attribs.for).toEqual('commencementDate-day');
        expect(labels[0].children[0].data.trim()).toEqual('Day');
        expect(labels[1].attribs.for).toEqual('commencementDate-month');
        expect(labels[1].children[0].data.trim()).toEqual('Month');
        expect(labels[2].attribs.for).toEqual('commencementDate-year');
        expect(labels[2].children[0].data.trim()).toEqual('Year');
      });
    }));

    it('should render 3 input fields for date question', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const inputs = $('#commencementDate input:not([name=_csrf])');
        expect(inputs.length).toEqual(3);
        expect(inputs[0].attribs.id).toEqual('commencementDate-day');
        expect(inputs[0].attribs.name).toEqual('commencementDate-day');
        expect(inputs[0].attribs.type).toEqual('number');
        expect(inputs[1].attribs.id).toEqual('commencementDate-month');
        expect(inputs[1].attribs.name).toEqual('commencementDate-month');
        expect(inputs[1].attribs.type).toEqual('number');
        expect(inputs[2].attribs.id).toEqual('commencementDate-year');
        expect(inputs[2].attribs.name).toEqual('commencementDate-year');
        expect(inputs[2].attribs.type).toEqual('number');
      });
    }));

    it('should render 3 input fields populated with data when the data is provided', componentTester(setup, (harness) => {
      const contextWithData = {
        questions: {
          commencementDate: {
            ...context.questions.commencementDate,
            data: {
              day: '09',
              month: '02',
              year: '2021',
            },
          },
        },
      };

      harness.request(contextWithData, ($) => {
        const inputs = $('#commencementDate input:not([name=_csrf])');
        expect(inputs.length).toEqual(3);
        expect(inputs[0].attribs.value).toEqual('09');
        expect(inputs[1].attribs.value).toEqual('02');
        expect(inputs[2].attribs.value).toEqual('2021');
      });
    }));

    it('should render error field if there are errors', componentTester(setup, (harness) => {
      const contextWithErrors = {
        questions: {
          commencementDate: {
            ...context.questions.commencementDate,
            error: {
              message: 'Some commencement date error',
              fields: ['day', 'month', 'year'],
            },
          },
        },
      };

      harness.request(contextWithErrors, ($) => {
        const form = $('form');
        const renderedQuestion = form.find('div[data-test-id="question-commencementDate"]');
        const fieldError = renderedQuestion.find('div[data-test-id="date-field-input-error"]');
        const errorMessage = renderedQuestion.find('.nhsuk-error-message');
        const errorInputs = renderedQuestion.find('.nhsuk-input--error');

        expect(fieldError.length).toEqual(1);
        expect(errorMessage.text().trim()).toEqual('Error: Some commencement date error');
        expect(errorInputs.length).toEqual(3);
        expect(errorInputs[0].attribs.id).toEqual('commencementDate-day');
        expect(errorInputs[1].attribs.id).toEqual('commencementDate-month');
        expect(errorInputs[2].attribs.id).toEqual('commencementDate-year');
      });
    }));
  });

  it('should render the save button', componentTester(setup, (harness) => {
    const context = {
      saveButtonText: 'Save',
    };

    harness.request(context, ($) => {
      const button = $('[data-test-id="save-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.saveButtonText);
    });
  }));
});
