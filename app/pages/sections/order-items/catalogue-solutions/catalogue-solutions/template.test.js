import { componentTester } from '../../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/order-items/catalogue-solutions/catalogue-solutions/template.njk',
  },
};

describe('catalogue-solutions page', () => {
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

  it('should render the catalogue-solutions page title', componentTester(setup, (harness) => {
    const context = {
      title: 'Catalogue Solution for order-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="catalogue-solutions-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the catalogue-solutions page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('h2[data-test-id="catalogue-solutions-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the catalogue-solutions page inset advice', componentTester(setup, (harness) => {
    const context = {
      insetAdvice: manifest.insetAdvice,
    };

    harness.request(context, ($) => {
      const insetAdvice = $('[data-test-id="catalogue-solutions-page-insetAdvice"]');
      expect(insetAdvice.length).toEqual(1);
      expect(insetAdvice.text().trim()).toContain(context.insetAdvice);
    });
  }));

  it('should render the order description', componentTester(setup, (harness) => {
    const context = {
      orderDescriptionHeading: manifest.orderDescriptionHeading,
      orderDescription: 'some-order-description',
    };

    harness.request(context, ($) => {
      const orderDescriptionHeading = $('h3[data-test-id="order-description-heading"]');
      const orderDescription = $('h4[data-test-id="order-description"]');

      expect(orderDescriptionHeading.length).toEqual(1);
      expect(orderDescriptionHeading.text().trim()).toContain(context.orderDescriptionHeading);
      expect(orderDescription.length).toEqual(1);
      expect(orderDescription.text().trim()).toContain(context.orderDescription);
    });
  }));

  it('should render the "Add Catalogue Solution" button', componentTester(setup, (harness) => {
    const context = {
      addOrderItemButtonText: 'Add Catalogue Solution',
      addOrderItemButtonHref: '/organistaions/order-1/catalogue-solutions/select',
    };

    harness.request(context, ($) => {
      const addOrderItemButton = $('[data-test-id="add-orderItem-button"]');

      expect(addOrderItemButton.length).toEqual(1);
      expect(addOrderItemButton.find('a').hasClass('nhsuk-button--secondary')).toEqual(true);
      expect(addOrderItemButton.text().trim()).toEqual(context.addOrderItemButtonText);
      expect(addOrderItemButton.find('a').attr('href')).toEqual(context.addOrderItemButtonHref);
    });
  }));

  it('should render no solutions text when the items provided is an empty array', componentTester(setup, (harness) => {
    const context = {
      addedOrderItemsTable: {
        items: [],
      },
      noOrderItemsText: manifest.noOrderItemsText,
    };

    harness.request(context, ($) => {
      const addedOrderItemsSection = $('[data-test-id="show-added-orderItems"]');
      const noAddedOrderItemsSection = addedOrderItemsSection.find('[data-test-id="no-added-orderItems"]');
      expect(addedOrderItemsSection.length).toEqual(1);
      expect(noAddedOrderItemsSection.length).toEqual(1);
      expect(noAddedOrderItemsSection.text().trim()).toContain(context.noOrderItemsText);
    });
  }));

  describe('Added Order Items table', () => {
    const context = {
      addedOrderItemsTable: {
        columnInfo: [
          {
            data: 'Catalogue Solution',
          },
          {
            data: 'Service Recipient (ODS code)',
          },
        ],
        items: [
          [
            {
              data: 'Solution One',
              href: '/orderItem1',
              dataTestId: 'orderItem1-solutionName',
            },
            {
              data: 'Recipient One (recipient-1)',
              dataTestId: 'orderItem1-serviceRecipient',
            },
          ],
          [
            {
              data: 'Solution One',
              href: '/orderItem2',
              dataTestId: 'orderItem2-solutionName',
            },
            {
              data: 'Recipient Two (recipient-2)',
              dataTestId: 'orderItem2-serviceRecipient',
            },
          ],
        ],
      },
    };

    it('should render the table headings', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="added-orderItems"]');
        expect(table.length).toEqual(1);
        expect(table.find('[data-test-id="column-heading-0"]').text().trim()).toEqual('Catalogue Solution');
        expect(table.find('[data-test-id="column-heading-1"]').text().trim()).toEqual('Service Recipient (ODS code)');
      });
    }));

    it('should render the data', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="added-orderItems"]');
        const row1 = table.find('[data-test-id="table-row-0"]');
        const row1SolutionName = row1.find('a[data-test-id="orderItem1-solutionName"]');
        const row1serviceRecipient = row1.find('div[data-test-id="orderItem1-serviceRecipient"]');
        const row2 = table.find('[data-test-id="table-row-1"]');
        const row2solutionName = row2.find('a[data-test-id="orderItem2-solutionName"]');
        const row2serviceRecipient = row2.find('div[data-test-id="orderItem2-serviceRecipient"]');

        expect(row1.length).toEqual(1);
        expect(row1SolutionName.length).toEqual(1);
        expect(row1SolutionName.text().trim()).toEqual('Solution One');
        expect(row1SolutionName.attr('href')).toEqual('/orderItem1');
        expect(row1serviceRecipient.length).toEqual(1);
        expect(row1serviceRecipient.text().trim()).toEqual('Recipient One (recipient-1)');

        expect(row2.length).toEqual(1);
        expect(row2solutionName.length).toEqual(1);
        expect(row2solutionName.text().trim()).toEqual('Solution One');
        expect(row2solutionName.attr('href')).toEqual('/orderItem2');
        expect(row2serviceRecipient.length).toEqual(1);
        expect(row2serviceRecipient.text().trim()).toEqual('Recipient Two (recipient-2)');
      });
    }));
  });

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
