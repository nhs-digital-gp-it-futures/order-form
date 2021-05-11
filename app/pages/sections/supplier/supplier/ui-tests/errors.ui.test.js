import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { solutionsApiUrl, orderApiUrl } from '../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../helpers/routes/sessionHelper';

const pageUrl = 'http://localhost:1234/order/organisation/odsCode/order/order-id/supplier';

const mockSupplierData = {
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

const supplierDataFromBapi = mockSupplierData;

const supplierErrorResponse = {
  errors: [
    {
      field: 'FirstName',
      id: 'FirstNameTooLong',
    },
    {
      field: 'LastName',
      id: 'LastNameTooLong',
    },
    {
      field: 'EmailAddress',
      id: 'EmailAddressTooLong',
    },
    {
      field: 'TelephoneNumber',
      id: 'TelephoneNumberTooLong',
    },
  ],
};

const requestPutBody = {
  name: mockSupplierData.name,
  address: {
    line1: mockSupplierData.address.line1,
    line2: mockSupplierData.address.line2,
    line4: mockSupplierData.address.line4,
    line5: mockSupplierData.address.line5,
    town: mockSupplierData.address.town,
    county: mockSupplierData.address.county,
    postcode: mockSupplierData.address.postcode,
    country: mockSupplierData.address.country,
  },
  primaryContact: mockSupplierData.primaryContact,
};

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .reply(200, {});

  nock(solutionsApiUrl)
    .get('/api/v1/suppliers/supplier-1')
    .reply(200, supplierDataFromBapi);
};

const defaultPageSetup = { withAuth: true, getRoute: true, mockData: {} };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks(setup.mockData);
    await setState(ClientFunction)(sessionKeys.selectedSupplier, 'supplier-1');
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Supplier page - errors')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should navigate to task list page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/supplier', requestPutBody)
    .reply(200, {});

  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/odsCode/order/order-id');
});

test('should show the error summary when there are validation errors', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/supplier', requestPutBody)
    .reply(400, supplierErrorResponse);

  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .reply(200, {});

  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(4)
    .expect(await extractInnerText(errorSummary.find('li a').nth(0))).eql('First name must be 100 characters or fewer')
    .expect(await extractInnerText(errorSummary.find('li a').nth(1))).eql('Last name must be 100 characters or fewer')
    .expect(await extractInnerText(errorSummary.find('li a').nth(2))).eql('Email address must be 256 characters or fewer')
    .expect(await extractInnerText(errorSummary.find('li a').nth(3))).eql('Telephone number must be 35 characters or fewer');
});

