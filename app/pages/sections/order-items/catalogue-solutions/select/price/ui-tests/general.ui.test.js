import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../test-utils/uiTestHelper';
import { solutionsApiUrl, organisationApiUrl } from '../../../../../../../config';
import { sessionKeys } from '../../../../../../../helpers/routes/sessionHelper';

const pageUrl = 'http://localhost:1234/order/organisation/odsCode/order/order-id/catalogue-solutions/select/solution/price';

const selectedItemNameInSession = 'Solution One';
const selectedItemIdInSession = 'solution-1';
const mockSolutionPricing = {
  prices: [
    {
      priceId: 1,
      type: 'flat',
      currencyCode: 'GBP',
      itemUnit: {
        name: 'patient',
        description: 'per patient',
      },
      timeUnit: {
        name: 'year',
        description: 'per year',
      },
      price: 1.64,
    },
    {
      priceId: 2,
      type: 'flat',
      currencyCode: 'GBP',
      itemUnit: {
        name: 'licence',
        description: 'per licence',
      },
      price: 525.052,
    },
    {
      priceId: 3,
      type: 'tiered',
      currencyCode: 'GBP',
      itemUnit: {
        name: 'consultation',
        description: 'per consultation',
        tierName: 'consultations',
      },
      timeUnit: {
        name: 'month',
        description: 'per month',
      },
      tieringPeriod: 3,
      tiers: [
        {
          start: 1,
          end: 10,
          price: 700.0,
        },
        {
          start: 11,
          price: 400.0,
        },
      ],
    },
  ],
};

const mockSinglePriceSolution = {
  prices: [
    {
      priceId: 1,
      type: 'flat',
      currencyCode: 'GBP',
      itemUnit: {
        name: 'patient',
        description: 'per patient',
      },
      timeUnit: {
        name: 'year',
        description: 'per year',
      },
      price: 1.64,
    },
  ],
};

const solutionPricesInSession = JSON.stringify(
  mockSolutionPricing,
);
const selectedPriceIdInSession = '2';

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/prices?catalogueItemId=solution-1')
    .reply(200, mockSolutionPricing);
};

const defaultPageSetup = {
  withAuth: true, getRoute: true, postRoute: false, withMocks: true,
};

const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    if (setup.withMocks) mocks();
    await setState(ClientFunction)(sessionKeys.selectedItemName, selectedItemNameInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemId, selectedItemIdInSession);
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.solutionPrices, solutionPricesInSession);
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Catalogue-solutions - price page - general')
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

test('should render Catalogue-solutions price page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="solution-price-page"]');

  await t
    .expect(page.exists).ok();
});

test.skip('should link to /organisation/odsCode/order/order-id/catalogue-solutions/select/solution for backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    // .debug()
    // .takeScreenshot({fullPage: true})
    .expect(goBackLink.getAttribute('href'))
    .eql('/order/organisation/odsCode/order/order-id/catalogue-solutions/select/solution');
});

test('should link to /organisation/odsCode/order/order-id/catalogue-solutions/select/solution for backlink with validation errors', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');
  const button = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(button);

  await t
    .expect(errorSummary.exists).ok()
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation/odsCode/order/order-id/catalogue-solutions/select/solution');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="solution-price-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(`${content.title} Solution One`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('p[data-test-id="solution-price-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a selectSolutionPrice question as radio button options', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const selectSolutionPriceRadioOptions = Selector('[data-test-id="question-selectSolutionPrice"]');

  await t
    .expect(selectSolutionPriceRadioOptions.exists).ok()
    .expect(await extractInnerText(selectSolutionPriceRadioOptions.find('legend'))).eql(content.questions[0].mainAdvice)
    .expect(selectSolutionPriceRadioOptions.find('input').count).eql(3)

    .expect(selectSolutionPriceRadioOptions.find('input').nth(0).getAttribute('value')).eql('1')
    .expect(await extractInnerText(selectSolutionPriceRadioOptions.find('label').nth(0))).eql('£1.64 per patient per year')

    .expect(selectSolutionPriceRadioOptions.find('input').nth(1).getAttribute('value')).eql('2')
    .expect(await extractInnerText(selectSolutionPriceRadioOptions.find('label').nth(1))).eql('£525.052 per licence')

    .expect(selectSolutionPriceRadioOptions.find('input').nth(2).getAttribute('value')).eql('3')
    .expect(await extractInnerText(selectSolutionPriceRadioOptions.find('label').nth(2))).eql('1 - 10 consultations £700 per consultation per month\n11+ consultations £400 per consultation per month');
});

