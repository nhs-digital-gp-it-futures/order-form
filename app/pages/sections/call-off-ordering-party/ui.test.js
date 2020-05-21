import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from './manifest.json';
import { orderApiUrl } from '../../../config';

const pageUrl = 'http://localhost:1234/organisation/order-id/call-off-ordering-party';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mockData = {
  name: 'Hampshire CC',
  odsCode: 'AB3',
  address: {
    line1: 'line 1',
    line2: 'line 2',
    line3: 'line 3',
    line4: null,
    line5: 'line 5',
    town: 'townville',
    county: 'countyshire',
    postcode: 'HA3 PSH',
    country: 'UK',
  },
};

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/ordering-party')
    .reply(200, mockData);
};

const pageSetup = async (t, withAuth = false) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Call-off-ordering-party page')
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

test('should render call-off-ordering-party page', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="call-off-ordering-party-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-id when click on backlink', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id');
});

test('should render the title', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="call-off-ordering-party-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql('Call-off Ordering Party information for order-id');
});

test('should render the description', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="call-off-ordering-party-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render organisation name', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const heading = Selector('h3[data-test-id="organisation-name-heading"]');
  const text = Selector('div[data-test-id="organisation-name"]');

  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.orgNameHeading)
    .expect(text.exists).ok()
    .expect(await extractInnerText(text)).eql(mockData.name);
});

test('should render organisation ods code', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const heading = Selector('h3[data-test-id="organisation-ods-code-heading"]');
  const text = Selector('div[data-test-id="organisation-ods-code"]');

  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.odsCodeHeading)
    .expect(text.exists).ok()
    .expect(await extractInnerText(text)).eql(mockData.odsCode);
});

test('should render organisation address', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const heading = Selector('h3[data-test-id="organisation-address-heading"]');
  const addressTextLine1 = Selector('[data-test-id="organisation-address-1"]');
  const addressTextLine2 = Selector('[data-test-id="organisation-address-2"]');
  const addressTextLine3 = Selector('[data-test-id="organisation-address-3"]');
  const addressTextLine4 = Selector('[data-test-id="organisation-address-4"]');
  const addressTextLine5 = Selector('[data-test-id="organisation-address-5"]');
  const addressTextTown = Selector('[data-test-id="organisation-address-town"]');
  const addressTextCounty = Selector('[data-test-id="organisation-address-county"]');
  const addressTextPostcode = Selector('[data-test-id="organisation-address-postcode"]');
  const addressTextCountry = Selector('[data-test-id="organisation-address-country"]');


  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.orgAddressHeading)
    .expect(addressTextLine1.exists).ok()
    .expect(await extractInnerText(addressTextLine1)).eql(mockData.address.line1)
    .expect(addressTextLine2.exists).ok()
    .expect(await extractInnerText(addressTextLine2)).eql(mockData.address.line2)
    .expect(addressTextLine3.exists).ok()
    .expect(await extractInnerText(addressTextLine3)).eql(mockData.address.line3)
    .expect(addressTextLine4.exists).ok()
    .expect(await extractInnerText(addressTextLine4)).eql('')
    .expect(addressTextLine5.exists).ok()
    .expect(await extractInnerText(addressTextLine5)).eql(mockData.address.line5)
    .expect(addressTextTown.exists).ok()
    .expect(await extractInnerText(addressTextTown)).eql(mockData.address.town)
    .expect(addressTextCounty.exists).ok()
    .expect(await extractInnerText(addressTextCounty)).eql(mockData.address.county)
    .expect(addressTextPostcode.exists).ok()
    .expect(await extractInnerText(addressTextPostcode)).eql(mockData.address.postcode)
    .expect(addressTextCountry.exists).ok()
    .expect(await extractInnerText(addressTextCountry)).eql(mockData.address.country);
});

test('should render save button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.saveButtonText);
});
