import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl, solutionsApiUrl } from '../../../../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/additional-services/select/additional-service/price';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const selectedAdditionalServiceState = ClientFunction(() => {
  document.cookie = 'selectedItemId=additional-service-1';
  document.cookie = 'selectedItemName=Additional Service Name';
});

const mockAdditionalServicePricing = {
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

const additionalServicePricesState = ClientFunction(() => {
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
  document.cookie = `additionalServicePrices=${cookieValue}`;
});

const selectedAdditionalServicePriceIdState = ClientFunction(() => {
  document.cookie = 'selectedPriceId=2';
});

const mocks = () => {
  nock(solutionsApiUrl)
    .get('/api/v1/prices?catalogueItemId=additional-service-1')
    .reply(200, mockAdditionalServicePricing);
};

const pageSetup = async (
  withAuth = false,
  withSelectedAdditionalServiceState = true,
  withAdditionalServicePricesState = false,
  withSelectedAdditionalServicePriceIdState = false,
) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
  if (withSelectedAdditionalServiceState) await selectedAdditionalServiceState();
  if (withAdditionalServicePricesState) await additionalServicePricesState();
  if (withSelectedAdditionalServicePriceIdState) await selectedAdditionalServicePriceIdState();
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Additional-services - price page - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
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

test('should render Additional-services price page', async (t) => {
  await pageSetup(true);

  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="additional-service-price-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-id/additional-services/select/additional-service when click on backlink', async (t) => {
  await pageSetup(true);

  const solutionId = '100001-001';

  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/sections/catalogue-solutions')
    .reply(200, { catalogueSolutions: [{ catalogueItemId: solutionId }] });

  nock(solutionsApiUrl)
    .get(`/api/v1/additional-services?solutionIds=${solutionId}`)
    .reply(200, {
      additionalServices: [
        {
          additionalServiceId: '100000-001A001',
          name: 'Write on Time Additional Service 1',
        },
      ],
    });

  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id/additional-services/select/additional-service');
});

test('should render the title', async (t) => {
  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="additional-service-price-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} Additional Service Name`);
});

test('should render the description', async (t) => {
  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="additional-service-price-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a selectAdditionalServicePrice question as radio button options', async (t) => {
  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const selectAdditionalServicePriceRadioOptions = Selector('[data-test-id="question-selectAdditionalServicePrice"]');

  await t
    .expect(selectAdditionalServicePriceRadioOptions.exists).ok()
    .expect(await extractInnerText(selectAdditionalServicePriceRadioOptions.find('legend'))).eql(content.questions[0].mainAdvice)
    .expect(selectAdditionalServicePriceRadioOptions.find('input').count).eql(3)

    .expect(selectAdditionalServicePriceRadioOptions.find('input').nth(0).getAttribute('value')).eql('1')
    .expect(await extractInnerText(selectAdditionalServicePriceRadioOptions.find('label').nth(0))).eql('£199.64 per patient per month')

    .expect(selectAdditionalServicePriceRadioOptions.find('input').nth(1).getAttribute('value')).eql('2')
    .expect(await extractInnerText(selectAdditionalServicePriceRadioOptions.find('label').nth(1))).eql('£525.052 per licence')

    .expect(selectAdditionalServicePriceRadioOptions.find('input').nth(2).getAttribute('value')).eql('3')
    .expect(await extractInnerText(selectAdditionalServicePriceRadioOptions.find('label').nth(2))).eql('1 - 999 beds £123.45 per bed per year\n1000+ beds £49.99 per bed per year');
});

test('should render the radioButton as checked for the selectedAdditionalServicePriceId', async (t) => {
  await pageSetup(true, true, true, true);
  await t.navigateTo(pageUrl);

  const selectAdditionalServicePriceRadioOptions = Selector('[data-test-id="question-selectAdditionalServicePrice"]');

  await t
    .expect(selectAdditionalServicePriceRadioOptions.exists).ok()
    .expect(selectAdditionalServicePriceRadioOptions.find('.nhsuk-radios__item').count).eql(3)
    .expect(selectAdditionalServicePriceRadioOptions.find('.nhsuk-radios__item:nth-child(1)').find('input:checked').exists).notOk()
    .expect(selectAdditionalServicePriceRadioOptions.find('.nhsuk-radios__item:nth-child(2)').find('input:checked').exists).ok()
    .expect(selectAdditionalServicePriceRadioOptions.find('.nhsuk-radios__item:nth-child(3)').find('input:checked').exists).notOk();
});

test('should render the Continue button', async (t) => {
  await pageSetup(true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});
