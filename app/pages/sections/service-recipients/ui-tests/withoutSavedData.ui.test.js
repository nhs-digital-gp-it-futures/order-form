import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import { orderApiUrl, organisationApiUrl } from '../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/service-recipients';

const mockOapiData = [{
  name: 'Some service recipient 1',
  odsCode: 'ods1',
}, {
  name: 'Some service recipient 2',
  odsCode: 'ods2',
}];

const getLocation = ClientFunction(() => document.location.href);

const mocks = (timesToCallMocks) => {
  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id/service-recipients')
    .times(timesToCallMocks)
    .reply(200, mockOapiData);
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/service-recipients')
    .times(timesToCallMocks)
    .reply(200, { serviceRecipients: [] });
};

const defaultPageSetup = { withAuth: true, getRoute: true, timesToCallMocks: 1 };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks(setup.timesToCallMocks);
  }
};

fixture('Service-recipients page - without saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
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

test('should navigate to task list page if continue button is clicked', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/sections/service-recipients', { serviceRecipients: [] })
    .reply(200, {});

  await pageSetup();
  await t.navigateTo(pageUrl);

  const saveButton = Selector('[data-test-id="continue-button"] button');

  await t
    .click(saveButton)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id');
});

test('should check all checkboxes and change button text when "Select all button" is clicked', async (t) => {
  await pageSetup({ ...defaultPageSetup, timesToCallMocks: 2 });
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
  await pageSetup({ ...defaultPageSetup, timesToCallMocks: 2 });
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
