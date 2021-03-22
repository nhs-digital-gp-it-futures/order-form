import { componentTester } from '../../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/order-items/catalogue-solutions/delete/template.njk',
  },
};

const context = {
  ...manifest,
  backLinkHref: '/organisation/catalogue-1',
  catalogueDescription: 'some description',
};

describe('delete catalogue page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual(context.backLinkHref);
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
      const catalogueDescriptionTitle = $('h3[data-test-id="catalogue-description-title"]');
      expect(catalogueDescriptionTitle.length).toEqual(1);
      expect(catalogueDescriptionTitle.text().trim()).toEqual(context.catalogueDescription);
    });
  }));

  it('should render the delete catalogue description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const catalogueDescription = $('h4[data-test-id="catalogue-description"]');
      expect(catalogueDescription.length).toEqual(1);
      expect(catalogueDescription.text().trim()).toEqual(context.catalogueDescription);
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
