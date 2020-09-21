import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../withFundingManifest.json';
import { orderApiUrl } from '../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/complete-order';

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/funding-source')
    .reply(200, { onlyGMS: true });
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/description')
    .reply(200, { description: 'Some super cool order description' });
};

const pageSetup = async (setup = { withAuth: true }) => {
  if (setup.withAuth) {
    mocks();
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Complete order page - general - with funding')
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

test('should render complete order page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="complete-order-page"]');

  await t
    .expect(page.exists).ok();
});

test('should render go back link with href /organisation/order-id', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="complete-order-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql('Complete order order-id?');
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="complete-order-page-description"]');

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
    .expect(await extractInnerText(orderDescription)).eql('Some super cool order description');
});

test('should render complete order button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="complete-order-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.completeOrderButtonText);
});

test('should render Continue editing order button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-editing-order-button"] a');

  await t
    .expect(await extractInnerText(button)).eql(content.continueEditingOrderButtonText);
});

test('should navigate back to order when Continue editing order button is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-editing-order-button"] a');

  await t
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id');
});

test('should navigate to task list page when complete is clicked', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/status', { status: 'Complete' })
    .reply(200, {});
  await pageSetup();
  await t.navigateTo(pageUrl);
  const button = Selector('[data-test-id="complete-order-button"] button');
  await t
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/complete-order/order-confirmation');
});
