import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../test-utils/uiTestHelper';
import { orderApiUrl, organisationApiUrl } from '../../../../../../../config';
import mockOrgData from '../../../../../../../test-utils/mockData/mockOrganisationData.json';

const pageUrl = 'http://localhost:1234/order/organisation/odsCode/order/order-id/additional-services/delete/order-item-id/confirmation/write-on-time-additional-service/continue';

const orderDescriptionMock = 'desc';

const mocks = () => {
  nock(organisationApiUrl)
    .get('/api/v1/ods/odsCode')
    .times(2)
    .reply(200, mockOrgData);
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/description')
    .reply(200, { description: orderDescriptionMock });
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

fixture('delete-additional-service-confirmation page - general')
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

test('should render delete-catalogue-confirmation page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="delete-catalogue-confirmation-page"]');

  await t
    .expect(page.exists).ok();
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="delete-catalogue-confirmation-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql('write-on-time-additional-service deleted from order-id');
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('p[data-test-id="delete-catalogue-confirmation-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the Continue button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const button = Selector('[data-test-id="continue-button"] button');
  await t
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

test('should redirect to /organisation/03F/order/order-id/additional-services when Continue is clicked', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);
  const button = Selector('[data-test-id="continue-button"] button');
  await t
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/odsCode/order/order-id/additional-services');
});
