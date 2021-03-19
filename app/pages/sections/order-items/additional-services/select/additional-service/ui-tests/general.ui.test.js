import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl as bapiUrl, orderApiUrl } from '../../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../helpers/routes/sessionHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/additional-services/select/additional-service';

const mockAdditionalServices = [
  {
    catalogueItemId: 'additional-service-1',
    name: 'Additional Service 1',
    solution: {
      solutionId: 'solution-1',
    },
  },
  {
    catalogueItemId: 'additional-service-2',
    name: 'Additional Service 2',
    solution: {
      solutionId: 'solution-1',
    },
  },
];

const additionalServicesInSession = JSON.stringify(
  mockAdditionalServices,
);

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/order-items?catalogueItemType=Solution')
    .reply(200,
      [
        {
          catalogueItemId: '1',
          catalogueItemName: 'some catalogue solution name',
        },
      ]);
  nock(bapiUrl)
    .get('/api/v1/additional-services?solutionIds=1')
    .reply(200, { additionalServices: mockAdditionalServices });
};

const defaultPageSetup = { withAuth: true, getRoute: true, postRoute: false };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.additionalServices, additionalServicesInSession);
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('additional-services - additional-service page - general')
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

test('should render additional-services select page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="additional-service-select-page"]');

  await t
    .expect(page.exists).ok();
});

test('should link to /order/organisation/order-id/additional-services/additional-service for backLink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/order-id/additional-services');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="additional-service-select-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('[data-test-id="additional-service-select-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the Continue button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

test('should redirect to /organisation/order-id/additional-services/select/additional-service/price when an additional service is selected', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const selectAdditionalServiceRadioOptions = Selector('[data-test-id="question-selectAdditionalService"]');
  const firstAdditionalService = selectAdditionalServiceRadioOptions.find('input').nth(0);
  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .click(firstAdditionalService)
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/additional-services/select/additional-service/price');
});

test('should show the error summary when no additional service is selected causing validation error', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(button);

  await t
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a'))).eql('Select an Additional Service');
});

test('should render select additional service field as errors with error message when no additional service is selected causing validation error', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const additionalServiceSelectPage = Selector('[data-test-id="additional-service-select-page"]');
  const continueButton = Selector('[data-test-id="continue-button"] button');
  const additionalServiceSelectField = additionalServiceSelectPage.find('[data-test-id="question-selectAdditionalService"]');

  await t
    .expect(additionalServiceSelectField.find('[data-test-id="radiobutton-options-error"]').exists).notOk()
    .click(continueButton);

  await t
    .expect(additionalServiceSelectField.find('[data-test-id="radiobutton-options-error"]').exists).ok()
    .expect(await extractInnerText(additionalServiceSelectField.find('#selectAdditionalService-error'))).contains('Select an Additional Service');
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
    .expect(getLocation()).eql(`${pageUrl}#selectAdditionalService`);
});

test('should render the error page if no additional services are found', async (t) => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/order-items?catalogueItemType=Solution')
    .reply(200, []);

  nock(bapiUrl)
    .get('/api/v1/additional-services?solutionIds=')
    .reply(200, { additionalServices: [] });

  await pageSetup({ ...defaultPageSetup, getRoute: false });
  await t.navigateTo(pageUrl);

  const backLink = Selector('[data-test-id="error-back-link"]');
  const errorTitle = Selector('[data-test-id="error-title"]');
  const errorDescription = Selector('[data-test-id="error-description"]');

  await t
    .expect(await extractInnerText(backLink)).eql('Go back')
    .expect(backLink.find('a').getAttribute('href')).ok('/organisation/order-id/additional-services')

    .expect(await extractInnerText(errorTitle)).eql('No Additional Services found')
    .expect(await extractInnerText(errorDescription)).eql('There are no Additional Services offered by this supplier. Go back to the Additional Services dashboard and select continue to complete the section.');
});