test('should ensure details are repopulated when there are validation errors', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/supplier', requestPutBody)
    .reply(400, supplierErrorResponse);

  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .reply(200, {});

  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="supplier-page"]');
  const saveButton = Selector('[data-test-id="save-button"] button');
  const addressTextLine1 = Selector('[data-test-id="supplier-address-1"]');
  const addressTextLine2 = Selector('[data-test-id="supplier-address-2"]');
  const addressTextLine3 = Selector('[data-test-id="supplier-address-3"]');
  const addressTextLine4 = Selector('[data-test-id="supplier-address-4"]');
  const addressTextLine5 = Selector('[data-test-id="supplier-address-5"]');
  const addressTextTown = Selector('[data-test-id="supplier-address-town"]');
  const addressTextCounty = Selector('[data-test-id="supplier-address-county"]');
  const addressTextPostcode = Selector('[data-test-id="supplier-address-postcode"]');
  const addressTextCountry = Selector('[data-test-id="supplier-address-country"]');
  const firstNameField = page.find('[data-test-id="question-firstName"]');
  const lastName = Selector('[data-test-id="question-lastName"]');
  const emailAddress = Selector('[data-test-id="question-emailAddress"]');
  const phoneNumber = Selector('[data-test-id="question-telephoneNumber"]');

  await t
    .click(saveButton);

  await t
    .expect(await extractInnerText(addressTextLine1)).eql(supplierDataFromBapi.address.line1)
    .expect(await extractInnerText(addressTextLine2)).eql(supplierDataFromBapi.address.line2)
    .expect(await extractInnerText(addressTextLine3)).eql('')
    .expect(await extractInnerText(addressTextLine4)).eql(supplierDataFromBapi.address.line4)
    .expect(await extractInnerText(addressTextLine5)).eql(supplierDataFromBapi.address.line5)
    .expect(await extractInnerText(addressTextTown)).eql(supplierDataFromBapi.address.town)
    .expect(await extractInnerText(addressTextCounty)).eql(supplierDataFromBapi.address.county)
    .expect(await extractInnerText(addressTextPostcode)).eql(supplierDataFromBapi.address.postcode)
    .expect(await extractInnerText(addressTextCountry)).eql(supplierDataFromBapi.address.country)
    .expect(firstNameField.find('input').value).eql(supplierDataFromBapi.primaryContact.firstName)
    .expect(lastName.find('input').value).eql(supplierDataFromBapi.primaryContact.lastName)
    .expect(emailAddress.find('input').value).eql(supplierDataFromBapi.primaryContact.emailAddress)
    .expect(phoneNumber.find('input').value).eql(supplierDataFromBapi.primaryContact.telephoneNumber);
});

test('should show text fields as errors with error message when there are validation errors', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/supplier', requestPutBody)
    .reply(400, supplierErrorResponse);

  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .reply(200, {});

  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="supplier-page"]');
  const saveButton = Selector('[data-test-id="save-button"] button');
  const firstNameField = page.find('[data-test-id="question-firstName"]');
  const lastNameField = page.find('[data-test-id="question-lastName"]');
  const emailField = page.find('[data-test-id="question-emailAddress"]');
  const phoneField = page.find('[data-test-id="question-telephoneNumber"]');

  await t
    .expect(firstNameField.find('[data-test-id="text-field-input-error"]').exists).notOk()
    .expect(lastNameField.find('[data-test-id="text-field-input-error"]').exists).notOk()
    .expect(phoneField.find('[data-test-id="text-field-input-error"]').exists).notOk()
    .expect(emailField.find('[data-test-id="text-field-input-error"]').exists).notOk()
    .click(saveButton);

  await t
    .expect(firstNameField.find('[data-test-id="text-field-input-error"]').exists).ok()
    .expect(await extractInnerText(firstNameField.find('#firstName-error'))).contains('First name must be 100 characters or fewer')
    .expect(lastNameField.find('[data-test-id="text-field-input-error"]').exists).ok()
    .expect(await extractInnerText(lastNameField.find('#lastName-error'))).contains('Last name must be 100 characters or fewer')
    .expect(emailField.find('[data-test-id="text-field-input-error"]').exists).ok()
    .expect(await extractInnerText(emailField.find('#emailAddress-error'))).contains('Email address must be 256 characters or fewer')
    .expect(phoneField.find('[data-test-id="text-field-input-error"]').exists).ok()
    .expect(await extractInnerText(phoneField.find('#telephoneNumber-error'))).contains('Telephone number must be 35 characters or fewer');
});

test('should anchor to the field when clicking on the error link in errorSummary ', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/supplier', requestPutBody)
    .reply(400, supplierErrorResponse);

  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .reply(200, {});

  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(saveButton);

  await t
    .expect(errorSummary.exists).ok()
    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#firstName`)
    .click(errorSummary.find('li a').nth(1))
    .expect(getLocation()).eql(`${pageUrl}#lastName`)
    .click(errorSummary.find('li a').nth(2))
    .expect(getLocation()).eql(`${pageUrl}#emailAddress`)
    .click(errorSummary.find('li a').nth(3))
    .expect(getLocation()).eql(`${pageUrl}#telephoneNumber`);
});
