import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from './manifest.json';
import { orderApiUrl, organisationApiUrl } from '../../../config';

const pageUrl = 'http://localhost:1234/organisation/order-id/call-off-ordering-party';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mockOrgData = {
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
};

const mockDataFromOrdapi = {
  ...mockOrgData,
  primaryContact: {
    firstName: 'first',
    lastName: 'last',
    telephoneNumber: '0777',
    emailAddress: 'first@last.com',
  },
};

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

const mocks = (data) => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/ordering-party')
    .reply(200, data);
};

const pageSetup = async (t, withAuth = false, data = mockDataFromOrdapi) => {
  if (withAuth) {
    mocks(data);
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

const putOrderingPartyErrorResponse = {
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

test('should navigate to /organisation/order-id when click on backLink', async (t) => {
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

test('should render organisation name with data from ORDAPI', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const heading = Selector('h3[data-test-id="organisation-name-heading"]');
  const text = Selector('div[data-test-id="organisation-name"]');

  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.orgNameHeading)
    .expect(text.exists).ok()
    .expect(await extractInnerText(text)).eql(mockDataFromOrdapi.name);
});

test('should render organisation name with data from OAPI', async (t) => {
  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id')
    .reply(200, mockDataFromOapi);

  await pageSetup(t, true, {});
  await t.navigateTo(pageUrl);

  const heading = Selector('h3[data-test-id="organisation-name-heading"]');
  const text = Selector('div[data-test-id="organisation-name"]');

  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.orgNameHeading)
    .expect(text.exists).ok()
    .expect(await extractInnerText(text)).eql(mockDataFromOapi.name);
});

test('should render organisation ods code with data from ORDAPI', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const heading = Selector('h3[data-test-id="organisation-ods-code-heading"]');
  const text = Selector('div[data-test-id="organisation-ods-code"]');

  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.odsCodeHeading)
    .expect(text.exists).ok()
    .expect(await extractInnerText(text)).eql(mockDataFromOrdapi.odsCode);
});

test('should render organisation ods code with data from OAPI', async (t) => {
  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id')
    .reply(200, mockDataFromOapi);

  await pageSetup(t, true, {});
  await t.navigateTo(pageUrl);

  const heading = Selector('h3[data-test-id="organisation-ods-code-heading"]');
  const text = Selector('div[data-test-id="organisation-ods-code"]');

  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.odsCodeHeading)
    .expect(text.exists).ok()
    .expect(await extractInnerText(text)).eql(mockDataFromOapi.odsCode);
});

test('should render organisation address with data from ORDAPI', async (t) => {
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
    .expect(await extractInnerText(addressTextLine1)).eql(mockDataFromOrdapi.address.line1)
    .expect(addressTextLine2.exists).ok()
    .expect(await extractInnerText(addressTextLine2)).eql(mockDataFromOrdapi.address.line2)
    .expect(addressTextLine3.exists).ok()
    .expect(await extractInnerText(addressTextLine3)).eql(mockDataFromOrdapi.address.line3)
    .expect(addressTextLine4.exists).ok()
    .expect(await extractInnerText(addressTextLine4)).eql('')
    .expect(addressTextLine5.exists).ok()
    .expect(await extractInnerText(addressTextLine5)).eql(mockDataFromOrdapi.address.line5)
    .expect(addressTextTown.exists).ok()
    .expect(await extractInnerText(addressTextTown)).eql(mockDataFromOrdapi.address.town)
    .expect(addressTextCounty.exists).ok()
    .expect(await extractInnerText(addressTextCounty)).eql(mockDataFromOrdapi.address.county)
    .expect(addressTextPostcode.exists).ok()
    .expect(await extractInnerText(addressTextPostcode)).eql(mockDataFromOrdapi.address.postcode)
    .expect(addressTextCountry.exists).ok()
    .expect(await extractInnerText(addressTextCountry)).eql(mockDataFromOrdapi.address.country);
});

