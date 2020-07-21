import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/supplier';

const mockSupplierData = {
  name: 'SupplierOne',
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
  primaryContact: {
    firstName: 'Bob',
    lastName: 'Smith',
    emailAddress: 'bob.smith@email.com',
    telephoneNumber: '01234567890',
  },
};

const supplierDataFromOrdapi = mockSupplierData;

const requestPutBody = {
  name: mockSupplierData.name,
  address: {
    line1: mockSupplierData.address.line1,
    line2: mockSupplierData.address.line2,
    line3: mockSupplierData.address.line3,
    line5: mockSupplierData.address.line5,
    town: mockSupplierData.address.town,
    county: mockSupplierData.address.county,
    postcode: mockSupplierData.address.postcode,
    country: mockSupplierData.address.country,
  },
  primaryContact: mockSupplierData.primaryContact,
};


const mocks = (times = 2) => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .times(times)
    .reply(200, supplierDataFromOrdapi);
};

const pageSetup = async (withAuth = true, getRoute = true) => {
  if (withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (getRoute) {
    mocks();
    await setState(ClientFunction)('selectedSupplier', 'supplier-1');
  }
};

fixture('Supplier page - with saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should link to /order/organisation/order-id for backLink when data comes from ORDAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id');
});

test('should render supplier name with data from ORDAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const heading = Selector('h3[data-test-id="supplier-name-heading"]');
  const text = Selector('div[data-test-id="supplier-name"]');

  await t
    .expect(await extractInnerText(heading)).eql(content.supplierNameHeading)
    .expect(await extractInnerText(text)).eql(supplierDataFromOrdapi.name);
});

test('should render supplier address name with data from ORDAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const heading = Selector('h3[data-test-id="supplier-address-heading"]');
  const addressTextLine1 = Selector('[data-test-id="supplier-address-1"]');
  const addressTextLine2 = Selector('[data-test-id="supplier-address-2"]');
  const addressTextLine3 = Selector('[data-test-id="supplier-address-3"]');
  const addressTextLine4 = Selector('[data-test-id="supplier-address-4"]');
  const addressTextLine5 = Selector('[data-test-id="supplier-address-5"]');
  const addressTextTown = Selector('[data-test-id="supplier-address-town"]');
  const addressTextCounty = Selector('[data-test-id="supplier-address-county"]');
  const addressTextPostcode = Selector('[data-test-id="supplier-address-postcode"]');
  const addressTextCountry = Selector('[data-test-id="supplier-address-country"]');

  await t
    .expect(await extractInnerText(heading)).eql(content.supplierAddressHeading)
    .expect(await extractInnerText(addressTextLine1)).eql(supplierDataFromOrdapi.address.line1)
    .expect(await extractInnerText(addressTextLine2)).eql(supplierDataFromOrdapi.address.line2)
    .expect(await extractInnerText(addressTextLine3)).eql(supplierDataFromOrdapi.address.line3)
    .expect(await extractInnerText(addressTextLine4)).eql('')
    .expect(await extractInnerText(addressTextLine5)).eql(supplierDataFromOrdapi.address.line5)
    .expect(await extractInnerText(addressTextTown)).eql(supplierDataFromOrdapi.address.town)
    .expect(await extractInnerText(addressTextCounty)).eql(supplierDataFromOrdapi.address.county)
    .expect(await extractInnerText(addressTextPostcode)).eql(supplierDataFromOrdapi.address.postcode)
    .expect(await extractInnerText(addressTextCountry)).eql(supplierDataFromOrdapi.address.country);
});

test('should render the primary contact details form with populated data from ORDAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const firstName = Selector('[data-test-id="question-firstName"]');
  const lastName = Selector('[data-test-id="question-lastName"]');
  const emailAddress = Selector('[data-test-id="question-emailAddress"]');
  const phoneNumber = Selector('[data-test-id="question-telephoneNumber"]');

  await t
    .expect(firstName.find('input').value).eql(supplierDataFromOrdapi.primaryContact.firstName)
    .expect(lastName.find('input').value).eql(supplierDataFromOrdapi.primaryContact.lastName)
    .expect(emailAddress.find('input').value).eql(supplierDataFromOrdapi.primaryContact.emailAddress)
    .expect(phoneNumber.find('input').value).eql(supplierDataFromOrdapi.primaryContact.telephoneNumber);
});

test('should not show the search again link when there are validation errors and details are provided from ORDAPI', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/supplier', requestPutBody)
    .reply(400, { errors: [] });

  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .reply(200, supplierDataFromOrdapi);

  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const searchAgainLink = Selector('[data-test-id="search-again-link"] a');

  await t
    .expect(searchAgainLink.exists).notOk()
    .click(saveButton);

  await t
    .expect(searchAgainLink.exists).notOk();
});

test('should link back to the /order/organisation/order-id when clicking the backlink validation errors and details are provided from ORDAPI', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/supplier', requestPutBody)
    .reply(400, { errors: [] });

  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .reply(200, supplierDataFromOrdapi);

  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .click(saveButton);

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id');
});
