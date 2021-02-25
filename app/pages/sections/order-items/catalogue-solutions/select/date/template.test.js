import { componentTester } from '../../../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/order-items/catalogue-solutions/select/date/template.njk',
  },
};

const context = {
  ...manifest,
  title: 'Service Recipients for Solution One for order-id',
  backLinkHref: '/organisation/order-1',
  csrfToken: 'mockCsrfToken',
};

describe('delivery date page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1');
    });
  }));

  it('should render the errorSummary if there are errors', componentTester(setup, (harness) => {
    const contextWithErrors = {
      errors: [
        { text: 'some delivery date error message', href: '#deliveryDate' },
      ],
    };

    harness.request(contextWithErrors, ($) => {
      const errorSummary = $('[data-test-id="error-summary"]');
      const errorArray = $('[data-test-id="error-summary"] li a');
      expect(errorSummary.length).toEqual(1);
      expect(errorArray.length).toEqual(contextWithErrors.errors.length);
      contextWithErrors.errors.forEach((error, i) => {
        expect(errorArray[i].attribs.href).toEqual(error.href);
        expect(errorArray[i].children[0].data.trim()).toEqual(error.text);
      });
    });
  }));

  it('should render the page title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('h1[data-test-id="planned-delivery-date-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the page description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const description = $('[data-test-id="planned-delivery-date-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the complete order inset advice', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const insetAdvice = $('div[data-test-id="planned-delivery-date-page-inset-advice"]');
      expect(insetAdvice.length).toEqual(1);
      expect(insetAdvice.text().trim()).toContain(context.insetAdvice);
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

  describe('Planned delivery Date', () => {
    it('should render legend with mainAdvice', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const legend = $('legend');
        expect(legend.length).toEqual(1);
        expect(legend.text().trim()).toEqual(context.questions.deliveryDate.mainAdvice);
      });
    }));

    it('should render additionalAdvice', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const addAdvice = $('[data-test-id="date-field-input"] span.nhsuk-hint');
        expect(addAdvice.length).toEqual(1);
        expect(addAdvice.text().trim())
          .toEqual(context.questions.deliveryDate.additionalAdvice);
      });
    }));

    it('should render 3 labels for date question', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const labels = $('label');
        expect(labels.length).toEqual(3);
        expect(labels[0].attribs.for).toEqual('deliveryDate-day');
        expect(labels[0].children[0].data.trim()).toEqual('Day');
        expect(labels[1].attribs.for).toEqual('deliveryDate-month');
        expect(labels[1].children[0].data.trim()).toEqual('Month');
        expect(labels[2].attribs.for).toEqual('deliveryDate-year');
        expect(labels[2].children[0].data.trim()).toEqual('Year');
      });
    }));

    it('should render 3 input fields for date question', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const inputs = $('#deliveryDate input:not([name=_csrf])');
        expect(inputs.length).toEqual(3);
        expect(inputs[0].attribs.id).toEqual('deliveryDate-day');
        expect(inputs[0].attribs.name).toEqual('deliveryDate-day');
        expect(inputs[0].attribs.type).toEqual('number');
        expect(inputs[1].attribs.id).toEqual('deliveryDate-month');
        expect(inputs[1].attribs.name).toEqual('deliveryDate-month');
        expect(inputs[1].attribs.type).toEqual('number');
        expect(inputs[2].attribs.id).toEqual('deliveryDate-year');
        expect(inputs[2].attribs.name).toEqual('deliveryDate-year');
        expect(inputs[2].attribs.type).toEqual('number');
      });
    }));

    it('should render 3 input fields populated with data when the data is provided', componentTester(setup, (harness) => {
      const contextWithData = {
        questions: {
          deliveryDate: {
            ...context.questions.deliveryDate,
            data: {
              day: '09',
              month: '02',
              year: '2021',
            },
          },
        },
      };

      harness.request(contextWithData, ($) => {
        const inputs = $('#deliveryDate input:not([name=_csrf])');
        expect(inputs.length).toEqual(3);
        expect(inputs[0].attribs.value).toEqual('09');
        expect(inputs[1].attribs.value).toEqual('02');
        expect(inputs[2].attribs.value).toEqual('2021');
      });
    }));

    it('should render error field if there are errors', componentTester(setup, (harness) => {
      const contextWithErrors = {
        questions: {
          deliveryDate: {
            ...context.questions.deliveryDate,
            error: {
              message: 'Some planned delivery date error',
              fields: ['day', 'month', 'year'],
            },
          },
        },
      };

      harness.request(contextWithErrors, ($) => {
        const form = $('form');
        const renderedQuestion = form.find('div[data-test-id="question-deliveryDate"]');
        const fieldError = renderedQuestion.find('div[data-test-id="date-field-input-error"]');
        const errorMessage = renderedQuestion.find('.nhsuk-error-message');
        const errorInputs = renderedQuestion.find('.nhsuk-input--error');

        expect(fieldError.length).toEqual(1);
        expect(errorMessage.text().trim()).toEqual('Error: Some planned delivery date error');
        expect(errorInputs.length).toEqual(3);
        expect(errorInputs[0].attribs.id).toEqual('deliveryDate-day');
        expect(errorInputs[1].attribs.id).toEqual('deliveryDate-month');
        expect(errorInputs[2].attribs.id).toEqual('deliveryDate-year');
      });
    }));
  });

  it('should render the continue button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="continue-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.continueButtonText);
    });
  }));
});
