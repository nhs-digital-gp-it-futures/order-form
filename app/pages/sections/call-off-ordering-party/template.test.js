import { componentTester } from '../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/call-off-ordering-party/template.njk',
  },
};

const mockData = {
  name: 'Hampshire CC',
  odsCode: 'AB3',
  address: {
    line1: 'line 1',
    line2: 'line 2',
    line3: 'line 3',
    line4: null,
    line5: 'line 5',
    town: 'townville',
    county: 'countyshire',
    postcode: 'HA3 PSH',
    country: 'UK',
  },
};

const context = {
  ...manifest,
  ...mockData,
  title: 'Call-off Ordering Party information for order-id',
  backLinkHref: '/organisation/order-1',
  csrfToken: 'mockCsrfToken',
};

const questionsWithErrors = {
  questions: [{
    id: 'firstName',
    mainAdvice: 'First name',
    footerAdvice: '(Maximum character length 100)',
    error: [{ message: 'First name must be 100 characters or fewer' }],
  }, {
    id: 'lastName',
    mainAdvice: 'Last name',
    footerAdvice: '(Maximum character length 100)',
    error: [{ message: 'Last name must be 100 characters or fewer' }],
  }, {
    id: 'emailAddress',
    mainAdvice: 'Email address',
    footerAdvice: '(Maximum character length 256)',
    error: [{ message: 'Email address must be 256 characters or fewer' }],
  }, {
    id: 'telephoneNumber',
    mainAdvice: 'Telephone number',
    footerAdvice: '(Maximum character length 35)',
    error: [{ message: 'Telephone number must be 35 characters or fewer' }],
  }],
  errors: [
    { text: 'First name must be 100 characters or fewer', href: '#firstName' },
    { text: 'Last name must be 100 characters or fewer', href: '#lastName' },
    { text: 'Email address must be 256 characters or fewer', href: '#emailAddress' },
    { text: 'Telephone number must be 35 characters or fewer', href: '#telephoneNumber' },
  ],
};

const contextWithErrors = {
  ...context,
  ...questionsWithErrors,
};


