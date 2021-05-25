import { componentTester } from '../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'includes/footer.njk',
  },
};

describe('footer', () => {
  it('should render the footer panel', componentTester(setup, (harness) => {
    harness.request(manifest, ($) => {
      const footer = $('#nhsuk-footer ul');

      expect(footer.length).toEqual(1);

      manifest.footerLinks.map((link, i) => {
        expect(footer.find(`li:nth-child(${i + 1})`).text().trim()).toEqual(link.label);
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
      expect(legalPanel.find('li:nth-child(1)').text().trim()).toEqual('Legal');
      expect(legalPanel.find('li:nth-child(2)').text().trim()).toEqual('Privacy policy and cookies');
      expect(legalPanel.find('li:nth-child(2) > a').attr('href')).toEqual('/privacy-policy');
    });
  }));
});
