import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/funding-sources';

const pageSetup = async (setup = { withAuth: true }) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Funding sources page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup({ withAuth: false, getRoute: false });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render funding sources page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="funding-sources-page"]');

  await t
    .expect(page.exists).ok();
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="funding-sources-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="funding-sources-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render save button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.saveButtonText);
});
