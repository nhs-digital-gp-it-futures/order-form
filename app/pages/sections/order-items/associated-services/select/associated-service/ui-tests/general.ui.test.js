import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl as bapiUrl } from '../../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../helpers/routes/sessionHelper';

const pageUrl = 'http://localhost:1234/order/organisation/odsCode/order/order-id/associated-services/select/associated-service';

const mockAssociatedServices = [
  {
    catalogueItemId: 'associated-service-1',
    name: 'Associated Service 1',
  },
  {
    catalogueItemId: 'associated-service-2',
    name: 'Associated Service 2',
  },
];
const selectedSupplierInSession = 'sup-1';
const associatedServicesInSession = JSON.stringify(
  mockAssociatedServices,
);
const mockSessionOrderItemsState = JSON.stringify([
  { catalogueItemId: 'associated-service-3', catalogueItemType: 'AdditionalService', catalogueItemName: 'Associated Service 3' },
]);

const mocks = () => {
  nock(bapiUrl)
    .get('/api/v1/catalogue-items?publishedStatus=published&supplierId=sup-1&catalogueItemType=AssociatedService')
    .reply(200, mockAssociatedServices);
};

const defaultPageSetup = { withAuth: true, getRoute: true, postRoute: false };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
    await setState(ClientFunction)(sessionKeys.selectedSupplier, selectedSupplierInSession);
    await setState(ClientFunction)(sessionKeys.orderItems, mockSessionOrderItemsState);
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.associatedServices, associatedServicesInSession);
    await setState(ClientFunction)(sessionKeys.orderItems, mockSessionOrderItemsState);
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('associated-services - select - associated-service page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup({ ...defaultPageSetup, withAuth: false, getRoute: false });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render associated-services select page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="associated-service-select-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /order/organisation/order-id/associated-services/associated-service for backLink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(await extractInnerText(goBackLink)).eql(content.backLinkText)
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id/associated-services');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="associated-service-select-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="associated-service-select-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a selectAssociatedService question as radio button options', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const selectAssociatedServiceRadioOptions = Selector('[data-test-id="question-selectAssociatedService"]');

  await t
    .expect(await extractInnerText(selectAssociatedServiceRadioOptions.find('legend'))).eql(content.questions[0].mainAdvice)
    .expect(selectAssociatedServiceRadioOptions.find('input').count).eql(2)

    .expect(selectAssociatedServiceRadioOptions.find('input').nth(0).getAttribute('value')).eql('associated-service-1')
    .expect(await extractInnerText(selectAssociatedServiceRadioOptions.find('label').nth(0))).eql('Associated Service 1')

    .expect(selectAssociatedServiceRadioOptions.find('input').nth(1).getAttribute('value')).eql('associated-service-2')
    .expect(await extractInnerText(selectAssociatedServiceRadioOptions.find('label').nth(1))).eql('Associated Service 2');
});

test('should render the Continue button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

test('should render the error page if no associated services are found', async (t) => {
  await setState(ClientFunction)(sessionKeys.selectedSupplier, selectedSupplierInSession);
  nock(bapiUrl)
    .get('/api/v1/catalogue-items?publishedStatus=published&supplierId=sup-1&catalogueItemType=AssociatedService')
    .reply(200, []);

  await pageSetup({ ...defaultPageSetup, withAuth: true, getRoute: false });
  await t.navigateTo(pageUrl);

  const backLink = Selector('[data-test-id="error-back-link"]');
  const errorTitle = Selector('[data-test-id="error-title"]');
  const errorDescription = Selector('[data-test-id="error-description"]');

  await t
    .expect(await extractInnerText(backLink)).eql('Go back')
    .expect(backLink.find('a').getAttribute('href')).ok('/organisation/order-id/associated-services')
    .expect(await extractInnerText(errorTitle)).eql('No Associated Services found')
    .expect(await extractInnerText(errorDescription)).eql('There are no Associated Services offered by this supplier. Go back to the Associated Services dashboard and select continue to complete the section.');
});

test('should show the error summary when no associated service is selected causing validation error', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(button);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a'))).eql('Select an Associated Service');
});

test('should render select associated service field as errors with error message when no associated service is selected causing validation error', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const associatedServiceSelectPage = Selector('[data-test-id="associated-service-select-page"]');
  const continueButton = Selector('[data-test-id="continue-button"] button');
  const associatedServiceSelectField = associatedServiceSelectPage.find('[data-test-id="question-selectAssociatedService"]');

  await t
    .expect(associatedServiceSelectField.find('[data-test-id="radiobutton-options-error"]').exists).notOk()
    .click(continueButton);

  await t
    .expect(associatedServiceSelectField.find('[data-test-id="radiobutton-options-error"]').exists).ok()
    .expect(await extractInnerText(associatedServiceSelectField.find('#selectAssociatedService-error'))).contains('Select an Associated Service');
});

test('should anchor to the field when clicking on the error link in errorSummary ', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const continueButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(continueButton);

  await t
    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#selectAssociatedService`);
});

test('should redirect to /organisation/odsCode/order/order-id/associated-services/select/associated-service/price when an associated service is selected', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const selectAssociatedServiceRadioOptions = Selector('[data-test-id="question-selectAssociatedService"]');
  const firstAssociatedService = selectAssociatedServiceRadioOptions.find('input').nth(0);
  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .click(firstAssociatedService)
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/odsCode/order/order-id/associated-services/select/associated-service/price');
});
