import { componentTester } from '../../test-utils/componentTester';
import manifest from './neworder/manifest.json';

const setup = {
  template: {
    path: 'pages/order-task-list/template.njk',
  },
};

describe('neworder task-list page', () => {
  const neworderPageContext = {
    ...manifest,
    pageName: 'neworder',
    backLinkHref: '/organisation',
  };

  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation');
    });
  }));

  it('should render the neworder task-list page', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const neworderPage = $('[data-test-id="neworder-page"]');
      expect(neworderPage.length).toEqual(1);
    });
  }));

  it('should render the neworder task-list title', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const neworderPageTitle = $('[data-test-id="neworder-page-title"]');
      expect(neworderPageTitle.length).toEqual(1);
      expect(neworderPageTitle.text().trim()).toEqual(neworderPageContext.title);
    });
  }));

  it('should render the neworder task-list description', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const neworderPageDescription = $('[data-test-id="neworder-page-description"]');
      expect(neworderPageDescription.length).toEqual(1);
      expect(neworderPageDescription.text().trim()).toEqual(neworderPageContext.description);
    });
  }));

  it('should render the "Delete order" as a secondary and disabled button', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const deleteOrderButton = $('[data-test-id="delete-order-button"]');
      expect(deleteOrderButton.length).toEqual(1);
      expect(deleteOrderButton.text().trim()).toEqual(neworderPageContext.deleteOrderButtonText);
      expect(deleteOrderButton.attr('aria-label')).toEqual(neworderPageContext.deleteOrderButtonAltText);
      expect(deleteOrderButton.find('a').hasClass('nhsuk-button--secondary')).toEqual(true);
      expect(deleteOrderButton.find('a').hasClass('nhsuk-button--disabled')).toEqual(true);
    });
  }));

  it('should render the "Preview order summary" as a secondary and disabled button', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const previewOrderButton = $('[data-test-id="preview-order-button"] a');
      expect(previewOrderButton.length).toEqual(1);
      expect(previewOrderButton.text().trim()).toEqual(neworderPageContext.previewOrderButtonText);
      expect(previewOrderButton.hasClass('nhsuk-button--secondary')).toEqual(true);
      expect(previewOrderButton.hasClass('nhsuk-button--disabled')).toEqual(true);
    });
  }));

  it('should render the "Submit order" as a primary and disabled button', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const submitOrderButton = $('[data-test-id="submit-order-button"] a');
      expect(submitOrderButton.length).toEqual(1);
      expect(submitOrderButton.text().trim()).toEqual(neworderPageContext.submitOrderButtonText);
      expect(submitOrderButton.hasClass('nhsuk-button--secondary')).toEqual(false);
      expect(submitOrderButton.hasClass('nhsuk-button--disabled')).toEqual(true);
    });
  }));
});
