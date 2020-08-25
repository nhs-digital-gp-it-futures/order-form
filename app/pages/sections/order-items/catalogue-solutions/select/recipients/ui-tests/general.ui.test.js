import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { organisationApiUrl } from '../../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../helpers/routes/sessionHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/select/solution/price/recipients';

const selectedItemNameInSession = 'Solution One';

const mockOapiData = [{
  name: 'Some service recipient 1',
  odsCode: 'ods1',
}, {
  name: 'Some service recipient 2',
  odsCode: 'ods2',
}];

const mocks = () => {
  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id/service-recipients')
    .reply(200, mockOapiData);
};

const defaultPageSetup = { withAuth: true, getRoute: true };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
    await setState(ClientFunction)(sessionKeys.selectedItemName, selectedItemNameInSession);
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Catalogue-solutions - recipients page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup({ withAuth: false, getRoute: false });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render solution-recipients page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="solution-recipients-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /order/organisation/order-id for backLink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="solution-recipients-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql('Service Recipients for Solution One for order-id');
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="solution-recipients-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the "Select/Deselect" button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="select-deselect-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.selectDeselectButtonText.select);
});

test('should render the organisation heading', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const heading = Selector('[data-test-id="column-heading-0"]');

  await t
    .expect(await extractInnerText(heading)).eql(content.serviceRecipientsTable.columnInfo[0].data);
});

test('should render the ods code heading', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const heading = Selector('[data-test-id="column-heading-1"]');

  await t
    .expect(await extractInnerText(heading)).eql(content.serviceRecipientsTable.columnInfo[1].data);
});

test('should render unchecked checkbox for each service recipient', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const checkbox1Input = Selector('[data-test-id="ods1-organisationName"] input');
  const checkbox1Label = Selector('[data-test-id="ods1-organisationName"] label');
  const checkbox2Input = Selector('[data-test-id="ods2-organisationName"] input');
  const checkbox2Label = Selector('[data-test-id="ods2-organisationName"] label');

  await t
    .expect(checkbox1Input.getAttribute('name')).eql('ods1')
    .expect(checkbox1Input.getAttribute('id')).eql('ods1-organisationName')
    .expect(checkbox1Input.getAttribute('type')).eql('checkbox')
    .expect(checkbox1Input.find(':checked').exists).notOk()
    .expect(await extractInnerText(checkbox1Label)).eql('Some service recipient 1')
    .expect(checkbox1Label.getAttribute('for')).eql('ods1-organisationName')

    .expect(checkbox2Input.getAttribute('name')).eql('ods2')
    .expect(checkbox2Input.getAttribute('id')).eql('ods2-organisationName')
    .expect(checkbox2Input.getAttribute('type')).eql('checkbox')
    .expect(checkbox2Input.find(':checked').exists).notOk()
    .expect(await extractInnerText(checkbox2Label)).eql('Some service recipient 2')
    .expect(checkbox2Label.getAttribute('for')).eql('ods2-organisationName');
});

test('should render ods code for each service recipient', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const odsCode1 = Selector('[data-test-id="ods1-odsCode"]');
  const odsCode2 = Selector('[data-test-id="ods2-odsCode"]');

  await t
    .expect(await extractInnerText(odsCode1)).eql(mockOapiData[0].odsCode)
    .expect(await extractInnerText(odsCode2)).eql(mockOapiData[1].odsCode);
});

test('should check all checkboxes and change button text when "Select all button" is clicked', async (t) => {
  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id/service-recipients')
    .reply(200, mockOapiData);

  await pageSetup({ ...defaultPageSetup });
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="select-deselect-button"] button');
  const checkbox1Input = Selector('[data-test-id="ods1-organisationName"] input');
  const checkbox2Input = Selector('[data-test-id="ods2-organisationName"] input');

  await t
    .expect(checkbox1Input.getAttribute('checked')).eql(undefined)
    .expect(checkbox2Input.getAttribute('checked')).eql(undefined)
    .expect(await extractInnerText(button)).eql('Select all')
    .click(button);

  await t
    .expect(await extractInnerText(button)).eql('Deselect all')
    .expect(checkbox1Input.getAttribute('checked')).eql('')
    .expect(checkbox2Input.getAttribute('checked')).eql('');
});

test('should uncheck all checkboxes and change button text when all are selected and "Deselect all button" is clicked', async (t) => {
  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id/service-recipients')
    .reply(200, mockOapiData);

  await pageSetup({ ...defaultPageSetup });
  await t.navigateTo(`${pageUrl}?selectStatus=select`);

  const button = Selector('[data-test-id="select-deselect-button"] button');
  const checkbox1Input = Selector('[data-test-id="ods1-organisationName"] input');
  const checkbox2Input = Selector('[data-test-id="ods2-organisationName"] input');

  await t
    .expect(checkbox1Input.getAttribute('checked')).eql('')
    .expect(checkbox2Input.getAttribute('checked')).eql('')
    .expect(await extractInnerText(button)).eql('Deselect all')
    .click(button);

  await t
    .expect(await extractInnerText(button)).eql('Select all')
    .expect(checkbox1Input.getAttribute('checked')).eql(undefined)
    .expect(checkbox2Input.getAttribute('checked')).eql(undefined);
});

test('should render the "Continue" button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});
