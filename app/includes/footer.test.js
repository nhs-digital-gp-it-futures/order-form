import { componentTester } from '../test-utils/componentTester';

const setup = {
  template: {
    path: 'includes/footer.njk',
  },
};

const footerLinks = [
  {
    label: 'Buyer\'s Guide',
    URL: '/guide',
  },
  {
    label: 'NHS Digital Helpdesk',
    URL: '/guide#contact-us',
  },
  {
    label: 'NHS Digital',
    URL: 'https://digital.nhs.uk/',
  },
  {
    label: 'About GP IT Futures',
    URL: 'https://digital.nhs.uk/services/future-gp-it-systems-and-services',
  },
  {
    label: 'Capabilities & Standards Model',
    URL: 'https://gpitbjss.atlassian.net/wiki/spaces/GPITF/overview',
  },
  {
    label: 'Terms & Conditions',
    URL: '/document/terms-of-use.pdf',
  },
];

describe('footer', () => {
  it('should render the footer panel', componentTester(setup, (harness) => {
    const context = { footerLinks };

    harness.request(context, ($) => {
      const footer = $('[data-test-id="footer"]');
      const footerComponent = footer.find('[data-test-id="footer-component"]');

      expect(footer.length).toEqual(1);
      expect(footerComponent.length).toEqual(1);

      footerLinks.map((link, i) => {
        expect(footerComponent.find(`li:nth-child(${i + 1})`).text().trim()).toEqual(link.label);
      });
    });
  }));

  it('should render the footer legal panel', componentTester(setup, (harness) => {
    const context = { showLegalPane: false };

    harness.request(context, ($) => {
      const footer = $('[data-test-id="footer"]');
      const legalPanel = footer.find('[data-test-id="legal-panel"]');
      expect(footer.length).toEqual(1);
      expect(legalPanel.length).toEqual(1);
      expect(legalPanel.find('span:nth-child(1)').text().trim()).toEqual('Legal');
      expect(legalPanel.find('span:nth-child(2)').text().trim()).toEqual('Privacy and Cookies');
      expect(legalPanel.find('span:nth-child(2) > a').attr('href')).toEqual('https://digital.nhs.uk/about-nhs-digital/privacy-and-cookies');
    });
  }));
});
