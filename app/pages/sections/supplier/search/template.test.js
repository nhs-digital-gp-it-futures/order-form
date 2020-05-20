import { componentTester } from '../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/supplier/search/template.njk',
  },
};

describe('supplier search page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-1',
      backLinkText: 'Go back',
      backLinkHref: '/organisation',
    };

    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1');
    });
  }));

  it('should render the supplier-search page title', componentTester(setup, (harness) => {
    const context = {
      title: 'Find supplier information for order-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="supplier-search-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the supplier-search page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('h2[data-test-id="supplier-search-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render hidden input with csrf token', componentTester(setup, (harness) => {
    const context = {};

    harness.request(context, ($) => {
      const formElement = $('input[name=_csrf]');
      expect(formElement.length).toEqual(1);
      expect(formElement.attr('type')).toEqual('hidden');
      expect(formElement.attr('value')).toEqual(context.csrfToken);
    });
  }));

  it('should render the "Enter Supplier name" textfield component', componentTester(setup, (harness) => {
    const context = {
      questions: 
    }
    
    harness.request(context, ($) => {
      const input = $('[data-test-id="question-description"] textarea');
      const footerAdvice = $('[data-test-id="textarea-field-footer"] span');

      expect(input.length).toEqual(1);
      expect(input.attr('id')).toEqual(context.questions[0].id);
      expect(input.attr('name')).toEqual(context.questions[0].id);
      expect(input.attr('rows').trim())
        .toEqual(String(context.questions[0].rows));
      expect(footerAdvice.length).toEqual(1);
      expect(footerAdvice.text().trim()).toEqual(context.questions[0].footerAdvice);
    });
  }));

  it('should render the save button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="save-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.saveButtonText);
    });
  }));
});
