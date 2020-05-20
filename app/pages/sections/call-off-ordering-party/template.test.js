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
  backlinkHref: '/organisation/order-1',
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

  it('should render the save button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="save-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.saveButtonText);
    });
  }));
});
// const mockOrderingPartyData = {
//   name: 'Hampshire CC',
//   odsCode: 'AB3',
//   address: {
//     line1: 'line 1',
//     line2: 'line 2',
//     line3: 'line 3',
//     line4: null,
//     line5: 'line 5',
//     town: 'townville',
//     county: 'countyshire',
//     postcode: 'HA3 PSH',
//     country: 'UK',
//   },
// };

// const mockOrgData = {
//   organisationId: 'b7ee5261-43e7-4589-907b-5eef5e98c085',
//   name: 'Cheshire and Merseyside Commissioning Hub',
//   odsCode: 'AB2',
//   primaryRoleId: 'RO98',
//   address: {
//     line1: 'C/O NHS ENGLAND, 1W09, 1ST FLOOR',
//     line2: 'QUARRY HOUSE',
//     line3: 'QUARRY HILL',
//     line4: null,
//     town: 'LEEDS',
//     county: 'WEST YORKSHIRE',
//     postcode: 'LS2 7UE',
//     country: 'ENGLAND',
//   },
//   catalogueAgreementSigned: false,
// };