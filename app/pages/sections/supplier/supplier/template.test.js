import { componentTester } from '../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/supplier/supplier/template.njk',
  },
};

describe('supplier page via select', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-1',
      backLinkText: 'Go back',
      backLinkHref: '/organisation/order-1/search/select',
    };

    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1/search/select');
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
      const description = $('h2[data-test-id="supplier-page-description"]');
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
      supplierData: {
        name: 'SupplierOne',
      },
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
      supplierData: {
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
      },
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

  it('should render hidden input with csrf token', componentTester(setup, (harness) => {
    const context = {
      csrfToken: 'mockCsrfToken',
    };

    harness.request(context, ($) => {
      const formElement = $('input[name=_csrf]');
      expect(formElement.length).toEqual(1);
      expect(formElement.attr('type')).toEqual('hidden');
      expect(formElement.attr('value')).toEqual(context.csrfToken);
    });
  }));

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
