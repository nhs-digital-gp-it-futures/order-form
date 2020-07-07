import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl as bapiUrl, orderApiUrl } from '../../../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/additional-services/select/additional-service';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mockAdditionalServices = [
  {
    additionalServiceId: 'additional-service-1',
    name: 'Additional Service 1',
  },
  {
    id: 'additional-service-2',
    name: 'Additional Service 1',
  },
];

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/catalogue-solutions')
    .reply(200,
      {
        catalogueSolutions: [
          {
            catalogueItemId: '1',
            catalogueItemName: 'some catalogue solution name',
          },
        ],
      });

  nock(bapiUrl)
    .get('/api/v1/additional-services?solutionIds=1')
    .reply(200, { additionalServices: mockAdditionalServices });
};

const pageSetup = async (
  withAuth = true) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('additional-services - additional-service page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup(false);
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render additional-services select page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="additional-service-select-page"]');

  await t
    .expect(page.exists).ok();
});

test('should render back link', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .expect(await extractInnerText(goBackLink)).eql(content.backLinkText);
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="additional-service-select-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="additional-service-select-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the Continue button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});
