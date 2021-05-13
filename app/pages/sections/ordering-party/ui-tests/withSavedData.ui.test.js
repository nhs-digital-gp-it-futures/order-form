import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/odsCode/order/order-id/ordering-party';

const mockDataFromOrdapi = {
  name: 'Org name',
  odsCode: 'AB3',
  address: {
    line1: 'line 1',
    line2: 'line 2',
    line3: 'line 3',
    line4: null,
    line5: 'line 5',
    town: 'townville',
    county: 'countyshire',
    postcode: 'P05 COD',
    country: 'UK',
  },
  primaryContact: {
    firstName: 'first',
    lastName: 'last',
    telephoneNumber: '0777',
    emailAddress: 'first@last.com',
  },
};

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/ordering-party')
    .reply(200, mockDataFromOrdapi);
};

const pageSetup = async (setup = { withAuth: true, getRoute: true }) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
  }
};

fixture.skip('Ordering-party page - with saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should render organisation name with data from ORDAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const heading = Selector('h2[data-test-id="organisation-name-heading"]');
  const text = Selector('div[data-test-id="organisation-name"]');

  await t
    .expect(await extractInnerText(heading)).eql(content.orgNameHeading)
    .expect(await extractInnerText(text)).eql(mockDataFromOrdapi.name);
});

test('should render organisation ods code with data from ORDAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const heading = Selector('h2[data-test-id="organisation-ods-code-heading"]');
  const text = Selector('div[data-test-id="organisation-ods-code"]');

  await t
    .expect(await extractInnerText(heading)).eql(content.odsCodeHeading)
    .expect(await extractInnerText(text)).eql(mockDataFromOrdapi.odsCode);
});

test('should render organisation address with data from ORDAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const heading = Selector('h2[data-test-id="organisation-address-heading"]');
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
    .expect(await extractInnerText(heading)).eql(content.orgAddressHeading)
    .expect(await extractInnerText(addressTextLine1)).eql(mockDataFromOrdapi.address.line1)
    .expect(await extractInnerText(addressTextLine2)).eql(mockDataFromOrdapi.address.line2)
    .expect(await extractInnerText(addressTextLine3)).eql(mockDataFromOrdapi.address.line3)
    .expect(await extractInnerText(addressTextLine4)).eql('')
    .expect(await extractInnerText(addressTextLine5)).eql(mockDataFromOrdapi.address.line5)
    .expect(await extractInnerText(addressTextTown)).eql(mockDataFromOrdapi.address.town)
    .expect(await extractInnerText(addressTextCounty)).eql(mockDataFromOrdapi.address.county)
    .expect(await extractInnerText(addressTextPostcode)).eql(mockDataFromOrdapi.address.postcode)
    .expect(await extractInnerText(addressTextCountry)).eql(mockDataFromOrdapi.address.country);
});

test('should render the primary contact details form with populated data from ORDAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const firstName = Selector('[data-test-id="question-firstName"]');
  const lastName = Selector('[data-test-id="question-lastName"]');
  const emailAddress = Selector('[data-test-id="question-emailAddress"]');
  const phoneNumber = Selector('[data-test-id="question-telephoneNumber"]');

  await t
    .expect(firstName.find('input').value).eql(mockDataFromOrdapi.primaryContact.firstName)
    .expect(lastName.find('input').value).eql(mockDataFromOrdapi.primaryContact.lastName)
    .expect(emailAddress.find('input').value).eql(mockDataFromOrdapi.primaryContact.emailAddress)
    .expect(phoneNumber.find('input').value).eql(mockDataFromOrdapi.primaryContact.telephoneNumber);
});
