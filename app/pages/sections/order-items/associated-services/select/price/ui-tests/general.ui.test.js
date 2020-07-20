import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl } from '../../../../../../../config';
import { nockAndErrorCheck } from '../../../../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/associated-services/select/associated-service/price';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const selectedItemNameState = ClientFunction(() => {
  document.cookie = 'selectedItemName=Associated Service Name';
});

const selectedAssociatedServiceState = ClientFunction(() => {
  document.cookie = 'selectedItemId=associated-service-1';
});

const mockAssociatedServicePricing = {
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
        description: 'per month',
      },
      price: 199.64,
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
        name: 'bed',
        description: 'per bed',
        tierName: 'beds',
      },
      timeUnit: {
        name: 'year',
        description: 'per year',
      },
      tieringPeriod: 3,
      tiers: [
        {
          start: 1,
          end: 999,
          price: 123.450,
        },
        {
          start: 1000,
          price: 49.99,
        },
      ],
    },
  ],
};

const associatedServicePricesState = ClientFunction(() => {
  const cookieValue = JSON.stringify({
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
          description: 'per month',
        },
        price: 199.64,
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
          name: 'bed',
          description: 'per bed',
          tierName: 'beds',
        },
        timeUnit: {
          name: 'year',
          description: 'per year',
        },
        tieringPeriod: 3,
        tiers: [
          {
            start: 1,
            end: 999,
            price: 123.450,
          },
          {
            start: 1000,
            price: 49.99,
          },
        ],
      },
    ],
  });
  document.cookie = `associatedServicePrices=${cookieValue}`;
});

const selectedAssociatedServicePriceIdState = ClientFunction(() => {
  document.cookie = 'selectedPriceId=2';
});

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/prices?catalogueItemId=associated-service-1')
    .reply(200, mockAssociatedServicePricing);
};

const pageSetup = async (
  withAuth = false,
  withSelectedAssociatedServiceState = true,
  withAssociatedServicePricesState = false,
  withSelectedAssociatedServicePriceIdState = false,
) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
  if (withSelectedAssociatedServiceState) {
    await selectedItemNameState();
    await selectedAssociatedServiceState();
  }
  if (withAssociatedServicePricesState) await associatedServicePricesState();
  if (withSelectedAssociatedServicePriceIdState) await selectedAssociatedServicePriceIdState();
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Associated-services - price page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  await pageSetup(false, false);
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render Associated-services price page', async (t) => {
  await pageSetup(true);

  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="associated-service-price-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-id/associated-services/select/associated-service when click on backlink', async (t) => {
  await pageSetup(true);

  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/associated-services/select/associated-service');
});

test('should render the title', async (t) => {
  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="associated-service-price-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} Associated Service Name`);
});

test('should render the description', async (t) => {
  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="associated-service-price-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a selectAssociatedServicePrice question as radio button options', async (t) => {
  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const selectAssociatedServicePriceRadioOptions = Selector('[data-test-id="question-selectAssociatedServicePrice"]');

  await t
    .expect(selectAssociatedServicePriceRadioOptions.exists).ok()
    .expect(await extractInnerText(selectAssociatedServicePriceRadioOptions.find('legend'))).eql(content.questions[0].mainAdvice)
    .expect(selectAssociatedServicePriceRadioOptions.find('input').count).eql(3)

    .expect(selectAssociatedServicePriceRadioOptions.find('input').nth(0).getAttribute('value')).eql('1')
    .expect(await extractInnerText(selectAssociatedServicePriceRadioOptions.find('label').nth(0))).eql('£199.64 per patient per month')

    .expect(selectAssociatedServicePriceRadioOptions.find('input').nth(1).getAttribute('value')).eql('2')
    .expect(await extractInnerText(selectAssociatedServicePriceRadioOptions.find('label').nth(1))).eql('£525.052 per licence')

    .expect(selectAssociatedServicePriceRadioOptions.find('input').nth(2).getAttribute('value')).eql('3')
    .expect(await extractInnerText(selectAssociatedServicePriceRadioOptions.find('label').nth(2))).eql('1 - 999 beds £123.45 per bed per year\n1000+ beds £49.99 per bed per year');
});

test('should render the radioButton as checked for the selectedAssociatedServicePriceId', async (t) => {
  await pageSetup(true, true, true, true);
  await t.navigateTo(pageUrl);

  const selectAssociatedServicePriceRadioOptions = Selector('[data-test-id="question-selectAssociatedServicePrice"]');

  await t
    .expect(selectAssociatedServicePriceRadioOptions.exists).ok()
    .expect(selectAssociatedServicePriceRadioOptions.find('.nhsuk-radios__item').count).eql(3)
    .expect(selectAssociatedServicePriceRadioOptions.find('.nhsuk-radios__item:nth-child(1)').find('input:checked').exists).notOk()
    .expect(selectAssociatedServicePriceRadioOptions.find('.nhsuk-radios__item:nth-child(2)').find('input:checked').exists).ok()
    .expect(selectAssociatedServicePriceRadioOptions.find('.nhsuk-radios__item:nth-child(3)').find('input:checked').exists).notOk();
});

test('should render the Continue button', async (t) => {
  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});

test('should render the title on validation error', async (t) => {
  await selectedItemNameState();
  await pageSetup(true, true, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');
  const title = Selector('h1[data-test-id="associated-service-price-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(`${content.title} Associated Service Name`)
    .click(button);

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} Associated Service Name`);
});

test('should show the error summary when no price selected causing validation error', async (t) => {
  await pageSetup(true, true, true);
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

test('should render select associated service field as errors with error message when no price selected causing validation error', async (t) => {
  await pageSetup(true, true, true);
  await t.navigateTo(pageUrl);

  const associatedServiceSelectPage = Selector('[data-test-id="associated-service-price-page"]');
  const continueButton = Selector('[data-test-id="continue-button"] button');
  const associatedServiceSelectField = associatedServiceSelectPage.find('[data-test-id="question-selectAssociatedServicePrice"]');

  await t
    .expect(associatedServiceSelectField.find('[data-test-id="radiobutton-options-error"]').exists).notOk()
    .click(continueButton);

  await t
    .expect(associatedServiceSelectField.find('[data-test-id="radiobutton-options-error"]').exists).ok()
    .expect(await extractInnerText(associatedServiceSelectField.find('#selectAssociatedServicePrice-error'))).contains('Select a list price');
});

test('should anchor to the field when clicking on the error link in errorSummary ', async (t) => {
  await pageSetup(true, true, true);
  await t.navigateTo(pageUrl);

  const continueButton = Selector('[data-test-id="continue-button"] button');
  const errorSummary = Selector('[data-test-id="error-summary"]');

  await t
    .expect(errorSummary.exists).notOk()
    .click(continueButton);

  await t
    .expect(errorSummary.exists).ok()

    .click(errorSummary.find('li a').nth(0))
    .expect(getLocation()).eql(`${pageUrl}#selectAssociatedServicePrice`);
});
