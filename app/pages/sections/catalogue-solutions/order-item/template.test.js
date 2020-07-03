import { componentTester } from '../../../../test-utils/componentTester';
import commonManifest from './commonManifest.json';

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

  it('should render error summary with correct error text and hrefs if there are errors', componentTester(setup, (harness) => {
    const context = {
      errors: [
        { text: 'quantity error message', href: '#quantity' },
        { text: 'price error message', href: '#price' },
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

  it('should render the order item page title', componentTester(setup, (harness) => {
    const context = {
      title: 'List price for order-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="order-item-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the order item page description', componentTester(setup, (harness) => {
    const context = {
      description: commonManifest.description,
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
        plannedDeliveryDate: {
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
        expect(legend.text().trim()).toEqual(context.questions.plannedDeliveryDate.mainAdvice);
      });
    }));

    it('should render additionalAdvice', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const addAdvice = $('[data-test-id="date-field-input"] span.nhsuk-hint');
        expect(addAdvice.length).toEqual(1);
        expect(addAdvice.text().trim())
          .toEqual(context.questions.plannedDeliveryDate.additionalAdvice);
      });
    }));

    it('should render 3 labels for date question', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const labels = $('[id="plannedDeliveryDate"] label');
        expect(labels.length).toEqual(3);
        expect(labels[0].attribs.for).toEqual('plannedDeliveryDate-day');
        expect(labels[0].children[0].data.trim()).toEqual('Day');
        expect(labels[1].attribs.for).toEqual('plannedDeliveryDate-month');
        expect(labels[1].children[0].data.trim()).toEqual('Month');
        expect(labels[2].attribs.for).toEqual('plannedDeliveryDate-year');
        expect(labels[2].children[0].data.trim()).toEqual('Year');
      });
    }));

    it('should render 3 input fields for date question', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const inputs = $('#plannedDeliveryDate input:not([name=_csrf])');
        expect(inputs.length).toEqual(3);
        expect(inputs[0].attribs.id).toEqual('plannedDeliveryDate-day');
        expect(inputs[0].attribs.name).toEqual('plannedDeliveryDate-day');
        expect(inputs[0].attribs.type).toEqual('number');
        expect(inputs[1].attribs.id).toEqual('plannedDeliveryDate-month');
        expect(inputs[1].attribs.name).toEqual('plannedDeliveryDate-month');
        expect(inputs[1].attribs.type).toEqual('number');
        expect(inputs[2].attribs.id).toEqual('plannedDeliveryDate-year');
        expect(inputs[2].attribs.name).toEqual('plannedDeliveryDate-year');
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

  describe('table', () => {
    it('should render the table headings', componentTester(setup, (harness) => {
      const context = {
        addPriceTable: {
          columnInfo: [
            {
              data: 'Price (£)',
            },
            {
              data: 'Unit of order',
            },
          ],
        },
      };

      harness.request(context, ($) => {
        const table = $('div[data-test-id="price-table"]');
        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="column-heading-0"]').text().trim()).toEqual('Price (£)');
        expect(table.find('[data-test-id="column-heading-1"]').text().trim()).toEqual('Unit of order');
      });
    }));

    it('should render the data', componentTester(setup, (harness) => {
      const context = {
        addPriceTable: {
          items: [
            [
              {
                question: {
                  type: 'input',
                  id: 'price',
                  data: '100',
                },
                classes: 'nhsuk-input--width-10',
                expandableSection: {
                  dataTestId: 'view-section-input-id',
                  title: 'some title',
                  innerComponent: 'some inner text',
                },
              },
              {
                data: 'per month',
                dataTestId: 'unit-of-order',
              },
            ],
          ],
        },
      };

      harness.request(context, ($) => {
        const table = $('div[data-test-id="price-table"]');
        const row = table.find('[data-test-id="table-row-0"]');
        const priceInput = row.find('[data-test-id="question-price"] input');
        const orderUnit = row.find('div[data-test-id="unit-of-order"]');
        const expandableSection = $('[data-test-id="view-section-input-id"]');

        expect(row.length).toEqual(1);
        expect(priceInput.length).toEqual(1);
        expect(priceInput.val()).toEqual('100');
        expect(priceInput.hasClass('nhsuk-input nhsuk-input--width-10')).toEqual(true);
        expect(expandableSection.find('span').text().trim()).toEqual('some title');
        expect(expandableSection.find('.nhsuk-details__text').text().trim()).toEqual('some inner text');
        expect(orderUnit.length).toEqual(1);
        expect(orderUnit.text().trim()).toEqual('per month');
      });
    }));

    it('should render errors on price input field if there are errors', componentTester(setup, (harness) => {
      const context = {
        addPriceTable: {
          items: [
            [
              {
                question: {
                  type: 'input',
                  id: 'price',
                  error: {
                    message: 'price error message',
                  },
                },
              },
            ],
          ],
        },
      };

      harness.request(context, ($) => {
        const supplierNameQuestion = $('div[data-test-id="question-price"]');
        expect(supplierNameQuestion.find('div[data-test-id="text-field-input-error"]').length).toEqual(1);
        expect(supplierNameQuestion.find('.nhsuk-error-message').text().trim()).toEqual('Error: price error message');
      });
    }));
  });

  it('should render the "Delete" button', componentTester(setup, (harness) => {
    const deleteContext = {
      deleteButtonText: 'Delete',
    };

    harness.request(deleteContext, ($) => {
      const button = $('[data-test-id="delete-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(deleteContext.deleteButtonText);
    });
  }));

  it('should render the "Save" button', componentTester(setup, (harness) => {
    const saveContext = {
      saveButtonText: 'Save',
    };

    harness.request(saveContext, ($) => {
      const button = $('[data-test-id="save-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(saveContext.saveButtonText);
    });
  }));
});
