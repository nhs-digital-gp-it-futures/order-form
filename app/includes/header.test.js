import { createTestHarness } from '../test-utils/testHarness';

const setup = {
  template: {
    path: 'includes/header.njk',
  },
};

describe('header', () => {
  it('should render the header banner', createTestHarness(setup, (harness) => {
    const context = {};

    harness.request(context, ($) => {
      const headerBanner = $('header[data-test-id="header-banner"]');
      expect(headerBanner.length).toEqual(1);
    });
  }));

  describe('login/logout component', () => {
    describe('when username is provided', () => {
      it('should render username', createTestHarness(setup, (harness) => {
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

      it('should render logout link', createTestHarness(setup, (harness) => {
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

    describe('when username is not provided', () => {
      it('should render login link', createTestHarness(setup, (harness) => {
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
