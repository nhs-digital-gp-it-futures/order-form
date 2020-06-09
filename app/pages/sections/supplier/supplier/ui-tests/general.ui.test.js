import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl, orderApiUrl } from '../../../../../config';

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

const mockData = {
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

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .times(2)
    .reply(200, mockData);
};

const pageSetup = async (withAuth = true) => {
  await setSessionState();
  if (withAuth) {
    await setCookies();
    mocks();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Supplier page - general')
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

test('should render Supplier page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="supplier-page"]');

  await t
    .expect(page.exists).ok();
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="supplier-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="supplier-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the inset advice', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const insetAdvice = Selector('[data-test-id="supplier-page-insetAdvice"]');

  await t
    .expect(insetAdvice.exists).ok()
    .expect(await extractInnerText(insetAdvice)).contains(content.insetAdvice);
});

test('should navigate to /organisation/order-id/supplier/search when click on searchAgainLink', async (t) => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/supplier')
    .reply(200, {});
  nock(solutionsApiUrl)
    .get('/api/v1/suppliers/supplier-1')
    .reply(200, mockData);

  await pageSetup();
  await t.navigateTo(pageUrl);

  const searchAgainLink = Selector('[data-test-id="search-again-link"] a');

  await t
    .expect(searchAgainLink.exists).ok()
    .expect(await extractInnerText(searchAgainLink)).eql(content.searchAgainLinkText)
    .click(searchAgainLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/supplier/search');
});

test('should render the primary contact details form', async (t) => {
  await pageSetup();
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

test('should render the "Save and return" button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="save-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.saveButtonText);
});
