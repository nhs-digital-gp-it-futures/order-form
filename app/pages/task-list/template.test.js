import { componentTester } from '../../test-utils/componentTester';
import commonManifest from './commonManifest.json';
import neworderManifest from './neworder/manifest.json';
import existingorderManifest from './existingorder/manifest.json';
import taskListManifest from './taskListManifest.json';

const setup = {
  template: {
    path: 'pages/order-task-list/template.njk',
  },
};

describe('neworder task-list page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    const context = {
      orderId: 'neworder',
      backLinkText: 'Go back',
      backLinkHref: '/organisation',
    };

    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation');
    });
  }));

  it('should render the page', componentTester(setup, (harness) => {
    const context = {
      orderId: 'neworder',
    };

    harness.request(context, ($) => {
      const neworderPage = $('[data-test-id="neworder-page"]');
      expect(neworderPage.length).toEqual(1);
    });
  }));

  it('should render the title', componentTester(setup, (harness) => {
    const context = {
      orderId: 'neworder',
      title: neworderManifest.title,
    };

    harness.request(context, ($) => {
      const neworderPageTitle = $('[data-test-id="neworder-page-title"]');
      expect(neworderPageTitle.length).toEqual(1);
      expect(neworderPageTitle.text().trim()).toEqual(neworderManifest.title);
    });
  }));

  it('should render the description', componentTester(setup, (harness) => {
    const context = {
      orderId: 'neworder',
      description: neworderManifest.description,
    };

    harness.request(context, ($) => {
      const neworderPageDescription = $('[data-test-id="neworder-page-description"]');
      expect(neworderPageDescription.length).toEqual(1);
      expect(neworderPageDescription.text().trim()).toEqual(neworderManifest.description);
    });
  }));

  it('should not render the order details', componentTester(setup, (harness) => {
    const context = {
      orderId: 'neworder',
    };

    harness.request(context, ($) => {
      const neworderDescriptionTitle = $('[data-test-id="neworder-order-description-title"]');
      const neworderDescription = $('[data-test-id="neworder-order-description"]');
      expect(neworderDescriptionTitle.length).toEqual(0);
      expect(neworderDescription.length).toEqual(0);
    });
  }));

  it('should render the task-list component', componentTester(setup, (harness) => {
    const context = {
      orderId: 'neworder',
      taskList: taskListManifest.taskList,
    };

    harness.request(context, ($) => {
      const taskListComponent = $('[data-test-id="task-list"]');
      expect(taskListComponent.length).toEqual(1);
    });
  }));

  it('should render the "Delete order" as a secondary and disabled button', componentTester(setup, (harness) => {
    const context = {
      orderId: 'neworder',
      deleteOrderButton: {
        text: commonManifest.deleteOrderButton.text,
        altText: commonManifest.deleteOrderButton.disabledAltText,
        href: '#',
        disabled: true,
      },
    };

    harness.request(context, ($) => {
      const deleteOrderButton = $('[data-test-id="delete-order-button"]');
      expect(deleteOrderButton.length).toEqual(1);
      expect(deleteOrderButton.text().trim()).toEqual(commonManifest.deleteOrderButton.text);
      expect(deleteOrderButton.attr('aria-label')).toEqual(commonManifest.deleteOrderButton.disabledAltText);
      expect(deleteOrderButton.find('a').hasClass('nhsuk-button--secondary')).toEqual(true);
      expect(deleteOrderButton.find('a').hasClass('nhsuk-button--disabled')).toEqual(true);
    });
  }));

  it('should render the "Preview order summary" as a secondary and disabled button', componentTester(setup, (harness) => {
    const context = {
      orderId: 'neworder',
      previewOrderButton: {
        text: commonManifest.previewOrderButton.text,
        altText: commonManifest.previewOrderButton.disabledAltText,
        href: '#',
        disabled: true,
      },
    };

    harness.request(context, ($) => {
      const previewOrderButton = $('[data-test-id="preview-order-button"]');
      expect(previewOrderButton.length).toEqual(1);
      expect(previewOrderButton.text().trim()).toEqual(commonManifest.previewOrderButton.text);
      expect(previewOrderButton.attr('aria-label')).toEqual(commonManifest.previewOrderButton.disabledAltText);
      expect(previewOrderButton.find('a').hasClass('nhsuk-button--secondary')).toEqual(true);
      expect(previewOrderButton.find('a').hasClass('nhsuk-button--disabled')).toEqual(true);
    });
  }));

  it('should render the "Submit order" as a primary and disabled button', componentTester(setup, (harness) => {
    const context = {
      orderId: 'neworder',
      submitOrderButton: {
        text: commonManifest.submitOrderButton.text,
        altText: commonManifest.submitOrderButton.disabledAltText,
        href: '#',
        disabled: true,
      },
    };

    harness.request(context, ($) => {
      const submitOrderButton = $('[data-test-id="submit-order-button"]');
      expect(submitOrderButton.length).toEqual(1);
      expect(submitOrderButton.text().trim()).toEqual(commonManifest.submitOrderButton.text);
      expect(submitOrderButton.attr('aria-label')).toEqual(commonManifest.submitOrderButton.disabledAltText);
      expect(submitOrderButton.find('a').hasClass('nhsuk-button--secondary')).toEqual(false);
      expect(submitOrderButton.find('a').hasClass('nhsuk-button--disabled')).toEqual(true);
    });
  }));
});

