import { componentTester } from '../../test-utils/componentTester';
import manifest from './neworder/manifest.json';

const setup = {
  template: {
    path: 'pages/order-task-list/template.njk',
  },
};

describe('neworder task-list page', () => {
  const neworderPageContext = {
    ...manifest,
    pageName: 'neworder',
    backLinkHref: '/organisation',
  };

  it('should render a backLink', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation');
    });
  }));

  it('should render the neworder task-list page', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const neworderPage = $('[data-test-id="neworder-page"]');
      expect(neworderPage.length).toEqual(1);
    });
  }));

  it('should render the neworder task-list title', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const neworderPageTitle = $('[data-test-id="neworder-page-title"]');
      expect(neworderPageTitle.length).toEqual(1);
      expect(neworderPageTitle.text().trim()).toEqual(neworderPageContext.title);
    });
  }));

  it('should render the neworder task-list description', componentTester(setup, (harness) => {
    harness.request(neworderPageContext, ($) => {
      const neworderPageDescription = $('[data-test-id="neworder-page-description"]');
      expect(neworderPageDescription.length).toEqual(1);
      expect(neworderPageDescription.text().trim()).toEqual(neworderPageContext.description);
    });
  }));
});
