import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../test-utils/uiTestHelper';
import { orderApiUrl, organisationApiUrl } from '../../../../../../config';
import mockOrgData from '../../../../../../test-utils/mockData/mockOrganisationData.json';

const pageUrl = 'http://localhost:1234/order/organisation/odsCode/order/order-id/associated-services/delete/order-item-id/confirmation/write-on-time-associated-service/';

const orderDescriptionMock = 'desc';

const mocks = ({ postRoute = false }) => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/description')
    .reply(200, { description: orderDescriptionMock });
  nock(organisationApiUrl)
    .get('/api/v1/ods/odsCode')
    .reply(200, mockOrgData);

  if (postRoute) {
    nock(orderApiUrl)
      .delete('/api/v1/orders/order-id/order-items/order-item-id')
      .reply(204);
  }
};

const defaultPageSetup = { withAuth: true, getRoute: true, postRoute: false };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks({ postRoute: setup.postRoute });
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('delete-associated-service page - general')
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

test('should render associated-service select page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="delete-catalogue-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /order/organisation/odsCode/order/order-id/associated-services for backLink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(await extractInnerText(goBackLink)).eql(content.backLinkText)
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/odsCode/order/order-id/associated-services/order-item-id');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="delete-catalogue-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql('Delete write-on-time-associated-service from order-id?');
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('p[data-test-id="delete-catalogue-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the order description title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderDescriptionTitle = Selector('h2[data-test-id="catalogue-description-title"]');

  await t
    .expect(await extractInnerText(orderDescriptionTitle)).eql(content.orderDescriptionTitle);
});

test('should render the order description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderDescription = Selector('p[data-test-id="catalogue-description"]');

  await t
    .expect(await extractInnerText(orderDescription)).eql(orderDescriptionMock);
});

test('should render the go back link', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const link = Selector('div[data-test-id="go-back-link"] a');

  await t
    .expect(await extractInnerText(link)).eql(content.backLinkText)
    .expect(link.getAttribute('href')).eql('/order/organisation/odsCode/order/order-id/associated-services/order-item-id');
});

test('should render the cancel link', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const link = Selector('div[data-test-id="cancel-link"] a');

  await t
    .expect(await extractInnerText(link)).eql(content.noButton.text)
    .expect(link.getAttribute('href')).eql('/order/organisation/odsCode/order/order-id/associated-services/order-item-id');
});

test('should render the Confirm button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('div[data-test-id="yes-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.yesButton.text);
});

test('should redirect to /organisation/odsCode/order/order-id/associated-services/delete/order-item-id/confirmation/write-on-time-associated-service/continue when Confirm is clicked', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const button = Selector('div[data-test-id="yes-button"] button');

  await t
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/odsCode/order/order-id/associated-services/delete/order-item-id/confirmation/write-on-time-associated-service/continue');
});