describe('existingorder task-list page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-id',
      backLinkText: 'Go back',
      backLinkHref: '/organisation',
    };

    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation');
    });
  }));

  it('should render the page for the existing order', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-id',
    };

    harness.request(context, ($) => {
      const neworderPage = $('[data-test-id="order-id-page"]');
      expect(neworderPage.length).toEqual(1);
    });
  }));

  it('should render the title for the existing order', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-id',
      title: 'Order order-id',
    };

    harness.request(context, ($) => {
      const neworderPageTitle = $('[data-test-id="order-id-page-title"]');
      expect(neworderPageTitle.length).toEqual(1);
      expect(neworderPageTitle.text().trim()).toEqual(`${existingorderManifest.title} order-id`);
    });
  }));

  it('should render the description for the existing order', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-id',
      description: existingorderManifest.description,
    };

    harness.request(context, ($) => {
      const neworderPageDescription = $('[data-test-id="order-id-page-description"]');
      expect(neworderPageDescription.length).toEqual(1);
      expect(neworderPageDescription.text().trim()).toEqual(existingorderManifest.description);
    });
  }));

  it('should render the order details for the existing order', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-id',
      orderDescriptionTitle: existingorderManifest.orderDescriptionTitle,
      orderDescription: 'The order description',
    };

    harness.request(context, ($) => {
      const existingorderDescriptionTitle = $('[data-test-id="order-id-order-description-title"]');
      const existingorderDescription = $('[data-test-id="order-id-order-description"]');
      expect(existingorderDescriptionTitle.length).toEqual(1);
      expect(existingorderDescriptionTitle.text().trim())
        .toEqual(existingorderManifest.orderDescriptionTitle);
      expect(existingorderDescription.text().trim())
        .toEqual('The order description');
    });
  }));

  it('should render the task-list component', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-id',
      taskList: taskListManifest.taskList,
    };

    harness.request(context, ($) => {
      const taskListComponent = $('[data-test-id="task-list"]');
      expect(taskListComponent.length).toEqual(1);
    });
  }));

  it('should render the "Delete order" as a secondary and an enabled button', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-id',
      deleteOrderButton: {
        text: commonManifest.deleteOrderButton.text,
        href: '#',
      },
    };

    harness.request(context, ($) => {
      const deleteOrderButton = $('[data-test-id="delete-order-button"]');
      expect(deleteOrderButton.length).toEqual(1);
      expect(deleteOrderButton.text().trim()).toEqual(commonManifest.deleteOrderButton.text);
      expect(deleteOrderButton.attr('aria-label')).toEqual(commonManifest.deleteOrderButton.text);
      expect(deleteOrderButton.find('a').hasClass('nhsuk-button--secondary')).toEqual(true);
      expect(deleteOrderButton.find('a').hasClass('nhsuk-button--disabled')).toEqual(false);
    });
  }));

  it('should render the "Preview order summary" as a secondary and an enabled button', componentTester(setup, (harness) => {
    const context = {
      orderId: 'neworder',
      previewOrderButton: {
        text: commonManifest.previewOrderButton.text,
        href: '#',
      },
    };

    harness.request(context, ($) => {
      const previewOrderButton = $('[data-test-id="preview-order-button"]');
      expect(previewOrderButton.length).toEqual(1);
      expect(previewOrderButton.text().trim()).toEqual(commonManifest.previewOrderButton.text);
      expect(previewOrderButton.attr('aria-label')).toEqual(commonManifest.previewOrderButton.text);
      expect(previewOrderButton.find('a').hasClass('nhsuk-button--secondary')).toEqual(true);
      expect(previewOrderButton.find('a').hasClass('nhsuk-button--disabled')).toEqual(false);
    });
  }));

  it('should render the "Submit order" as a primary and disabled button', componentTester(setup, (harness) => {
    const context = {
      orderId: 'neworder',
      submitOrderButton: {
        text: commonManifest.submitOrderButton.text,
        altText: commonManifest.submitOrderButton.disabledAltText,
        href: '#',
        disabled: true,
      },
    };

    harness.request(context, ($) => {
      const submitOrderButton = $('[data-test-id="submit-order-button"]');
      expect(submitOrderButton.length).toEqual(1);
      expect(submitOrderButton.text().trim()).toEqual(commonManifest.submitOrderButton.text);
      expect(submitOrderButton.attr('aria-label')).toEqual(commonManifest.submitOrderButton.disabledAltText);
      expect(submitOrderButton.find('a').hasClass('nhsuk-button--secondary')).toEqual(false);
      expect(submitOrderButton.find('a').hasClass('nhsuk-button--disabled')).toEqual(true);
    });
  }));
});
