import { componentTester } from '../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/catalogue-solutions/catalogue-solutions/template.njk',
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
      addSolutionButtonText: 'Add Catalogue Solution',
      addSolutionButtonHref: '#',
    };

    harness.request(context, ($) => {
      const addSolutionButton = $('[data-test-id="add-solution-button"]');

      expect(addSolutionButton.length).toEqual(1);
      expect(addSolutionButton.find('a').hasClass('nhsuk-button--secondary')).toEqual(true);
      expect(addSolutionButton.text().trim()).toEqual(context.addSolutionButtonText);
      expect(addSolutionButton.find('a').attr('href')).toEqual('#');
    });
  }));

  it('should render no solutions text when the catalogueSolutions provided is an empty array', componentTester(setup, (harness) => {
    const context = {
      catalogueSolutions: [],
      noSolutionsText: manifest.noSolutionsText,
    };

    harness.request(context, ($) => {
      const addedSolutionsSection = $('[data-test-id="show-added-solutions"]');
      const noAddedSolutionsSection = addedSolutionsSection.find('[data-test-id="no-added-solutions"]');
      expect(addedSolutionsSection.length).toEqual(1);
      expect(noAddedSolutionsSection.length).toEqual(1);
      expect(noAddedSolutionsSection.text().trim()).toContain(context.noSolutionsText);
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
