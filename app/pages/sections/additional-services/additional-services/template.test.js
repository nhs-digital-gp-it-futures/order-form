import { componentTester } from '../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/additional-services/additional-services/template.njk',
  },
};

describe('additional-services page', () => {
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
      const description = $('h2[data-test-id="additional-services-page-description"]');
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
      const orderDescriptionHeading = $('h3[data-test-id="order-description-heading"]');
      const orderDescription = $('h4[data-test-id="order-description"]');

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