test('should render the radioButton as checked for the selectedPriceId', async (t) => {
  await setState(ClientFunction)(sessionKeys.selectedPriceId, selectedPriceIdInSession);
  await pageSetup();
  await t.navigateTo(pageUrl);

  const selectSolutionPriceRadioOptions = Selector('[data-test-id="question-selectSolutionPrice"]');

  await t
    .expect(selectSolutionPriceRadioOptions.find('.nhsuk-radios__item').count).eql(3)
    .expect(selectSolutionPriceRadioOptions.find('.nhsuk-radios__item:nth-child(1)').find('input:checked').exists).notOk()
    .expect(selectSolutionPriceRadioOptions.find('.nhsuk-radios__item:nth-child(2)').find('input:checked').exists).ok()
    .expect(selectSolutionPriceRadioOptions.find('.nhsuk-radios__item:nth-child(3)').find('input:checked').exists).notOk();
});

test('should render the Continue button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

test('should redirect to /organisation/odsCode/order/order-id/catalogue-solutions/select/solution/price/recipients when a price is selected', async (t) => {
  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id/service-recipients')
    .reply(200, []);

  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const selectSolutionRadioOptions = Selector('[data-test-id="question-selectSolutionPrice"]');
  const firstSolution = selectSolutionRadioOptions.find('input').nth(0);
  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .click(firstSolution)
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/odsCode/order/order-id/catalogue-solutions/select/solution/price/recipients');
});

test('should redirect to /organisation/odsCode/order/order-id/catalogue-solutions/select/solution/price/recipients if only one price returned', async (t) => {
  nock(solutionsApiUrl)
    .get('/api/v1/prices?catalogueItemId=solution-1')
    .reply(200, mockSinglePriceSolution);

  nock(organisationApiUrl)
    .get('/api/v1/Organisations/org-id/service-recipients')
    .reply(200, []);

  await pageSetup({ ...defaultPageSetup, withMocks: false });
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/odsCode/order/order-id/catalogue-solutions/select/solution/price/recipients');
});

test('should show the error summary when no price selected causing validation error', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(button);

  await t
    .expect(errorSummary.exists).ok()
    .expect(errorSummary.find('li a').count).eql(1)
    .expect(await extractInnerText(errorSummary.find('li a'))).eql('Select a list price');
});

test('should render select solution field as errors with error message when no price selected causing validation error', async (t) => {
  await pageSetup({ ...defaultPageSetup, postRoute: true });
  await t.navigateTo(pageUrl);

  const solutionSelectPage = Selector('[data-test-id="solution-price-page"]');
  const continueButton = Selector('[data-test-id="continue-button"] button');
  const solutionSelectField = solutionSelectPage.find('[data-test-id="question-selectSolutionPrice"]');

  await t
    .expect(solutionSelectField.find('[data-test-id="radiobutton-options-error"]').exists).notOk()
    .click(continueButton);

  await t
    .expect(solutionSelectField.find('[data-test-id="radiobutton-options-error"]').exists).ok()
    .expect(await extractInnerText(solutionSelectField.find('#selectSolutionPrice-error'))).contains('Select a list price');
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
    .expect(errorSummary.exists).ok()

    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#selectSolutionPrice`);
});
