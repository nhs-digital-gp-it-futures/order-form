import { componentTester } from '../../../../../test-utils/componentTester';
import commonManifest from './commonManifest.json';

const setup = {
  template: {
    path: 'pages/sections/order-items/catalogue-solutions/edit-solution/template.njk',
  },
};

describe('catalogue-solutions edit-solution page', () => {
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
        { text: 'price error message', href: '#price' },
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

  describe('price', () => {
    const context = {
      questions: {
        price: {
          id: 'price',
          mainAdvice: 'What price have you agreed? (£)',
          expandableSection: {
            dataTestId: 'view-section-price-id',
            title: 'What price should I enter?',
            innerComponent: "Enter the price you've agreed with the supplier. We've included the list price, but this can be changed if required.",
          },
        },
      },
    };

    it('should render a label for price', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const labels = $('[data-test-id="question-price"] label');
        expect(labels[0].attribs.for).toEqual(context.questions.price.id);
        expect(labels[0].children[0].data.trim()).toEqual(context.questions.price.mainAdvice);
      });
    }));

    it('should render a textField for price', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const input = $('[data-test-id="question-price"] input');

        expect(input.length).toEqual(1);
        expect(input.attr('id')).toEqual(context.questions.price.id);
        expect(input.attr('name')).toEqual(context.questions.price.id);
        expect(input.attr('type')).toEqual('text');
        expect(input.hasClass('nhsuk-input--width-10')).toEqual(true);
      });
    }));

    it('should render expandableSection component', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const expandableSection = $('[data-test-id="view-section-price-id"]');
        expect(expandableSection.find('span').text().trim()).toEqual('What price should I enter?');
        expect(expandableSection.find('.nhsuk-details__text').text().trim()).toEqual('Enter the price you\'ve agreed with the supplier. We\'ve included the list price, but this can be changed if required.');
      });
    }));

    it('should render errors on price field if there are errors', componentTester(setup, (harness) => {
      context.questions.price.error = { message: 'price error message' };

      harness.request(context, ($) => {
        const supplierNameQuestion = $('div[data-test-id="question-price"]');
        expect(supplierNameQuestion.find('div[data-test-id="text-field-input-error"]').length).toEqual(1);
        expect(supplierNameQuestion.find('.nhsuk-error-message').text().trim()).toEqual('Error: price error message');
      });
    }));
  });

  describe('table', () => {
    it('should render the table headings', componentTester(setup, (harness) => {
      const context = {
        solutionTable: {
          columnInfo: [
            {
              data: 'Recipient name (ODS code)',
            },
            {
              data: 'Practice list size',
            },
            {
              data: 'Planned delivery date',
            },
          ],
        },
      };

      harness.request(context, ($) => {
        const table = $('div[data-test-id="solution-table"]');
        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="column-heading-0"]').text().trim()).toEqual('Recipient name (ODS code)');
        expect(table.find('[data-test-id="column-heading-1"]').text().trim()).toEqual('Practice list size');
        expect(table.find('[data-test-id="column-heading-2"]').text().trim()).toEqual('Planned delivery date');
      });
    }));

    it('should render the data', componentTester(setup, (harness) => {
      const context = {
        solutionTable: {
          items: [
            [
              {
                data: 'solution (ods code)',
                dataTestId: 'recipient',
              },
              {
                question: {
                  type: 'input',
                  id: 'practice',
                  data: '100',
                },
                classes: 'nhsuk-input--width-10',
                expandableSection: {
                  dataTestId: 'view-section-input-id-practice',
                  title: 'some title practice',
                  innerComponent: 'some inner text practice',
                },
              },
              {
                question: {
                  type: 'date',
                  id: 'date',
                  data: {
                    day: '09',
                    month: '02',
                    year: '2021',
                  },
                },
                classes: 'nhsuk-input--width-10',
                expandableSection: {
                  dataTestId: 'view-section-input-id-date',
                  title: 'some title date',
                  innerComponent: 'some inner text date',
                },
              },
            ],
          ],
        },
      };

      harness.request(context, ($) => {
        const table = $('div[data-test-id="solution-table"]');
        const row = table.find('[data-test-id="table-row-0"]');
        const orderUnit = row.find('div[data-test-id="recipient"]');
        const practiceInput = row.find('[data-test-id="question-practice"] input');
        const expandableSectionPractice = $('[data-test-id="view-section-input-id-practice"]');
        const dateInput = row.find('[data-test-id="question-date"] input');
        const expandableSectionDate = $('[data-test-id="view-section-input-id-date"]');

        expect(row.length).toEqual(1);

        expect(orderUnit.length).toEqual(1);
        expect(orderUnit.text().trim()).toEqual('solution (ods code)');

        expect(practiceInput.length).toEqual(1);
        expect(practiceInput.val()).toEqual('100');
        expect(practiceInput.hasClass('nhsuk-input nhsuk-input--width-10')).toEqual(true);
        expect(expandableSectionPractice.find('span').text().trim()).toEqual('some title practice');
        expect(expandableSectionPractice.find('.nhsuk-details__text').text().trim()).toEqual('some inner text practice');

        expect(dateInput.length).toEqual(3);
        expect(dateInput[0].attribs.value).toEqual('09');
        expect(dateInput[1].attribs.value).toEqual('02');
        expect(dateInput[2].attribs.value).toEqual('2021');
        expect(expandableSectionDate.find('span').text().trim()).toEqual('some title date');
        expect(expandableSectionDate.find('.nhsuk-details__text').text().trim()).toEqual('some inner text date');
      });
    }));

    it('should render errors on table input fields if there are errors', componentTester(setup, (harness) => {
      const context = {
        solutionTable: {
          items: [
            [
              {
                question: {
                  type: 'input',
                  id: 'practice',
                  error: {
                    message: 'Some practice input date error',
                  },
                },
              },
              {
                question: {
                  type: 'date',
                  id: 'date',
                  error: {
                    message: 'Some delivery date error',
                    fields: ['day', 'month', 'year'],
                  },
                },
              },
            ],
          ],
        },
      };

      harness.request(context, ($) => {
        const practiceQuestion = $('div[data-test-id="question-practice"]');
        const dateQuestion = $('div[data-test-id="question-date"]');

        expect(practiceQuestion.find('div[data-test-id="text-field-input-error"]').length).toEqual(1);
        expect(practiceQuestion.find('.nhsuk-error-message').text().trim()).toEqual('Error: Some practice input date error');
        expect(dateQuestion.find('div[data-test-id="date-field-input-error"]').length).toEqual(1);
        expect(dateQuestion.find('.nhsuk-error-message').text().trim()).toEqual('Error: Some delivery date error');
      });
    }));
  });

  it('should render the "Delete" button', componentTester(setup, (harness) => {
    const deleteContext = {
      deleteButton: {
        text: commonManifest.deleteButton.text,
      },
    };

    harness.request(deleteContext, ($) => {
      const button = $('[data-test-id="delete-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(commonManifest.deleteButton.text);
    });
  }));

  it('should render the "Delete" button as a secondary and disabled button', componentTester(setup, (harness) => {
    const context = {
      deleteButton: {
        text: commonManifest.deleteButton.text,
        href: '#',
        disabled: true,
      },
    };

    harness.request(context, ($) => {
      const deleteOrderButton = $('[data-test-id="delete-button"]');
      expect(deleteOrderButton.length).toEqual(1);
      expect(deleteOrderButton.text().trim()).toEqual(commonManifest.deleteButton.text);
      expect(deleteOrderButton.find('a').hasClass('nhsuk-button--secondary')).toEqual(true);
      expect(deleteOrderButton.find('a').hasClass('nhsuk-button--disabled')).toEqual(true);
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
