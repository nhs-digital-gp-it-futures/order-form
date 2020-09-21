import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../withoutFundingManifest.json';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../helpers/routes/sessionHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/complete-order/order-confirmation';

const pageSetup = async (setup = { withAuth: true }) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
    await setState(ClientFunction)(sessionKeys.fundingSource, false);
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Order confirmation page - general - without funding')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup({ withAuth: false });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render order confirmation page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="order-confirmation-page"]');

  await t
    .expect(page.exists).ok();
});

test('should render go back link with href /organisation', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="order-confirmation-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql('Order order-id completed');
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="order-confirmation-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the get order summary button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderSummaryButton = Selector('[data-test-id="order-confirmation-page-orderSummaryButton"]');

  await t
    .expect(await extractInnerText(orderSummaryButton)).eql(content.orderSummaryButtonText);
});

test('should render the get order summary button link with href /order/organisation/order-id/summary?print=true', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderSummaryButton = Selector('[data-test-id="order-confirmation-page-orderSummaryButton"] a');

  await t
    .expect(orderSummaryButton.getAttribute('href')).eql('/order/organisation/order-id/summary?print=true');
});

test('should render the order summary advice', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  await Promise.all(content.orderSummaryAdvice.map(async (advice, idx) => {
    const selectedAdvice = Selector(`div[data-test-id="order-confirmation-page-orderSummaryAdvice"] p:nth-child(${idx + 1})`);
    await t.expect(await extractInnerText(selectedAdvice)).eql(advice);
  }));
});
