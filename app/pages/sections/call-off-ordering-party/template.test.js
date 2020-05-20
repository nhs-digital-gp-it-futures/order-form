import { componentTester } from '../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/call-off-ordering-party/template.njk',
  },
};

const context = {
  ...manifest,
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
      expect(heading.length).toEqual(1);
      expect(heading.text().trim()).toEqual(context.orgNameHeading);
    });
  }));

  it('should render organisation ods code', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const heading = $('h3[data-test-id="organisation-ods-code-heading"]');
      expect(heading.length).toEqual(1);
      expect(heading.text().trim()).toEqual(context.odsCodeHeading);
    });
  }));

  it('should render organisation address', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const heading = $('h3[data-test-id="organisation-address-heading"]');
      expect(heading.length).toEqual(1);
      expect(heading.text().trim()).toEqual(context.orgAddressHeading);
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
