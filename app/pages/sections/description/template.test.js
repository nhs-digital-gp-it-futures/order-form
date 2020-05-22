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
  backLinkHref: '/organisation/order-1',
  csrfToken: 'mockCsrfToken',
};

const questionsWithErrors = {
  questions: [
    {
      id: 'description',
      mainAdvice: 'footerAdvice',
      rows: 3,
      error: [{ message: 'Description must be 100 characters or fewer' }],
    },
  ],
  errors: [
    { text: 'Description must be 100 characters or fewer', href: '#description' },
  ],
};

const contextWithErrors = {
  ...context,
  ...questionsWithErrors,
};

describe('description page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1');
    });
  }));

  it('should render the description page title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('h1[data-test-id="description-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render error summary with correct error text and hrefs if there are errors', componentTester(setup, (harness) => {
    harness.request(contextWithErrors, ($) => {
      const errorSummary = $('[data-test-id="error-summary"]');
      const errorArray = $('[data-test-id="error-summary"] li a');
      expect(errorSummary.length).toEqual(1);
      expect(errorArray.length).toEqual(contextWithErrors.errors.length);
      contextWithErrors.errors.forEach((error, i) => {
        expect(errorArray[i].attribs.href).toEqual(error.href);
        expect(errorArray[i].children[0].data.trim()).toEqual(error.text);
      });
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

  it('should render errors description field if there are errors', componentTester(setup, (harness) => {
    harness.request(contextWithErrors, ($) => {
      const descriptionQuestion = $('div[data-test-id="question-description"]');
      expect(descriptionQuestion.find('div[data-test-id="textarea-field-error"]').length).toEqual(1);
      expect(descriptionQuestion.find('.nhsuk-error-message').text().trim()).toEqual('Error:');
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
