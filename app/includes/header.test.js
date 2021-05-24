import { componentTester } from '../test-utils/componentTester';
import { publicBrowseBaseUrl } from '../config';

const setup = {
  template: {
    path: 'includes/header.njk',
  },
};

describe('header', () => {
  it('should render the beta banner', componentTester(setup, (harness) => {
    const context = {};

    harness.request(context, ($) => {
      const betaBanner = $('[data-test-id="beta-banner"]');
      expect(betaBanner.length).toEqual(1);
    });
  }));

  it('should render the header banner', componentTester(setup, (harness) => {
    const context = {};

    harness.request(context, ($) => {
      const headerBanner = $('header[data-test-id="header-banner"]');
      expect(headerBanner.length).toEqual(1);
    });
  }));

  it('should render logo with correct href and aria-label', componentTester(setup, (harness) => {
    const context = {};

    harness.request(context, ($) => {
      const logoLink = $('header[data-test-id="header-banner"] .nhsuk-header__logo a');
      expect(logoLink.length).toEqual(1);
      expect(logoLink.attr('href')).toEqual(publicBrowseBaseUrl);
      expect(logoLink.attr('aria-label')).toEqual('Buying Catalogue Homepage');
    });
  }));

  describe('cookie banner', () => {
    it('should render the cookie banner if showCookieBanner is true', componentTester(setup, (harness) => {
      const context = {
        showCookieBanner: true,
      };

      harness.request(context, ($) => {
        const banner = $('[data-test-id="cookie-banner"]');
        expect(banner.length).toEqual(1);
      });
    }));

    it('should not render the cookie banner if showCookieBanner is false', componentTester(setup, (harness) => {
      const context = {
        showCookieBanner: false,
      };

      harness.request(context, ($) => {
        const banner = $('[data-test-id="cookie-banner"]');
        expect(banner.length).toEqual(0);
      });
    }));
  });

  describe('login/logout component', () => {
    describe('when username is provided', () => {
      it('should render username', componentTester(setup, (harness) => {
        const context = {
          username: 'user 1',
        };
        harness.request(context, ($) => {
          const headerBanner = $('header[data-test-id="header-banner"]');
          const loginLogout = headerBanner.find('[data-test-id="login-logout-component"]');
          const loginLogoutText = loginLogout.find('span').text().trim().split(/\s\s+/);
          expect(loginLogoutText[0]).toEqual(`Logged in as: ${context.username}`);
        });
      }));

      it('should render logout link', componentTester(setup, (harness) => {
        const context = {
          config: {
            baseUrl: '',
          },
          username: 'user 1',
        };
        harness.request(context, ($) => {
          const headerBanner = $('header[data-test-id="header-banner"]');
          const logoutLink = headerBanner.find('[data-test-id="login-logout-component"] a');
          expect(logoutLink.text().trim()).toEqual('Log out');
          expect(logoutLink.attr('href')).toEqual('/logout');
        });
      }));
    });

    describe('when username and organisation are provided', () => {
      it('should render username and organisation', componentTester(setup, (harness) => {
        const context = {
          username: 'user 1',
          organisation: 'nhs',
        };
        harness.request(context, ($) => {
          const headerBanner = $('header[data-test-id="header-banner"]');
          const loginLogout = headerBanner.find('[data-test-id="login-logout-component"]');
          const loginLogoutText = loginLogout.find('span').text().trim().split(/\s\s+/);
          expect(loginLogoutText[0]).toEqual(`Logged in as: ${context.username} for ${context.organisation}`);
        });
      }));

      it('should render logout link', componentTester(setup, (harness) => {
        const context = {
          config: {
            baseUrl: '',
          },
          username: 'user 1',
          organisation: 'nhs',
        };
        harness.request(context, ($) => {
          const headerBanner = $('header[data-test-id="header-banner"]');
          const logoutLink = headerBanner.find('[data-test-id="login-logout-component"] a');
          expect(logoutLink.text().trim()).toEqual('Log out');
          expect(logoutLink.attr('href')).toEqual('/logout');
        });
      }));
    });

    describe('when username is not provided', () => {
      it('should render login link', componentTester(setup, (harness) => {
        const context = {
          config: {
            baseUrl: '',
          },
        };
        harness.request(context, ($) => {
          const headerBanner = $('header[data-test-id="header-banner"]');
          const loginLink = headerBanner.find('[data-test-id="login-logout-component"] a');
          expect(loginLink.text().trim()).toEqual('Log in');
          expect(loginLink.attr('href')).toEqual('/login');
        });
      }));
    });
  });
});
