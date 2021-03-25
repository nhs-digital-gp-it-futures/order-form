import { componentTester } from '../../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/order-items/catalogue-solutions/delete/template.njk',
  },
};

const context = {
  ...manifest,
  backLinkHref: '/organisation/order-1/catalogue-solutions/order-item-id',
  catalogueDescription: 'some description',
};

describe('delete catalogue page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const backLinkText = $('[data-test-id="go-back-link"]');
      expect(backLinkText.length).toEqual(2);
      expect($(backLinkText).find('a').attr('href')).toEqual(context.backLinkHref);
    });
  }));

  it('should render the delete catalogue page title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('h1[data-test-id="delete-catalogue-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the delete catalogue page description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const description = $('h2[data-test-id="delete-catalogue-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the delete catalogue description title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const orderDescriptionTitle = $('h3[data-test-id="catalogue-description-title"]');
      expect(orderDescriptionTitle.length).toEqual(1);
      expect(orderDescriptionTitle.text().trim()).toEqual(context.orderDescriptionTitle);
    });
  }));

  it('should render the delete catalogue order description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const orderDescription = $('h4[data-test-id="catalogue-description"]');
      expect(orderDescription.length).toEqual(1);
      expect(orderDescription.text().trim()).toEqual(context.orderDescription);
    });
  }));

  it('should render the cancel link', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const noButton = $('[data-test-id="go-back-link"]');
      expect(noButton.length).toEqual(2);
      expect($(noButton).find('a').attr('href')).toEqual(context.backLinkHref);
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
