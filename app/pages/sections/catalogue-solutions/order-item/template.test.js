import { componentTester } from '../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/catalogue-solutions/order-item/template.njk',
  },
};

describe('catalogue-solutions order-item page', () => {
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

  it('should render the order item page title', componentTester(setup, (harness) => {
    const context = {
      title: 'List price fororder-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="order-item-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the order item page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('h2[data-test-id="order-item-page-description"]');
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

  describe('Planned date', () => {
    const context = {
      questions: {
        plannedDate: {
          id: 'plannedDeliveryDate',
          mainAdvice: 'Planned delivery date',
          additionalAdvice: 'For example 14 01 2020',
        },
      },
    };

    it('should render legend with mainAdvice', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const legend = $('legend');
        expect(legend.length).toEqual(1);
        expect(legend.text().trim()).toEqual(context.questions.plannedDate.mainAdvice);
      });
    }));

    it('should render additionalAdvice', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const addAdvice = $('[data-test-id="date-field-input"] span.nhsuk-hint');
        expect(addAdvice.length).toEqual(1);
        expect(addAdvice.text().trim()).toEqual(context.questions.plannedDate.additionalAdvice);
      });
    }));

    it('should render 3 labels for date question', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const labels = $('label');
        expect(labels.length).toEqual(3);
        expect(labels[0].attribs.for).toEqual(`${manifest.questions.plannedDate.id}-day`);
        expect(labels[0].children[0].data.trim()).toEqual('Day');
        expect(labels[1].attribs.for).toEqual(`${manifest.questions.plannedDate.id}-month`);
        expect(labels[1].children[0].data.trim()).toEqual('Month');
        expect(labels[2].attribs.for).toEqual(`${manifest.questions.plannedDate.id}-year`);
        expect(labels[2].children[0].data.trim()).toEqual('Year');
      });
    }));


    it('should render 3 input fields for date question', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const inputs = $('#plannedDeliveryDate input:not([name=_csrf])');
        expect(inputs.length).toEqual(3);
        expect(inputs[0].attribs.id).toEqual(`${manifest.questions.plannedDate.id}-day`);
        expect(inputs[0].attribs.name).toEqual(`${manifest.questions.plannedDate.id}-day`);
        expect(inputs[0].attribs.type).toEqual('number');
        expect(inputs[1].attribs.id).toEqual(`${manifest.questions.plannedDate.id}-month`);
        expect(inputs[1].attribs.name).toEqual(`${manifest.questions.plannedDate.id}-month`);
        expect(inputs[1].attribs.type).toEqual('number');
        expect(inputs[2].attribs.id).toEqual(`${manifest.questions.plannedDate.id}-year`);
        expect(inputs[2].attribs.name).toEqual(`${manifest.questions.plannedDate.id}-year`);
        expect(inputs[2].attribs.type).toEqual('number');
      });
    }));
  });

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
      });
    }));

    it('should render expandableSection component', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const expandableSection = $('[data-test-id="view-section-quantity-id"]');
        expect(expandableSection.find('span').text().trim()).toEqual('What quantity should I enter?');
        expect(expandableSection.find('.nhsuk-details__text').text().trim()).toEqual('Estimate the quantity you think you\'ll need either per month or per year.');
      });
    }));
  });

  describe('estimation period', () => {
    const context = {
      questions: {
        estimationPeriod:
        {
          id: 'selectEstimationPeriod',
          mainAdvice: 'Estimation period',
          options: [
            {
              value: 'perMonth',
              text: 'Per month',
            },
            {
              value: 'perYear',
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
        expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(1)').find('input').attr('value')).toEqual('perMonth');
        expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(1)').text().trim()).toEqual('Per month');
        expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(2)').find('input').attr('value')).toEqual('perYear');
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
  });

  it('should render the "Delete" button', componentTester(setup, (harness) => {
    const context = {
      deleteButtonText: 'Delete',
    };

    harness.request(context, ($) => {
      const button = $('[data-test-id="delete-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.deleteButtonText);
    });
  }));

  it('should render the "Save" button', componentTester(setup, (harness) => {
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
