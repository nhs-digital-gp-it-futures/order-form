import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { solutionsApiUrl } from '../../../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../../../test-utils/uiTestHelper';
import { sessionKeys } from '../../../../../../../../helpers/routes/sessionHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/catalogue-solutions/neworderitem';

const getLocation = ClientFunction(() => document.location.href);

const selectedPrice = {
  priceId: 2,
  provisioningType: 'patient',
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
};

const itemIdInSession = 'solution-1';
const itemNameInSession = 'solution-name';
const selectedRecipientIdInSession = 'recipient-1';
const selectedRecipientNameInSession = 'recipient-name';
const selectedPriceIdInSession = 'price-1';
const catalogueSolutionIdInSession = 'solution-1';
const plannedDeliveryDateInSession = '2020-10-10';
const recipientsInSession = JSON.stringify([{ name: 'recipient-name', odsCode: 'code' }]);

const orderItemPageDataInSession = JSON.stringify({
  itemId: itemIdInSession,
  itemName: itemNameInSession,
  serviceRecipientId: selectedRecipientIdInSession,
  serviceRecipientName: selectedRecipientNameInSession,
  selectedPrice,
});

const mocks = (mockSelectedPrice) => {
  nock(solutionsApiUrl)
    .get('/api/v1/prices/price-1')
    .reply(200, mockSelectedPrice);
};

const defaultPageSetup = {
  withAuth: true, getRoute: true, postRoute: false, mockData: selectedPrice,
};
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks(setup.mockData);
    await setState(ClientFunction)('fakeToken', authTokenInSession);
    await setState(ClientFunction)(sessionKeys.selectedRecipientId, selectedRecipientIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedRecipientName, selectedRecipientNameInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemId, itemIdInSession);
    await setState(ClientFunction)(sessionKeys.selectedItemName, itemNameInSession);
    await setState(ClientFunction)(sessionKeys.selectedPriceId, selectedPriceIdInSession);
    await setState(ClientFunction)(sessionKeys.catalogueSolutionId, catalogueSolutionIdInSession);
    await setState(ClientFunction)(sessionKeys.plannedDeliveryDate, plannedDeliveryDateInSession);
    await setState(ClientFunction)(sessionKeys.recipients, recipientsInSession);
  }
  if (setup.postRoute) {
    await setState(ClientFunction)(sessionKeys.orderItemPageData, orderItemPageDataInSession);
  }
};

fixture('Catalogue-solutions - flat patient - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should render the solution table headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const solutionTable = Selector('div[data-test-id="solution-table"]');
  const solutionNameColumnHeading = solutionTable.find('[data-test-id="column-heading-0"]');
  const practiceSizeColumnHeading = solutionTable.find('[data-test-id="column-heading-1"]');
  const dateColumnHeading = solutionTable.find('[data-test-id="column-heading-2"]');

  await t
    .expect(solutionTable.exists).ok()
    .expect(solutionNameColumnHeading.exists).ok()
    .expect(await extractInnerText(solutionNameColumnHeading)).eql(content.solutionTable.columnInfo[0].data)
    .expect(practiceSizeColumnHeading.exists).ok()
    .expect(await extractInnerText(practiceSizeColumnHeading)).eql(content.solutionTable.columnInfo[1].data)
    .expect(dateColumnHeading.exists).ok()
    .expect(await extractInnerText(dateColumnHeading)).eql(`${content.solutionTable.columnInfo[2].data}\n${content.solutionTable.columnInfo[2].additionalAdvice}`);
});

test('should render the price table content', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const table = Selector('div[data-test-id="solution-table"]');
  const row = table.find('[data-test-id="table-row-0"]');
  const solutionName = row.find('div[data-test-id="recipient-name-code-recipient"]');
  const practiceSizeInput = row.find('[data-test-id="question-practiceSize"] input');
  const practiceSizeExpandableSection = row.find('[data-test-id="view-section-input-id-practice"]');
  const dateInput = row.find('[data-test-id="question-plannedDeliveryDate"] input');
  const dayInput = dateInput.nth(0);
  const monthInput = dateInput.nth(1);
  const yearInput = dateInput.nth(2);
  const dateExpandableSection = row.find('[data-test-id="view-section-input-id-date"]');

  await t
    .expect(row.exists).ok()
    .expect(solutionName.exists).ok()
    .expect(await extractInnerText(solutionName)).eql('recipient-name (code)')

    .expect(practiceSizeInput.exists).ok()
    .expect(practiceSizeExpandableSection.exists).ok()
    .expect(await extractInnerText(practiceSizeExpandableSection)).eql(content.solutionTable.cellInfo.practiceSize.expandableSection.title)
    .expect(practiceSizeExpandableSection.find('details[open]').exists).notOk()
    .click(practiceSizeExpandableSection.find('summary'))
    .expect(practiceSizeExpandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(practiceSizeExpandableSection.find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.practiceSize.expandableSection.innerComponent.replace('<br><br>', ''))

    .expect(dateInput.exists).ok()
    .expect(dayInput.getAttribute('id')).eql('plannedDeliveryDate-day')
    .expect(dayInput.getAttribute('name')).eql('plannedDeliveryDate-day')
    .expect(dayInput.getAttribute('type')).eql('number')
    .expect(dayInput.getAttribute('value')).eql('10')

    .expect(monthInput.getAttribute('id')).eql('plannedDeliveryDate-month')
    .expect(monthInput.getAttribute('name')).eql('plannedDeliveryDate-month')
    .expect(monthInput.getAttribute('type')).eql('number')
    .expect(monthInput.getAttribute('value')).eql('10')

    .expect(yearInput.getAttribute('id')).eql('plannedDeliveryDate-year')
    .expect(yearInput.getAttribute('name')).eql('plannedDeliveryDate-year')
    .expect(yearInput.getAttribute('type')).eql('number')
    .expect(yearInput.getAttribute('value')).eql('2020')

    .expect(dateExpandableSection.exists).ok()
    .expect(await extractInnerText(dateExpandableSection)).eql(content.solutionTable.cellInfo.plannedDeliveryDate.expandableSection.title)
    .expect(dateExpandableSection.find('details[open]').exists).notOk()
    .click(dateExpandableSection.find('summary'))
    .expect(dateExpandableSection.find('details[open]').exists).ok()
    .expect(await extractInnerText(dateExpandableSection.find('.nhsuk-details__text')))
    .eql(content.solutionTable.cellInfo.plannedDeliveryDate.expandableSection.innerComponent.replace('<br><br>', ''));
});
