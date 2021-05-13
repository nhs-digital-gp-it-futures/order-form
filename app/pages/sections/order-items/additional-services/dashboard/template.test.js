import { componentTester } from '../../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/order-items/additional-services/dashboard/template.njk',
  },
};

describe('Additional-services - Dashboard page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-1',
      backLinkText: 'Go back',
      backLinkHref: '/organisation/odsCode/order/order-1',
    };

    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1');
    });
  }));

  it('should render the additional-services page title', componentTester(setup, (harness) => {
    const context = {
      title: 'Additional Services for order-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="additional-services-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the additional-services page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('[data-test-id="additional-services-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the additional-services page inset advice', componentTester(setup, (harness) => {
    const context = {
      insetAdvice: manifest.insetAdvice,
    };

    harness.request(context, ($) => {
      const insetAdvice = $('[data-test-id="additional-services-page-insetAdvice"]');
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
      const orderDescriptionHeading = $('h2[data-test-id="order-description-heading"]');
      const orderDescription = $('p[data-test-id="order-description"]');

      expect(orderDescriptionHeading.length).toEqual(1);
      expect(orderDescriptionHeading.text().trim()).toContain(context.orderDescriptionHeading);
      expect(orderDescription.length).toEqual(1);
      expect(orderDescription.text().trim()).toContain(context.orderDescription);
    });
  }));

  it('should render the "Add Additional Services" button', componentTester(setup, (harness) => {
    const context = {
      addOrderItemButtonText: 'Add Additional Services',
      addOrderItemButtonHref: '/organistaions/order-1/additional-services/select',
    };

    harness.request(context, ($) => {
      const addOrderItemButton = $('[data-test-id="add-orderItem-button"]');

      expect(addOrderItemButton.length).toEqual(1);
      expect(addOrderItemButton.find('a').hasClass('nhsuk-button--secondary')).toEqual(true);
      expect(addOrderItemButton.text().trim()).toEqual(context.addOrderItemButtonText);
      expect(addOrderItemButton.find('a').attr('href')).toEqual(context.addOrderItemButtonHref);
    });
  }));

  it('should render no additional services text when the items provided is an empty array', componentTester(setup, (harness) => {
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
            data: 'Additional Service',
          },
          {
            data: 'Service Recipient (ODS code)',
          },
        ],
        items: [
          [
            {
              data: 'Additional Service One',
              href: '/orderItem1',
              dataTestId: 'orderItem1-catalogueItemName',
            },
            {
              data: 'Recipient One (recipient-1)',
              dataTestId: 'orderItem1-serviceRecipient',
            },
          ],
          [
            {
              data: 'Additional Service Two',
              href: '/orderItem2',
              dataTestId: 'orderItem2-catalogueItemName',
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
        expect(table.find('[data-test-id="column-heading-0"]').text().trim()).toEqual('Additional Service');
        expect(table.find('[data-test-id="column-heading-1"]').text().trim()).toEqual('Service Recipient (ODS code)');
      });
    }));

    it('should render the data', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const table = $('div[data-test-id="added-orderItems"]');
        const row1 = table.find('[data-test-id="table-row-0"]');
        const row1catalogueItemName = row1.find('a[data-test-id="orderItem1-catalogueItemName"]');
        const row1serviceRecipient = row1.find('div[data-test-id="orderItem1-serviceRecipient"]');
        const row2 = table.find('[data-test-id="table-row-1"]');
        const row2catalogueItemName = row2.find('a[data-test-id="orderItem2-catalogueItemName"]');
        const row2serviceRecipient = row2.find('div[data-test-id="orderItem2-serviceRecipient"]');

        expect(row1.length).toEqual(1);
        expect(row1catalogueItemName.length).toEqual(1);
        expect(row1catalogueItemName.text().trim()).toEqual('Additional Service One');
        expect(row1catalogueItemName.attr('href')).toEqual('/orderItem1');
        expect(row1serviceRecipient.length).toEqual(1);
        expect(row1serviceRecipient.text().trim()).toEqual('Recipient One (recipient-1)');

        expect(row2.length).toEqual(1);
        expect(row2catalogueItemName.length).toEqual(1);
        expect(row2catalogueItemName.text().trim()).toEqual('Additional Service Two');
        expect(row2catalogueItemName.attr('href')).toEqual('/orderItem2');
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
