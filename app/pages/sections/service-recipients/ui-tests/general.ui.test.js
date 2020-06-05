import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl, organisationApiUrl } from '../../../../config';

const pageUrl = 'http://localhost:1234/organisation/order-id/service-recipients';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});


const mocks = () => {
  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id/service-recipients')
    .reply(200, []);
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/service-recipients')
    .reply(200, { serviceRecipients: [] });
};

const pageSetup = async (t, withAuth = false) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('service-recipients page - general')
  .page('http://localhost:1234/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      // eslint-disable-next-line no-console
      console.log(`pending mocks: ${nock.pendingMocks()}`);
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

test('should render service-recipients page', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="service-recipients-page"]');

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

  const title = Selector('h1[data-test-id="service-recipients-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql('Service Recipients for order-id');
});

test('should render the description', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="service-recipients-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the inset advice', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const insetAdvice = Selector('[data-test-id="service-recipients-page-insetAdvice"]');

  await t
    .expect(insetAdvice.exists).ok()
    .expect(await extractInnerText(insetAdvice)).contains(content.insetAdvice);
});

test('should render the "Select/Deselect" button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="select-deselect-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.selectDeselectButton.selectText);
});

test('should render the organisation heading', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const heading = Selector('div[data-test-id="organisation-heading"]');

  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.organisationHeading);
});

test('should render the ods code heading', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const heading = Selector('div[data-test-id="ods-code-heading"]');

  await t
    .expect(heading.exists).ok()
    .expect(await extractInnerText(heading)).eql(content.odsCodeHeading);
});

test('should render checkbox for each service recipient', async (t) => {
  await pageSetup(t, true, mockOapiData);
  await t.navigateTo(pageUrl);
  const checkbox1Input = Selector('[data-test-id="organisation-name-checkbox-ods1"] input');
  const checkbox1Label = Selector('[data-test-id="organisation-name-checkbox-ods1"] label');
  const checkbox2Input = Selector('[data-test-id="organisation-name-checkbox-ods2"] input');
  const checkbox2Label = Selector('[data-test-id="organisation-name-checkbox-ods2"] label');
  await t
    .expect(checkbox1Input.exists).ok()
    .expect(checkbox1Input.getAttribute('name')).eql('ods1')
    .expect(checkbox1Input.getAttribute('id')).eql('ods1')
    .expect(checkbox1Input.getAttribute('type')).eql('checkbox')
    .expect(checkbox1Label.exists).ok()
    .expect(await extractInnerText(checkbox1Label)).eql(mockOapiData[0].name)
    .expect(checkbox1Label.getAttribute('for')).eql('ods1')
    .expect(checkbox2Input.exists).ok()
    .expect(checkbox2Input.getAttribute('name')).eql('ods2')
    .expect(checkbox2Input.getAttribute('id')).eql('ods2')
    .expect(checkbox2Input.getAttribute('type')).eql('checkbox')
    .expect(checkbox2Label.exists).ok()
    .expect(await extractInnerText(checkbox2Label)).eql(mockOapiData[1].name)
    .expect(checkbox2Label.getAttribute('for')).eql('ods2');
});

test('should render the "Continue" button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});
