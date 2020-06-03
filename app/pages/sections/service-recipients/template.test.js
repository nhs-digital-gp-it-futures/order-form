import { componentTester } from '../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/service-recipients/template.njk',
  },
};

const context = {
  ...manifest,
  title: 'Service Recipients for order-id',
  backLinkHref: '/organisation/order-1',
};

describe('service-recipients page', () => {
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
      const title = $('h1[data-test-id="service-recipients-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the page description', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const description = $('h2[data-test-id="service-recipients-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the supplier page inset advice', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const insetAdvice = $('[data-test-id="service-recipients-page-insetAdvice"]');
      expect(insetAdvice.length).toEqual(1);
      expect(insetAdvice.text().trim()).toContain(context.insetAdvice);
    });
  }));

  it('should render the organisation heading', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const heading = $('[data-test-id="organisation-heading"]');
      expect(heading.length).toEqual(1);
      expect(heading.text().trim()).toEqual(context.organisationHeading);
    });
  }));

  it('should render the ods code heading', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const heading = $('[data-test-id="ods-code-heading"]');
      expect(heading.length).toEqual(1);
      expect(heading.text().trim()).toEqual(context.odsCodeHeading);
    });
  }));

  it('should render the select-deselect button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="select-deselect-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.selectDeselectButton.selectText);
    });
  }));

  it('should render the continue button', componentTester(setup, (harness) => {
    harness.request(context, ($) => {
      const button = $('[data-test-id="continue-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.continueButtonText);
    });
  }));
});
