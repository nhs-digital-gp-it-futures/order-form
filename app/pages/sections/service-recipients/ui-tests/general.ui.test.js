import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl, organisationApiUrl } from '../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/service-recipients';


const mocks = () => {
  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id/service-recipients')
    .reply(200, []);
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/service-recipients')
    .reply(200, { serviceRecipients: [] });
};

const pageSetup = async (setup = { withAuth: true, getRoute: true }) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Service-recipients page - general')
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

test('should render service-recipients page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="service-recipients-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /order/organisation/order-id for backLink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="service-recipients-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql('Service Recipients for order-id');
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="service-recipients-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the inset advice', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const insetAdvice = Selector('[data-test-id="service-recipients-page-insetAdvice"]');

  await t
    .expect(await extractInnerText(insetAdvice)).contains(content.insetAdvice);
});

test('should render the "Select/Deselect" button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="select-deselect-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.selectDeselectButtonText.select);
});

test('should render the organisation heading', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const heading = Selector('[data-test-id="column-heading-0"]');

  await t
    .expect(await extractInnerText(heading)).eql(content.serviceRecipientsTable.columnInfo[0].data);
});

test('should render the ods code heading', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const heading = Selector('[data-test-id="column-heading-1"]');

  await t
    .expect(await extractInnerText(heading)).eql(content.serviceRecipientsTable.columnInfo[1].data);
});

test('should render the "Continue" button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});
