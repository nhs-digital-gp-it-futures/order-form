import { componentTester } from '../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/delete-order/template.njk',
  },
};

const context = {
  ...manifest,
  backLinkHref: '/organisation/order-1',
  orderDescription: 'some description',
};

describe('delete order page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual(context.backLinkHref);
    });
  }));

  it('should render the delete order page title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('h1[data-test-id="delete-order-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the delete order page description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const description = $('[data-test-id="delete-order-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the delete order description title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const orderDescriptionTitle = $('h2[data-test-id="order-description-title"]');
      expect(orderDescriptionTitle.length).toEqual(1);
      expect(orderDescriptionTitle.text().trim()).toEqual(context.orderDescriptionTitle);
    });
  }));

  it('should render the delete order description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const orderDescription = $('[data-test-id="order-description"]');
      expect(orderDescription.length).toEqual(1);
      expect(orderDescription.text().trim()).toEqual(context.orderDescription);
    });
  }));

  it('should render the no button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="no-button"]');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.noButton.text);
      expect(button.find('a').attr('href')).toEqual(context.backLinkHref);
    });
  }));

  it('should render the yes button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="yes-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.yesButton.text);
    });
  }));
});
