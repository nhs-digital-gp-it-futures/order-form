import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from './manifest.json';
import { solutionsApiUrl, orderApiUrl } from '../../../../config';

const pageUrl = 'http://localhost:1234/organisation/order-1/supplier';

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

const supplierDataFromOrdapi = {
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

const mocks = (data) => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1/sections/supplier')
    .reply(200, data);
};

const pageSetup = async (t, withAuth = false, withSessionState = false, ordapiData = {}) => {
  if (withAuth) await setCookies();
  if (withSessionState) await setSessionState();
  if (withAuth && withSessionState) mocks(ordapiData);
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Supplier page')
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

test('should render Supplier page', async (t) => {
  await pageSetup(t, true, true, supplierDataFromOrdapi);
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="supplier-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-1/supplier/search/select when click on backlink', async (t) => {
  await pageSetup(t, true, true, supplierDataFromOrdapi);
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1/supplier/search/select');
});

test('should render the title', async (t) => {
  await pageSetup(t, true, true, supplierDataFromOrdapi);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="supplier-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} order-1`);
});

test('should render the description', async (t) => {
  await pageSetup(t, true, true, supplierDataFromOrdapi);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="supplier-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the inset advice', async (t) => {
  await pageSetup(t, true, true, supplierDataFromOrdapi);
  await t.navigateTo(pageUrl);

  const insetAdvice = Selector('[data-test-id="supplier-page-insetAdvice"]');

  await t
    .expect(insetAdvice.exists).ok()
    .expect(await extractInnerText(insetAdvice)).contains(content.insetAdvice);
});

test('should render supplier name with data from ordapi', async (t) => {
  await pageSetup(t, true, true, supplierDataFromOrdapi);
  await t.navigateTo(pageUrl);

  const heading = Selector('h3[data-test-id="supplier-name-heading"]');
  const text = Selector('div[data-test-id="supplier-name"]');

  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.supplierNameHeading)
    .expect(text.exists).ok()
    .expect(await extractInnerText(text)).eql(supplierDataFromOrdapi.name);
});

test('should render supplier name with data from dapi when no data from orapi and supplierId provided', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers/supplier-1')
    .reply(200, supplierDataFromBapi);

  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const heading = Selector('h3[data-test-id="supplier-name-heading"]');
  const text = Selector('div[data-test-id="supplier-name"]');

  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.supplierNameHeading)
    .expect(text.exists).ok()
    .expect(await extractInnerText(text)).eql(supplierDataFromBapi.name);
});

test('should render supplier address name with data from ordapi', async (t) => {
  await pageSetup(t, true, true, supplierDataFromOrdapi);
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
    .expect(await extractInnerText(addressTextLine1)).eql(supplierDataFromOrdapi.address.line1)
    .expect(addressTextLine2.exists).ok()
    .expect(await extractInnerText(addressTextLine2)).eql(supplierDataFromOrdapi.address.line2)
    .expect(addressTextLine3.exists).ok()
    .expect(await extractInnerText(addressTextLine3)).eql(supplierDataFromOrdapi.address.line3)
    .expect(addressTextLine4.exists).ok()
    .expect(await extractInnerText(addressTextLine4)).eql('')
    .expect(addressTextLine5.exists).ok()
    .expect(await extractInnerText(addressTextLine5)).eql(supplierDataFromOrdapi.address.line5)
    .expect(addressTextTown.exists).ok()
    .expect(await extractInnerText(addressTextTown)).eql(supplierDataFromOrdapi.address.town)
    .expect(addressTextCounty.exists).ok()
    .expect(await extractInnerText(addressTextCounty)).eql(supplierDataFromOrdapi.address.county)
    .expect(addressTextPostcode.exists).ok()
    .expect(await extractInnerText(addressTextPostcode)).eql(supplierDataFromOrdapi.address.postcode)
    .expect(addressTextCountry.exists).ok()
    .expect(await extractInnerText(addressTextCountry)).eql(supplierDataFromOrdapi.address.country);
});

