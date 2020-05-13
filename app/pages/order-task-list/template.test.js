import { componentTester } from '../../test-utils/componentTester';
import neworderManifest from './neworder/manifest.json';
import taskListManifest from './taskListManifest.json';

const setup = {
  template: {
    path: 'pages/order-task-list/template.njk',
  },
};

describe('neworder task-list page', () => {
  const neworderPageContext = {
    ...neworderManifest,
    taskList: taskListManifest.taskList,
    orderId: 'neworder',
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

  it('should not render the order details', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const neworderDescriptionTitle = $('[data-test-id="neworder-order-description-title"]');
      const neworderDescription = $('[data-test-id="neworder-order-description"]');
      expect(neworderDescriptionTitle.length).toEqual(0);
      expect(neworderDescription.length).toEqual(0);
    });
  }));

  it('should render the neworder task-list component', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const taskListComponent = $('[data-test-id="task-list"]');
      expect(taskListComponent.length).toEqual(1);
    });
  }));

  it('should render the "Delete order" as a secondary and disabled button', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const deleteOrderButton = $('[data-test-id="delete-order-button"]');
      expect(deleteOrderButton.length).toEqual(1);
      expect(deleteOrderButton.text().trim()).toEqual(neworderPageContext.deleteOrderButton.text);
      expect(deleteOrderButton.attr('aria-label')).toEqual(neworderPageContext.deleteOrderButton.altText);
      expect(deleteOrderButton.find('a').hasClass('nhsuk-button--secondary')).toEqual(true);
      expect(deleteOrderButton.find('a').hasClass('nhsuk-button--disabled')).toEqual(true);
    });
  }));

  it('should render the "Preview order summary" as a secondary and disabled button', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const previewOrderButton = $('[data-test-id="preview-order-button"]');
      expect(previewOrderButton.length).toEqual(1);
      expect(previewOrderButton.text().trim()).toEqual(neworderPageContext.previewOrderButton.text);
      expect(previewOrderButton.attr('aria-label')).toEqual(neworderPageContext.previewOrderButton.altText);
      expect(previewOrderButton.find('a').hasClass('nhsuk-button--secondary')).toEqual(true);
      expect(previewOrderButton.find('a').hasClass('nhsuk-button--disabled')).toEqual(true);
    });
  }));

  it('should render the "Submit order" as a primary and disabled button', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const submitOrderButton = $('[data-test-id="submit-order-button"]');
      expect(submitOrderButton.length).toEqual(1);
      expect(submitOrderButton.text().trim()).toEqual(neworderPageContext.submitOrderButton.text);
      expect(submitOrderButton.attr('aria-label')).toEqual(neworderPageContext.submitOrderButton.altText);
      expect(submitOrderButton.find('a').hasClass('nhsuk-button--secondary')).toEqual(false);
      expect(submitOrderButton.find('a').hasClass('nhsuk-button--disabled')).toEqual(true);
    });
  }));
});

describe('existingorder task-list page', () => {
  const existingorderPageContext = {
    title: 'Order order-id',
    description: 'Complete the following steps to create an order',
    orderDescriptionTitle: 'Order description',
    orderDescription: 'The order description',
    taskList: taskListManifest.taskList,
    orderId: 'order-id',
    backLinkHref: '/organisation',
    backLinkText: 'Go back',
  };

  it('should render the backLink for the existing order', componentTester(setup, (harness) => {
    harness.request(existingorderPageContext, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation');
    });
  }));

  it('should render the page for the existing order', componentTester(setup, (harness) => {
    harness.request(existingorderPageContext, ($) => {
      const existingorderPage = $('[data-test-id="order-id-page"]');
      expect(existingorderPage.length).toEqual(1);
    });
  }));

  it('should render the title for the existing order', componentTester(setup, (harness) => {
    harness.request(existingorderPageContext, ($) => {
      const existingorderPageTitle = $('[data-test-id="order-id-page-title"]');
      expect(existingorderPageTitle.length).toEqual(1);
      expect(existingorderPageTitle.text().trim()).toEqual(existingorderPageContext.title);
    });
  }));

  it('should render the description for the existing order', componentTester(setup, (harness) => {
    harness.request(existingorderPageContext, ($) => {
      const existingorderPageDescription = $('[data-test-id="order-id-page-description"]');
      expect(existingorderPageDescription.length).toEqual(1);
      expect(existingorderPageDescription.text().trim())
        .toEqual(existingorderPageContext.description);
    });
  }));

  it('should render the order details for the existing order', componentTester(setup, (harness) => {
    harness.request(existingorderPageContext, ($) => {
      const existingorderDescriptionTitle = $('[data-test-id="order-id-order-description-title"]');
      const existingorderDescription = $('[data-test-id="order-id-order-description"]');
      expect(existingorderDescriptionTitle.length).toEqual(1);
      expect(existingorderDescriptionTitle.text().trim())
        .toEqual(existingorderPageContext.orderDescriptionTitle);
      expect(existingorderDescription.text().trim())
        .toEqual(existingorderPageContext.orderDescription);
    });
  }));
});
