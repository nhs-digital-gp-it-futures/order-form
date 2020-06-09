import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl, organisationApiUrl } from '../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/ordering-party';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mockDataFromOapi = {
  name: 'Org name from oapi',
  odsCode: 'AB5',
  address: {
    line1: 'address 1',
    line2: 'address 2',
    line3: null,
    line4: 'address 4',
    line5: 'address 5',
    town: 'towntown',
    county: 'shireshire',
    postcode: 'OT3 RPO',
    country: 'SCOTLAND',
  },
  primaryContact: {
    firstName: 'first name',
    lastName: 'last name',
    telephoneNumber: '077744',
    emailAddress: 'name@mname.com',
  },
};

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/ordering-party')
    .reply(200, {});
  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id')
    .reply(200, mockDataFromOapi);
};

const pageSetup = async () => {
  mocks();
  await setCookies();
};

fixture('Ordering-party page - wothout saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('should render organisation name with data from OAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const heading = Selector('h3[data-test-id="organisation-name-heading"]');
  const text = Selector('div[data-test-id="organisation-name"]');

  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.orgNameHeading)
    .expect(text.exists).ok()
    .expect(await extractInnerText(text)).eql(mockDataFromOapi.name);
});

test('should render organisation ods code with data from OAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const heading = Selector('h3[data-test-id="organisation-ods-code-heading"]');
  const text = Selector('div[data-test-id="organisation-ods-code"]');

  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.odsCodeHeading)
    .expect(text.exists).ok()
    .expect(await extractInnerText(text)).eql(mockDataFromOapi.odsCode);
});

test('should render organisation address with data from OAPI', async (t) => {
  await pageSetup();
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
    .expect(await extractInnerText(addressTextLine1)).eql(mockDataFromOapi.address.line1)
    .expect(addressTextLine2.exists).ok()
    .expect(await extractInnerText(addressTextLine2)).eql(mockDataFromOapi.address.line2)
    .expect(addressTextLine3.exists).ok()
    .expect(await extractInnerText(addressTextLine3)).eql('')
    .expect(addressTextLine4.exists).ok()
    .expect(await extractInnerText(addressTextLine4)).eql(mockDataFromOapi.address.line4)
    .expect(addressTextLine5.exists).ok()
    .expect(await extractInnerText(addressTextLine5)).eql(mockDataFromOapi.address.line5)
    .expect(addressTextTown.exists).ok()
    .expect(await extractInnerText(addressTextTown)).eql(mockDataFromOapi.address.town)
    .expect(addressTextCounty.exists).ok()
    .expect(await extractInnerText(addressTextCounty)).eql(mockDataFromOapi.address.county)
    .expect(addressTextPostcode.exists).ok()
    .expect(await extractInnerText(addressTextPostcode)).eql(mockDataFromOapi.address.postcode)
    .expect(addressTextCountry.exists).ok()
    .expect(await extractInnerText(addressTextCountry)).eql(mockDataFromOapi.address.country);
});

test('should render the primary contact details form with populated data from OAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const firstName = Selector('[data-test-id="question-firstName"]');
  const lastName = Selector('[data-test-id="question-lastName"]');
  const emailAddress = Selector('[data-test-id="question-emailAddress"]');
  const phoneNumber = Selector('[data-test-id="question-telephoneNumber"]');

  await t
    .expect(firstName.find('input').value).eql(mockDataFromOapi.primaryContact.firstName)
    .expect(lastName.find('input').value).eql(mockDataFromOapi.primaryContact.lastName)
    .expect(emailAddress.find('input').value).eql(mockDataFromOapi.primaryContact.emailAddress)
    .expect(phoneNumber.find('input').value).eql(mockDataFromOapi.primaryContact.telephoneNumber);
});
