import { componentTester } from '../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/items/description/template.njk',
  },
};

const context = {
  ...manifest,
  title: 'org1 orders',
  backlinkHref: '/organisation/order-1',
  // TODO: Change below to be more in line with real href
  saveButtonHref: '#',
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

  it('should render the textareaFieldNoCount component', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const input = $('[data-test-id="question-description"] textarea');
      const footerAdvice = $('[data-test-id="textarea-field-footer"] span');

      expect(input.length).toEqual(1);
      expect(input[0].attribs.id).toEqual(context.descriptionQuestion.question.id);
      expect(input[0].attribs.name).toEqual(context.descriptionQuestion.question.id);
      expect(input[0].attribs.rows.trim())
        .toEqual(String(context.descriptionQuestion.question.rows));
      expect(footerAdvice.length).toEqual(1);
      expect(footerAdvice.text().trim()).toEqual(context.descriptionQuestion.question.footerAdvice);
    });
  }));

  it('should render the save button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="save-button"] a');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.saveButtonText);
      expect(button.attr('href')).toEqual(context.saveButtonHref);
    });
  }));
});