test('should render organisation address with data from OAPI', async (t) => {
  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id')
    .reply(200, mockDataFromOapi);

  await pageSetup(t, true, {});
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

test('should render a text field for each question', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

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

test('should render the primary contact details form with populated data from ORDAPI', async (t) => {
  await pageSetup(t, true);
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

test('should render the primary contact details form with populated data from OAPI', async (t) => {
  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id')
    .reply(200, mockDataFromOapi);

  await pageSetup(t, true, {});
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

test('should render save button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.saveButtonText);
});

test('should navigate to task list page if save button is clicked and data is valid', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/ordering-party')
    .reply(200, {});

  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');

  await t
    .expect(saveButton.exists).ok()
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id');
});

test('should show the error summary when there are validation errors', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/ordering-party')
    .reply(400, putOrderingPartyErrorResponse);

  await pageSetup(t, true);
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
    .put('/api/v1/orders/order-id/sections/ordering-party')
    .reply(400, putOrderingPartyErrorResponse);

  await pageSetup(t, true, mockOrgData);
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="save-button"] button');
  const addressTextLine1 = Selector('[data-test-id="organisation-address-1"]');
  const addressTextLine2 = Selector('[data-test-id="organisation-address-2"]');
  const addressTextLine3 = Selector('[data-test-id="organisation-address-3"]');
  const addressTextLine4 = Selector('[data-test-id="organisation-address-4"]');
  const addressTextLine5 = Selector('[data-test-id="organisation-address-5"]');
  const addressTextTown = Selector('[data-test-id="organisation-address-town"]');
  const addressTextCounty = Selector('[data-test-id="organisation-address-county"]');
  const addressTextPostcode = Selector('[data-test-id="organisation-address-postcode"]');
  const addressTextCountry = Selector('[data-test-id="organisation-address-country"]');
  const firstName = Selector('[data-test-id="question-firstName"]');
  const lastName = Selector('[data-test-id="question-lastName"]');
  const emailAddress = Selector('[data-test-id="question-emailAddress"]');
  const phoneNumber = Selector('[data-test-id="question-telephoneNumber"]');

  const typedText = 'A really long string for';

  await t
    .typeText(firstName.find('input'), `${typedText} firstName`)
    .typeText(lastName.find('input'), `${typedText} lastName`)
    .typeText(emailAddress.find('input'), `${typedText} emailAddress`)
    .typeText(phoneNumber.find('input'), `${typedText} phoneNumber`)
    .click(saveButton);

  await t
    .expect(await extractInnerText(addressTextLine1)).eql(mockDataFromOrdapi.address.line1)
    .expect(await extractInnerText(addressTextLine2)).eql(mockDataFromOrdapi.address.line2)
    .expect(await extractInnerText(addressTextLine3)).eql(mockDataFromOrdapi.address.line3)
    .expect(await extractInnerText(addressTextLine4)).eql('')
    .expect(await extractInnerText(addressTextLine5)).eql(mockDataFromOrdapi.address.line5)
    .expect(await extractInnerText(addressTextTown)).eql(mockDataFromOrdapi.address.town)
    .expect(await extractInnerText(addressTextCounty)).eql(mockDataFromOrdapi.address.county)
    .expect(await extractInnerText(addressTextPostcode)).eql(mockDataFromOrdapi.address.postcode)
    .expect(await extractInnerText(addressTextCountry)).eql(mockDataFromOrdapi.address.country)
    .expect(firstName.find('input').value).eql(`${typedText} firstName`)
    .expect(lastName.find('input').value).eql(`${typedText} lastName`)
    .expect(emailAddress.find('input').value).eql(`${typedText} emailAddress`)
    .expect(phoneNumber.find('input').value).eql(`${typedText} phoneNumber`);
});

test('should show text fields as errors with error message when there are validation errors', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/ordering-party')
    .reply(400, putOrderingPartyErrorResponse);

  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="call-off-ordering-party-page"]');
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
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/ordering-party')
    .reply(400, putOrderingPartyErrorResponse);

  await pageSetup(t, true);
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
