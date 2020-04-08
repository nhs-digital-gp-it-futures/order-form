import nock from 'nock';
import { Selector, ClientFunction } from 'testcafe';
import { extractInnerText } from '../../test-utils/helper';

const pageUrl = 'http://localhost:1234/dashboard';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', organisation: 'view',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mocks = () => {};

const pageSetup = async (t, withAuth = false) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Header')
  .page('http://localhost:1234/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  await pageSetup(t);
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('when user is authenticated - should display the logout link', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const logoutComponent = Selector('[data-test-id="login-logout-component"] a');
  await t
    .expect(await extractInnerText(logoutComponent)).eql('Log out');
});
