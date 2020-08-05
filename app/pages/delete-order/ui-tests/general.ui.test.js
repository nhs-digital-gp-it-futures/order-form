import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/delete-order';

const defaultPageSetup = { withAuth: true };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('delete-order page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup({ ...defaultPageSetup, withAuth: false, getRoute: false });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render delete-order select page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="delete-order-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /order/organisation for backLink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(await extractInnerText(goBackLink)).eql(content.backLinkText)
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="delete-order-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="delete-order-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the order description title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderDescriptionTitle = Selector('h3[data-test-id="order-description-title"]');

  await t
    .expect(await extractInnerText(orderDescriptionTitle)).eql(content.orderDescriptionTitle);
});

test('should render the order description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderDescription = Selector('h4[data-test-id="order-description"]');

  await t
    .expect(await extractInnerText(orderDescription)).eql('orderDesc');
});

test('should render the No button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="no-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.noButtonText);
});

test('should render the Yes button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="yes-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.yesButtonText);
});
