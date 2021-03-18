import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/associated-services';

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1/order-items?catalogueItemType=AssociatedService')
    .reply(200, []);

  nock(orderApiUrl)
    .get('/api/v1/orders/order-1/sections/description')
    .reply(200, { description: 'Some order' });
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

fixture('Associated-services - Dashboard page - general')
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

test('should render associated-services page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="associated-services-page"]');

  await t
    .expect(page.exists).ok();
});

test('should render go back link with href /organisation/order-1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-1');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="associated-services-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(`${content.title} order-1`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="associated-services-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the inset advice', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const insetAdvice = Selector('[data-test-id="associated-services-page-insetAdvice"]');

  await t
    .expect(await extractInnerText(insetAdvice)).contains(content.insetAdvice);
});

test('should render the orderDescription', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderDescriptionHeading = Selector('h2[data-test-id="order-description-heading"]');
  const orderDescription = Selector('p[data-test-id="order-description"]');

  await t
    .expect(await extractInnerText(orderDescriptionHeading)).contains(content.orderDescriptionHeading)
    .expect(await extractInnerText(orderDescription)).eql('Some order');
});

test('should render the Add Associated Services button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addOrderItemButton = Selector('[data-test-id="add-orderItem-button"] a');

  await t
    .expect(await extractInnerText(addOrderItemButton)).eql(content.addOrderItemButtonText);
});

test('should navigate to /organisation/order-1/associated-services/select/associated-service when Add Associated Services button is clicked', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const addOrderItemButton = Selector('[data-test-id="add-orderItem-button"] a');

  await t
    .click(addOrderItemButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1/associated-services/select/associated-service');
});

test('should render the Continue button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const continueButton = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(await extractInnerText(continueButton)).eql(content.continueButtonText);
});

test('should redirect to /organisation/order-1 when clicking the Continue button', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-1/sections/associated-services')
    .reply(200);

  await pageSetup();
  await t.navigateTo(pageUrl);

  const continueButton = Selector('[data-test-id="continue-button"] button');

  await t
    .click(continueButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1');
});
