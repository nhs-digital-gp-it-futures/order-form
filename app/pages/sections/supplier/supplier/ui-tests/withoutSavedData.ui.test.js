import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl, orderApiUrl } from '../../../../../config';
import { nockCheck } from '../../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/supplier';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const setSessionState = ClientFunction(() => {
  const cookieValue = 'supplier-1';

  document.cookie = `selectedSupplier=${cookieValue}`;
});

const supplierDataFromBapi = {
  name: 'SupplierTwo',
  address: {
    line1: 'address 1',
    line2: 'address 2',
    line3: null,
    line4: 'address 3',
    line5: 'address 5',
    town: 'townytown',
    county: 'shirexshire',
    postcode: 'PO57 COD',
    country: 'Scotland',
  },
  primaryContact: {
    firstName: 'Mary',
    lastName: 'Green',
    emailAddress: 'mary.green@email.com',
    telephoneNumber: '07765432198',
  },
};

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .reply(200, {});
};

const bapiMocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers/supplier-1')
    .reply(200, supplierDataFromBapi);
};

const pageSetup = async (withSessionState = true) => {
  await setCookies();
  mocks();
  if (withSessionState) {
    await setSessionState();
    bapiMocks();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Supplier page - without saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockCheck(nock, t);
  });

test('should navigate to /organisation/order-id/supplier/search/select when click on backlink if data comes from BAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/supplier/search/select');
});

test('should render supplier name with data from BAPI when no data from ORDAPI and supplierId provided', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const heading = Selector('h3[data-test-id="supplier-name-heading"]');
  const text = Selector('div[data-test-id="supplier-name"]');

  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.supplierNameHeading)
    .expect(text.exists).ok()
    .expect(await extractInnerText(text)).eql(supplierDataFromBapi.name);
});

test('should render supplier address name with data from BAPI when no data from ORDAPI and supplierId provided', async (t) => {
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
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.supplierAddressHeading)
    .expect(addressTextLine1.exists).ok()
    .expect(await extractInnerText(addressTextLine1)).eql(supplierDataFromBapi.address.line1)
    .expect(addressTextLine2.exists).ok()
    .expect(await extractInnerText(addressTextLine2)).eql(supplierDataFromBapi.address.line2)
    .expect(addressTextLine3.exists).ok()
    .expect(await extractInnerText(addressTextLine3)).eql('')
    .expect(addressTextLine4.exists).ok()
    .expect(await extractInnerText(addressTextLine4)).eql(supplierDataFromBapi.address.line4)
    .expect(addressTextLine5.exists).ok()
    .expect(await extractInnerText(addressTextLine5)).eql(supplierDataFromBapi.address.line5)
    .expect(addressTextTown.exists).ok()
    .expect(await extractInnerText(addressTextTown)).eql(supplierDataFromBapi.address.town)
    .expect(addressTextCounty.exists).ok()
    .expect(await extractInnerText(addressTextCounty)).eql(supplierDataFromBapi.address.county)
    .expect(addressTextPostcode.exists).ok()
    .expect(await extractInnerText(addressTextPostcode)).eql(supplierDataFromBapi.address.postcode)
    .expect(addressTextCountry.exists).ok()
    .expect(await extractInnerText(addressTextCountry)).eql(supplierDataFromBapi.address.country);
});

test('should render the primary contact details form with populated data from BAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const firstName = Selector('[data-test-id="question-firstName"]');
  const lastName = Selector('[data-test-id="question-lastName"]');
  const emailAddress = Selector('[data-test-id="question-emailAddress"]');
  const phoneNumber = Selector('[data-test-id="question-telephoneNumber"]');

  await t
    .expect(firstName.find('input').value).eql(supplierDataFromBapi.primaryContact.firstName)
    .expect(lastName.find('input').value).eql(supplierDataFromBapi.primaryContact.lastName)
    .expect(emailAddress.find('input').value).eql(supplierDataFromBapi.primaryContact.emailAddress)
    .expect(phoneNumber.find('input').value).eql(supplierDataFromBapi.primaryContact.telephoneNumber);
});

test('should redirect to search if there is no data in ORDAPI and supplierSelected is not in session', async (t) => {
  await pageSetup(false);
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/supplier/search');
});
