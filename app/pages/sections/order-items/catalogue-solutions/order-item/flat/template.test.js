import { componentTester } from '../../../../../../test-utils/componentTester';

const setup = {
  template: {
    path: 'pages/sections/order-items/catalogue-solutions/order-item/flat/template.njk',
  },
};

describe('catalogue-solution order-item - quantity and estimation page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-1',
      backLinkText: 'Go back',
      backLinkHref: '/organisation/order-1/catalogue-solutions/select/solution/price/recipients/date',
    };

    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href'))
        .toEqual('/organisation/order-1/catalogue-solutions/select/solution/price/recipients/date');
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

  it('should render error summary with correct error text and hrefs if there are errors', componentTester(setup, (harness) => {
    const context = {
      errors: [
        { text: 'quantity error message', href: '#quantity' },
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

  it('should render the order item - quantity and estimation page title', componentTester(setup, (harness) => {
    const context = {
      title: 'Quantity of Write on time for 101',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="order-item-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the order item page description', componentTester(setup, (harness) => {
    const context = {
      description: "Enter the quantity you think you'll need and over what period.",
    };

    harness.request(context, ($) => {
      const description = $('[data-test-id="order-item-page-description"]');
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

  describe('quantity', () => {
    const context = {
      questions: {
        quantity: {
          id: 'quantity',
          mainAdvice: 'Quantity',
          rows: 3,
          expandableSection: {
            dataTestId: 'view-section-quantity-id',
            title: 'What quantity should I enter?',
            innerComponent: "Estimate the quantity you think you'll need either per month or per year.",
          },
        },
      },
    };

    it('should render a label for quantity', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const labels = $('[data-test-id="question-quantity"] label');
        expect(labels[0].attribs.for).toEqual(context.questions.quantity.id);
        expect(labels[0].children[0].data.trim()).toEqual(context.questions.quantity.mainAdvice);
      });
    }));

    it('should render a textField for quantity', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const input = $('[data-test-id="question-quantity"] input');

        expect(input.length).toEqual(1);
        expect(input.attr('id')).toEqual(context.questions.quantity.id);
        expect(input.attr('name')).toEqual(context.questions.quantity.id);
        expect(input.attr('type')).toEqual('text');
        expect(input.hasClass('nhsuk-input--width-10')).toEqual(true);
      });
    }));

    it('should render expandableSection component', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const expandableSection = $('[data-test-id="view-section-quantity-id"]');
        expect(expandableSection.find('span').text().trim()).toEqual('What quantity should I enter?');
        expect(expandableSection.find('.nhsuk-details__text').text().trim()).toEqual('Estimate the quantity you think you\'ll need either per month or per year.');
      });
    }));

    it('should render errors on quantity field if there are errors', componentTester(setup, (harness) => {
      context.questions.quantity.error = { message: 'quantity error message' };

      harness.request(context, ($) => {
        const supplierNameQuestion = $('div[data-test-id="question-quantity"]');
        expect(supplierNameQuestion.find('div[data-test-id="text-field-input-error"]').length).toEqual(1);
        expect(supplierNameQuestion.find('.nhsuk-error-message').text().trim()).toEqual('Error: quantity error message');
      });
    }));
  });

  describe('estimation period', () => {
    const context = {
      questions: {
        selectEstimationPeriod: {
          id: 'selectEstimationPeriod',
          mainAdvice: 'Estimation period',
          options: [
            {
              value: 'month',
              text: 'Per month',
            },
            {
              value: 'year',
              text: 'Per year',
            },
          ],
          expandableSection: {
            dataTestId: 'view-section-estimation-period-id',
            title: 'What period should I enter?',
            innerComponent: 'This should be based on how you estimated the quantity you want to order.',
          },
        },
      },
    };

    it('should render the "Estimation period" radio button options component', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const selectSolutionRadioOptions = $('[data-test-id="question-selectEstimationPeriod"]');
        expect(selectSolutionRadioOptions.length).toEqual(1);
        expect(selectSolutionRadioOptions.find('legend').text().trim()).toEqual('Estimation period');
        expect(selectSolutionRadioOptions.find('input').length).toEqual(2);
        expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(1)').find('input').attr('value')).toEqual('month');
        expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(1)').text().trim()).toEqual('Per month');
        expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(2)').find('input').attr('value')).toEqual('year');
        expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(2)').text().trim()).toEqual('Per year');
      });
    }));

    it('should render expandableSection component', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const expandableSection = $('[data-test-id="view-section-estimation-period-id"]');
        expect(expandableSection.find('span').text().trim()).toEqual('What period should I enter?');
        expect(expandableSection.find('.nhsuk-details__text').text().trim()).toEqual('This should be based on how you estimated the quantity you want to order.');
      });
    }));

    it('should not render the estimation period question or exandable section if not provided', componentTester(setup, (harness) => {
      const contextWithoutEstimationPeriod = {
        questions: {},
      };

      harness.request(contextWithoutEstimationPeriod, ($) => {
        const selectSolutionRadioOptions = $('[data-test-id="question-selectEstimationPeriod"]');
        const expandableSection = $('[data-test-id="view-section-estimation-period-id"]');

        expect(selectSolutionRadioOptions.length).toEqual(0);
        expect(expandableSection.length).toEqual(0);
      });
    }));
  });
});