describe('call-off-ordering-party page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1');
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

  it('should render the page title', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const title = $('h1[data-test-id="call-off-ordering-party-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the page description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const description = $('h2[data-test-id="call-off-ordering-party-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render organisation name', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const heading = $('h3[data-test-id="organisation-name-heading"]');
      const text = $('div[data-test-id="organisation-name"]');
      expect(heading.length).toEqual(1);
      expect(heading.text().trim()).toEqual(context.orgNameHeading);
      expect(text.length).toEqual(1);
      expect(text.text().trim()).toEqual(context.name);
    });
  }));

  it('should render organisation ods code', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const heading = $('h3[data-test-id="organisation-ods-code-heading"]');
      const text = $('div[data-test-id="organisation-ods-code"]');
      expect(heading.length).toEqual(1);
      expect(heading.text().trim()).toEqual(context.odsCodeHeading);
      expect(text.length).toEqual(1);
      expect(text.text().trim()).toEqual(context.odsCode);
    });
  }));

  it('should render organisation address', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const heading = $('h3[data-test-id="organisation-address-heading"]');
      const line1 = $('div[data-test-id="organisation-address-1"]');
      const line2 = $('div[data-test-id="organisation-address-2"]');
      const line3 = $('div[data-test-id="organisation-address-3"]');
      const line4 = $('div[data-test-id="organisation-address-4"]');
      const line5 = $('div[data-test-id="organisation-address-5"]');
      const town = $('div[data-test-id="organisation-address-town"]');
      const county = $('div[data-test-id="organisation-address-county"]');
      const postcode = $('div[data-test-id="organisation-address-postcode"]');
      const country = $('div[data-test-id="organisation-address-country"]');

      expect(heading.length).toEqual(1);
      expect(heading.text().trim()).toEqual(context.orgAddressHeading);
      expect(line1.length).toEqual(1);
      expect(line1.text().trim()).toEqual(context.address.line1);
      expect(line2.length).toEqual(1);
      expect(line2.text().trim()).toEqual(context.address.line2);
      expect(line3.length).toEqual(1);
      expect(line3.text().trim()).toEqual(context.address.line3);
      expect(line4.length).toEqual(1);
      expect(line4.text().trim()).toBeFalsy();
      expect(line5.length).toEqual(1);
      expect(line5.text().trim()).toEqual(context.address.line5);
      expect(town.length).toEqual(1);
      expect(town.text().trim()).toEqual(context.address.town);
      expect(county.length).toEqual(1);
      expect(county.text().trim()).toEqual(context.address.county);
      expect(postcode.length).toEqual(1);
      expect(postcode.text().trim()).toEqual(context.address.postcode);
      expect(country.length).toEqual(1);
      expect(country.text().trim()).toEqual(context.address.country);
    });
  }));

  it('should render hidden inputs for organisation details', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const nameFormElement = $('input[name=name]');
      const odsCodeformElement = $('input[name=odsCode]');
      const line1FormElement = $('input[name=line1]');
      const line2FormElement = $('input[name=line2]');
      const line3FormElement = $('input[name=line3]');
      const line4FormElement = $('input[name=line4]');
      const line5FormElement = $('input[name=line5]');
      const townFormElement = $('input[name=town]');
      const countyFormElement = $('input[name=county]');
      const postcodeFormElement = $('input[name=postcode]');
      const countryFormElement = $('input[name=country]');

      expect(nameFormElement.length).toEqual(1);
      expect(nameFormElement.attr('type')).toEqual('hidden');
      expect(nameFormElement.attr('value')).toEqual(context.name);

      expect(odsCodeformElement.length).toEqual(1);
      expect(odsCodeformElement.attr('type')).toEqual('hidden');
      expect(odsCodeformElement.attr('value')).toEqual(context.odsCode);

      expect(line1FormElement.length).toEqual(1);
      expect(line1FormElement.attr('type')).toEqual('hidden');
      expect(line1FormElement.attr('value')).toEqual(context.address.line1);

      expect(line2FormElement.length).toEqual(1);
      expect(line2FormElement.attr('type')).toEqual('hidden');
      expect(line2FormElement.attr('value')).toEqual(context.address.line2);

      expect(line3FormElement.length).toEqual(1);
      expect(line3FormElement.attr('type')).toEqual('hidden');
      expect(line3FormElement.attr('value')).toEqual(context.address.line3);

      expect(line4FormElement.length).toEqual(1);
      expect(line4FormElement.attr('type')).toEqual('hidden');
      expect(line4FormElement.attr('value')).toEqual('');

      expect(line5FormElement.length).toEqual(1);
      expect(line5FormElement.attr('type')).toEqual('hidden');
      expect(line5FormElement.attr('value')).toEqual(context.address.line5);

      expect(townFormElement.length).toEqual(1);
      expect(townFormElement.attr('type')).toEqual('hidden');
      expect(townFormElement.attr('value')).toEqual(context.address.town);

      expect(countyFormElement.length).toEqual(1);
      expect(countyFormElement.attr('type')).toEqual('hidden');
      expect(countyFormElement.attr('value')).toEqual(context.address.county);

      expect(postcodeFormElement.length).toEqual(1);
      expect(postcodeFormElement.attr('type')).toEqual('hidden');
      expect(postcodeFormElement.attr('value')).toEqual(context.address.postcode);

      expect(countryFormElement.length).toEqual(1);
      expect(countryFormElement.attr('type')).toEqual('hidden');
      expect(countryFormElement.attr('value')).toEqual(context.address.country);
    });
  }));

  describe('form fields', () => {
    it('should render hidden input with csrf token', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const formElement = $('input[name=_csrf]');
        expect(formElement.length).toEqual(1);
        expect(formElement.attr('type')).toEqual('hidden');
        expect(formElement.attr('value')).toEqual(context.csrfToken);
      });
    }));

    it('should render a label for each question', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const labels = $('label');
        expect(labels.length).toEqual(context.questions.length);
        context.questions.forEach((question, i) => {
          expect(labels[i].attribs.for).toEqual(question.id);
          expect(labels[i].children[0].data.trim()).toEqual(question.mainAdvice);
        });
      });
    }));

    it('should render a textField for each question', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const inputs = $('[data-test-id="primary-contact-fields"] input:not([name=_csrf])');
        expect(inputs.length).toEqual(context.questions.length);
        context.questions.forEach((question, i) => {
          expect(inputs[i].attribs.id).toEqual(question.id);
          expect(inputs[i].attribs.name).toEqual(question.id);
          expect(inputs[i].attribs.type).toEqual('text');
        });
      });
    }));

    it('should render footerAdvice for each question', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const form = $('form');
        context.questions.forEach(async (question) => {
          const footerText = await form.find(`div[data-test-id="question-${question.id}"] span`);
          expect(footerText.text().trim()).toEqual(question.footerAdvice);
        });
      });
    }));

    it('should render error field if there are errors', componentTester(setup, (harness) => {
      harness.request(contextWithErrors, async ($) => {
        const form = $('form');
        await context.questions.forEach(async (question) => {
          const renderedQuestion = await form.find(`div[data-test-id="question-${question.id}"]`);
          const fieldError = await renderedQuestion.find('div[data-test-id="text-field-input-error"]');
          const errorMessage = await renderedQuestion.find('.nhsuk-error-message');
          expect(fieldError.length).toEqual(1);
          expect(errorMessage.text().trim()).toEqual('Error:');
        });
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
