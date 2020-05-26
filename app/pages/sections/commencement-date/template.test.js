import { componentTester } from '../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/commencement-date/template.njk',
  },
};

const context = {
  ...manifest,
  title: 'Commencement date for order-id',
  backLinkHref: '/organisation/order-1',
  csrfToken: 'mockCsrfToken',
};

describe('commencement-date page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1');
    });
  }));

  it('should render the page title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('h1[data-test-id="commencement-date-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the page description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const description = $('h2[data-test-id="commencement-date-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  describe('form fields', () => {
    xit('should render hidden input with csrf token', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const formElement = $('input[name=_csrf]');
        expect(formElement.length).toEqual(1);
        expect(formElement.attr('type')).toEqual('hidden');
        expect(formElement.attr('value')).toEqual(context.csrfToken);
      });
    }));

    it('should render legend with mainAdvice', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const legend = $('legend');
        expect(legend.length).toEqual(1);
        expect(legend.text().trim()).toEqual(context.questions[0].mainAdvice);
      });
    }));

    it('should render additionalAdvice', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const addAdvice = $('[data-test-id="date-field-input"] span.nhsuk-hint');
        expect(addAdvice.length).toEqual(1);
        expect(addAdvice.text().trim()).toEqual(context.questions[0].additionalAdvice);
      });
    }));

    it('should render 3 labels for date question', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const labels = $('label');
        expect(labels.length).toEqual(3);
        expect(labels[0].attribs.for).toEqual(`${manifest.questions[0].id}-day`);
        expect(labels[0].children[0].data.trim()).toEqual('Day');
        expect(labels[1].attribs.for).toEqual(`${manifest.questions[0].id}-month`);
        expect(labels[1].children[0].data.trim()).toEqual('Month');
        expect(labels[2].attribs.for).toEqual(`${manifest.questions[0].id}-year`);
        expect(labels[2].children[0].data.trim()).toEqual('Year');
      });
    }));

    it('should render 3 input fields for date question', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const inputs = $('#commencementDate input:not([name=_csrf])');
        expect(inputs.length).toEqual(3);
        expect(inputs[0].attribs.id).toEqual(`${manifest.questions[0].id}-day`);
        expect(inputs[0].attribs.name).toEqual(`${manifest.questions[0].id}-day`);
        expect(inputs[0].attribs.type).toEqual('number');
        expect(inputs[1].attribs.id).toEqual(`${manifest.questions[0].id}-month`);
        expect(inputs[1].attribs.name).toEqual(`${manifest.questions[0].id}-month`);
        expect(inputs[1].attribs.type).toEqual('number');
        expect(inputs[2].attribs.id).toEqual(`${manifest.questions[0].id}-year`);
        expect(inputs[2].attribs.name).toEqual(`${manifest.questions[0].id}-year`);
        expect(inputs[2].attribs.type).toEqual('number');
      });
    }));
  });

  it('should render the save button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="save-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.saveButtonText);
    });
  }));
});
