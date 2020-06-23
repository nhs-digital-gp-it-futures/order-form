import { componentTester } from '../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/preview/template.njk',
  },
};

describe('preview page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-1',
      backLinkText: 'Go back',
      backLinkHref: '/organisation/order-1',
    };

    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1');
    });
  }));

  it('should render the preview page title', componentTester(setup, (harness) => {
    const context = {
      title: 'Order summary for order-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="preview-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the preview page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('h2[data-test-id="preview-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the order description', componentTester(setup, (harness) => {
    const context = {
      orderDescriptionHeading: manifest.orderDescriptionHeading,
      orderDescription: 'some-order-description',
    };

    harness.request(context, ($) => {
      const orderDescriptionHeading = $('h3[data-test-id="order-description-heading"]');
      const orderDescription = $('h4[data-test-id="order-description"]');

      expect(orderDescriptionHeading.length).toEqual(1);
      expect(orderDescriptionHeading.text().trim()).toContain(context.orderDescriptionHeading);
      expect(orderDescription.length).toEqual(1);
      expect(orderDescription.text().trim()).toContain(context.orderDescription);
    });
  }));

  it('should render the order summary created date', componentTester(setup, (harness) => {
    const context = {
      dateSummaryCreatedLabel: manifest.dateSummaryCreatedLabel,
      dateSummaryCreated: '19 June 2020',
    };

    harness.request(context, ($) => {
      const dateSummaryCreated = $('[data-test-id="date-summary-created"]');

      expect(dateSummaryCreated.length).toEqual(1);
      expect(dateSummaryCreated.text().trim()).toContain(`${context.dateSummaryCreatedLabel} ${context.dateSummaryCreated}`);
    });
  }));
});
