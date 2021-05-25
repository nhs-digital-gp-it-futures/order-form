import { componentTester } from '../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/supplier/supplier/template.njk',
  },
};

const supplierData = {
  supplierId: 'supp-1',
  name: 'SupplierOne',
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

describe('supplier page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-1',
      backLinkText: 'Go back',
      backLinkHref: '/organisation/odsCode/order/order-1/search/select',
    };

    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect(backLink.find('a').attr('href')).toEqual(context.backLinkHref);
    });
  }));

  it('should render error summary with correct error text and hrefs if there are errors', componentTester(setup, (harness) => {
    const context = {
      errors: [
        { text: 'First name must be 100 characters or fewer', href: '#firstName' },
        { text: 'Last name must be 100 characters or fewer', href: '#lastName' },
        { text: 'Email address must be 256 characters or fewer', href: '#emailAddress' },
        { text: 'Telephone number must be 35 characters or fewer', href: '#telephoneNumber' },
      ],
    };

    harness.request(context, ($) => {
      const errorSummary = $('[data-test-id="error-summary"]');
      const errorArray = $('[data-test-id="error-summary"] li a');
      expect(errorSummary.length).toEqual(1);
      expect(errorArray.length).toEqual(context.errors.length);
      context.errors.forEach((error, i) => {
        expect(errorArray[i].attribs.href).toEqual(error.href);
        expect(errorArray[i].children[0].data.trim()).toEqual(error.text);
      });
    });
  }));

  it('should render the supplier page title', componentTester(setup, (harness) => {
    const context = {
      title: 'Supplier information for order-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="supplier-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the supplier page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('[data-test-id="supplier-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the supplier page inset advice', componentTester(setup, (harness) => {
    const context = {
      insetAdvice: manifest.insetAdvice,
    };

    harness.request(context, ($) => {
      const insetAdvice = $('[data-test-id="supplier-page-insetAdvice"]');
      expect(insetAdvice.length).toEqual(1);
      expect(insetAdvice.text().trim()).toContain(context.insetAdvice);
    });
  }));

  it('should render supplier name', componentTester(setup, (harness) => {
    const context = {
      supplierNameHeading: manifest.supplierNameHeading,
      supplierData,
    };

    harness.request(context, ($) => {
      const heading = $('h3[data-test-id="supplier-name-heading"]');
      const text = $('div[data-test-id="supplier-name"]');
      expect(heading.length).toEqual(1);
      expect(heading.text().trim()).toEqual(context.supplierNameHeading);
      expect(text.length).toEqual(1);
      expect(text.text().trim()).toEqual(context.supplierData.name);
    });
  }));

  it('should render supplier address', componentTester(setup, (harness) => {
    const context = {
      supplierAddressHeading: manifest.supplierAddressHeading,
      supplierData,
    };

    harness.request(context, ($) => {
      const heading = $('h3[data-test-id="supplier-address-heading"]');
      const line1 = $('div[data-test-id="supplier-address-1"]');
      const line2 = $('div[data-test-id="supplier-address-2"]');
      const line3 = $('div[data-test-id="supplier-address-3"]');
      const line4 = $('div[data-test-id="supplier-address-4"]');
      const line5 = $('div[data-test-id="supplier-address-5"]');
      const town = $('div[data-test-id="supplier-address-town"]');
      const county = $('div[data-test-id="supplier-address-county"]');
      const postcode = $('div[data-test-id="supplier-address-postcode"]');
      const country = $('div[data-test-id="supplier-address-country"]');

      expect(heading.length).toEqual(1);
      expect(heading.text().trim()).toEqual(context.supplierAddressHeading);
      expect(line1.length).toEqual(1);
      expect(line1.text().trim()).toEqual(context.supplierData.address.line1);
      expect(line2.length).toEqual(1);
      expect(line2.text().trim()).toEqual(context.supplierData.address.line2);
      expect(line3.length).toEqual(1);
      expect(line3.text().trim()).toEqual(context.supplierData.address.line3);
      expect(line4.length).toEqual(1);
      expect(line4.text().trim()).toBeFalsy();
      expect(line5.length).toEqual(1);
      expect(line5.text().trim()).toEqual(context.supplierData.address.line5);
      expect(town.length).toEqual(1);
      expect(town.text().trim()).toEqual(context.supplierData.address.town);
      expect(county.length).toEqual(1);
      expect(county.text().trim()).toEqual(context.supplierData.address.county);
      expect(postcode.length).toEqual(1);
      expect(postcode.text().trim()).toEqual(context.supplierData.address.postcode);
      expect(country.length).toEqual(1);
      expect(country.text().trim()).toEqual(context.supplierData.address.country);
    });
  }));

  it('should render hidden inputs for supplier details', componentTester(setup, (harness) => {
    const context = {
      supplierAddressHeading: manifest.supplierAddressHeading,
      supplierData,
    };

    harness.request(context, ($) => {
      const supplierIdFormElement = $('input[name=supplierId]');
      const nameFormElement = $('input[name=name]');
      const line1FormElement = $('input[name=line1]');
      const line2FormElement = $('input[name=line2]');
      const line3FormElement = $('input[name=line3]');
      const line4FormElement = $('input[name=line4]');
      const line5FormElement = $('input[name=line5]');
      const townFormElement = $('input[name=town]');
      const countyFormElement = $('input[name=county]');
      const postcodeFormElement = $('input[name=postcode]');
      const countryFormElement = $('input[name=country]');

      expect(supplierIdFormElement.length).toEqual(1);
      expect(supplierIdFormElement.attr('type')).toEqual('hidden');
      expect(supplierIdFormElement.attr('value')).toEqual(context.supplierData.supplierId);

      expect(nameFormElement.length).toEqual(1);
      expect(nameFormElement.attr('type')).toEqual('hidden');
      expect(nameFormElement.attr('value')).toEqual(context.supplierData.name);

      expect(line1FormElement.length).toEqual(1);
      expect(line1FormElement.attr('type')).toEqual('hidden');
      expect(line1FormElement.attr('value')).toEqual(context.supplierData.address.line1);

      expect(line2FormElement.length).toEqual(1);
      expect(line2FormElement.attr('type')).toEqual('hidden');
      expect(line2FormElement.attr('value')).toEqual(context.supplierData.address.line2);

      expect(line3FormElement.length).toEqual(1);
      expect(line3FormElement.attr('type')).toEqual('hidden');
      expect(line3FormElement.attr('value')).toEqual(context.supplierData.address.line3);

      expect(line4FormElement.length).toEqual(1);
      expect(line4FormElement.attr('type')).toEqual('hidden');
      expect(line4FormElement.attr('value')).toEqual('');

      expect(line5FormElement.length).toEqual(1);
      expect(line5FormElement.attr('type')).toEqual('hidden');
      expect(line5FormElement.attr('value')).toEqual(context.supplierData.address.line5);

      expect(townFormElement.length).toEqual(1);
      expect(townFormElement.attr('type')).toEqual('hidden');
      expect(townFormElement.attr('value')).toEqual(context.supplierData.address.town);

      expect(countyFormElement.length).toEqual(1);
      expect(countyFormElement.attr('type')).toEqual('hidden');
      expect(countyFormElement.attr('value')).toEqual(context.supplierData.address.county);

      expect(postcodeFormElement.length).toEqual(1);
      expect(postcodeFormElement.attr('type')).toEqual('hidden');
      expect(postcodeFormElement.attr('value')).toEqual(context.supplierData.address.postcode);

      expect(countryFormElement.length).toEqual(1);
      expect(countryFormElement.attr('type')).toEqual('hidden');
      expect(countryFormElement.attr('value')).toEqual(context.supplierData.address.country);
    });
  }));

  it('should render the "Search again" link if showSearchAgainLink is true', componentTester(setup, (harness) => {
    const context = {
      searchAgainLinkText: manifest.searchAgainLinkText,
      searchAgainLinkHref: '/organisation/odsCode/order/order-1/search',
      showSearchAgainLink: true,
    };

    harness.request(context, ($) => {
      const searchAgainLink = $('[data-test-id="search-again-link"]');
      expect(searchAgainLink.length).toEqual(1);
      expect(searchAgainLink.text().trim()).toEqual(context.searchAgainLinkText);
      expect(searchAgainLink.find('a').attr('href')).toEqual(context.searchAgainLinkHref);
    });
  }));

  it('should not render the "Search again" link if showSearchAgainLink is false', componentTester(setup, (harness) => {
    const context = {
      searchAgainLinkText: manifest.searchAgainLinkText,
      searchAgainLinkHref: '/organisation/odsCode/order/order-1/search',
      showSearchAgainLink: false,
    };

    harness.request(context, ($) => {
      const searchAgainLink = $('[data-test-id="search-again-link"]');
      expect(searchAgainLink.length).toEqual(0);
    });
  }));

  describe('form fields', () => {
    const context = {
      csrfToken: 'mockCsrfToken',
      primaryContactHeading: manifest.primaryContactHeading,
      questions: manifest.questions,
    };

    it('should render hidden input with csrf token', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const formElement = $('input[name=_csrf]');
        expect(formElement.length).toEqual(1);
        expect(formElement.attr('type')).toEqual('hidden');
        expect(formElement.attr('value')).toEqual(context.csrfToken);
      });
    }));

    it('should render primary contact heading', componentTester(setup, (harness) => {
      harness.request(context, ($) => {
        const heading = $('h2[data-test-id="primary-contact-heading"]');
        expect(heading.length).toEqual(1);
        expect(heading.text().trim()).toEqual(context.primaryContactHeading);
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
      const contextWithErrors = {
        questions: [{
          id: 'firstName',
          error: [{ message: 'First name must be 100 characters or fewer' }],
        }, {
          id: 'lastName',
          error: [{ message: 'Last name must be 100 characters or fewer' }],
        }, {
          id: 'emailAddress',
          error: [{ message: 'Email address must be 256 characters or fewer' }],
        }, {
          id: 'telephoneNumber',
          error: [{ message: 'Telephone number must be 35 characters or fewer' }],
        }],
      };

      harness.request(contextWithErrors, async ($) => {
        const form = $('form');
        await contextWithErrors.questions.forEach(async (question) => {
          const renderedQuestion = await form.find(`div[data-test-id="question-${question.id}"]`);
          const fieldError = await renderedQuestion.find('div[data-test-id="text-field-input-error"]');
          const errorMessage = await renderedQuestion.find('.nhsuk-error-message');
          expect(fieldError.length).toEqual(1);
          expect(errorMessage.text().trim()).toEqual('Error:');
        });
      });
    }));
  });

  it('should render the "Save and return" button', componentTester(setup, (harness) => {
    const context = {
      saveButtonText: 'Save and return',
    };

    harness.request(context, ($) => {
      const button = $('[data-test-id="save-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.saveButtonText);
    });
  }));
});