test('should render supplier address name with data from dapi when no data from orapi and supplierId provided', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers/supplier-1')
    .reply(200, supplierDataFromBapi);

  await pageSetup(t, true, true);
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

test('should navigate to /organisation/order-1/supplier/search when click on searchAgainLink', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers/supplier-1')
    .reply(200, supplierDataFromBapi);

  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const searchAgainLink = Selector('[data-test-id="search-again-link"] a');

  await t
    .expect(searchAgainLink.exists).ok()
    .expect(await extractInnerText(searchAgainLink)).eql(content.searchAgainLinkText)
    .click(searchAgainLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1/supplier/search');
});

test('should render the primary contact details form', async (t) => {
  await pageSetup(t, true, true, supplierDataFromOrdapi);
  await t.navigateTo(pageUrl);

  const heading = Selector('h2[data-test-id="primary-contact-heading"]');

  const firstName = Selector('[data-test-id="question-firstName"]');
  const lastName = Selector('[data-test-id="question-lastName"]');
  const emailAddress = Selector('[data-test-id="question-emailAddress"]');
  const phoneNumber = Selector('[data-test-id="question-telephoneNumber"]');

  const firstNameLabel = firstName.find('label.nhsuk-label');
  const lastNameLabel = lastName.find('label.nhsuk-label');
  const emailAddressLabel = emailAddress.find('label.nhsuk-label');
  const phoneNumberLabel = phoneNumber.find('label.nhsuk-label');

  const firstNameFooterText = firstName.find('span');
  const lastNameFooterText = lastName.find('span');
  const emailAddressFooterText = emailAddress.find('span');
  const phoneNumberFooterText = phoneNumber.find('span');

  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.primaryContactHeading)

    .expect(firstName.exists).ok()
    .expect(await extractInnerText(firstNameLabel)).eql(content.questions[0].mainAdvice)
    .expect(firstName.find('input').count).eql(1)
    .expect(await extractInnerText(firstNameFooterText)).eql(content.questions[0].footerAdvice)

    .expect(lastName.exists).ok()
    .expect(await extractInnerText(lastNameLabel)).eql(content.questions[1].mainAdvice)
    .expect(lastName.find('input').count).eql(1)
    .expect(await extractInnerText(lastNameFooterText)).eql(content.questions[1].footerAdvice)

    .expect(emailAddress.exists).ok()
    .expect(await extractInnerText(emailAddressLabel)).eql(content.questions[2].mainAdvice)
    .expect(emailAddress.find('input').count).eql(1)
    .expect(await extractInnerText(emailAddressFooterText)).eql(content.questions[2].footerAdvice)

    .expect(phoneNumber.exists).ok()
    .expect(await extractInnerText(phoneNumberLabel)).eql(content.questions[3].mainAdvice)
    .expect(phoneNumber.find('input').count).eql(1)
    .expect(await extractInnerText(phoneNumberFooterText)).eql(content.questions[3].footerAdvice);
});

test('should render the primary contact details form with populated data from ordapi', async (t) => {
  await pageSetup(t, true, true, supplierDataFromOrdapi);
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

test('should render the primary contact details form with populated data from dapi', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers/supplier-1')
    .reply(200, supplierDataFromBapi);

  await pageSetup(t, true, true);
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

test('should render the "Save and return" button', async (t) => {
  await pageSetup(t, true, true, supplierDataFromOrdapi);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.saveButtonText);
});

test('should redirect to search if there is no data in ordapi and supplierSelected is not in session', async (t) => {
  await pageSetup(t, true, false);
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1/supplier/search');
});

test('should navigate to task list page if save button is clicked and data is valid', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers/supplier-1')
    .reply(200, supplierDataFromBapi);
  nock(orderApiUrl)
    .put('/api/v1/orders/order-1/sections/supplier')
    .reply(200, {});

  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .expect(saveButton.exists).ok()
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1');
});

test('should show the error summary when there are validation errors', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers/supplier-1')
    .reply(200, supplierDataFromBapi);
  nock(orderApiUrl)
    .put('/api/v1/orders/order-1/sections/supplier')
    .reply(400, supplierErrorResponse);

  await pageSetup(t, true, true);
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
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers/supplier-1')
    .reply(200, supplierDataFromBapi);
  nock(orderApiUrl)
    .put('/api/v1/orders/order-1/sections/supplier')
    .reply(400, supplierErrorResponse);

  await pageSetup(t, true, true);
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
    .expect(await extractInnerText(addressTextLine3)).eql(supplierDataFromBapi.address.line3)
    .expect(await extractInnerText(addressTextLine4)).eql('')
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
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers/supplier-1')
    .reply(200, supplierDataFromBapi);
  nock(orderApiUrl)
    .put('/api/v1/orders/order-1/sections/supplier')
    .reply(400, supplierErrorResponse);

  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="supplier-page"]');
  const saveButton = Selector('[data-test-id="save-button"] button');
  const firstNameField = page.find('[data-test-id="question-firstName"]');
  const lastNameField = page.find('[data-test-id="question-lastName"]');
  const emailField = page.find('[data-test-id="question-emailAddress"]');
  const phoneField = page.find('[data-test-id="question-telephoneNumber"]');

  await t
    .expect(firstNameField.exists).ok()
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
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers/supplier-1')
    .reply(200, supplierDataFromBapi);
  nock(orderApiUrl)
    .put('/api/v1/orders/order-1/sections/supplier')
    .reply(400, supplierErrorResponse);

  await pageSetup(t, true, true);
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
