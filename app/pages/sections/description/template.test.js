import { componentTester } from '../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/description/template.njk',
  },
};

const context = {
  ...manifest,
  title: 'org1 orders',
  backlinkHref: '/organisation/order-1',
  csrfToken: 'mockCsrfToken',
};

describe('description page', () => {
  it('should render the description page title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('h1[data-test-id="description-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the description page description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const description = $('h2[data-test-id="description-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render hidden input with csrf token', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const formElement = $('input[name=_csrf]');
      expect(formElement.length).toEqual(1);
      expect(formElement.attr('type')).toEqual('hidden');
      expect(formElement.attr('value')).toEqual(context.csrfToken);
    });
  }));

  it('should render the textareaFieldNoCount component', componentTester(setup, (harness) => {
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
