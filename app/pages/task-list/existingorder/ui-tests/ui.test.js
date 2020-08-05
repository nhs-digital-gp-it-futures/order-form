import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import commonContent from '../../commonManifest.json';
import existingorderPageContent from '../manifest.json';
import { baseUrl, orderApiUrl } from '../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../test-utils/uiTestHelper';

const mockExistingOrderSummary = {
  orderId: 'order-id',
  description: 'Some description',
  sections: [
    {
      id: 'description',
      status: 'complete',
    },
  ],
  sectionStatus: 'some status',
};

const pageUrl = 'http://localhost:1234/order/organisation/order-id';

const mocks = (data) => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/summary')
    .reply(200, data);
};

const defaultPageSetup = { withAuth: true, getRoute: true, mockData: mockExistingOrderSummary };
const pageSetup = async (setup = defaultPageSetup) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks(setup.mockData);
  }
};

const getLocation = ClientFunction(() => document.location.href);

const generateMockOrderSummary = sectionData => (
  {
    ...mockExistingOrderSummary,
    sections: [
      ...mockExistingOrderSummary.sections,
      ...sectionData,
    ],
  }
);

fixture('Task-list page - existing order')
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

test('should render existingorder task-list page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const page = Selector('[data-test-id="order-id-page"]');

  await t
    .expect(page.exists).ok();
});

test(`should link to ${baseUrl}/organisation for Back link`, async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.getAttribute('href')).eql('/order/organisation');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="order-id-page-title"]');

  await t
    .expect(await extractInnerText(title)).eql(`${existingorderPageContent.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="order-id-page-description"]');

  await t
    .expect(await extractInnerText(description)).eql(existingorderPageContent.description);
});

test('should render the order description details', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderDescriptionTitle = Selector('h3[data-test-id="order-id-order-description-title"]');
  const orderDescription = Selector('h4[data-test-id="order-id-order-description"]');

  await t
    .expect(await extractInnerText(orderDescriptionTitle)).eql(existingorderPageContent.orderDescriptionTitle)
    .expect(await extractInnerText(orderDescription)).eql(mockExistingOrderSummary.description);
});

// Task 1 Item 1 Tests
test('should render task 1 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task1 = Selector('li[data-test-id="task-0"]');
  const task1Item1 = Selector('[data-test-id="task-0-item-0"]');

  await t
    .expect(await extractInnerText(task1.find('h2 span'))).eql('1.')
    .expect(await extractInnerText(task1.find('h2 div'))).eql('Start your order')
    .expect(await extractInnerText(task1Item1.find('span'))).eql('Provide a description of your order');
});

test('should always render task 1 item 1 as a link', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task1Item1 = Selector('li[data-test-id="task-0-item-0"]');

  await t
    .click(task1Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/description`);
});

test('should always render the complete tag for task 1 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task1Item1CompleteTag = Selector('[data-test-id="task-0-item-0-complete-tag"]');

  await t
    .expect(task1Item1CompleteTag.exists).ok();
});

// Task 2 Item 1 Tests
test('should render task 2 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task2 = Selector('li[data-test-id="task-1"]');
  const task2Item1 = Selector('li[data-test-id="task-1-item-0"]');

  await t
    .expect(await extractInnerText(task2.find('h2 span'))).eql('2.')
    .expect(await extractInnerText(task2.find('h2 div'))).eql('Organisation information')
    .expect(await extractInnerText(task2Item1.find('span'))).eql('Provide Call-off Ordering Party information');
});

test('should always render task 2 item 1 as a link', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task2Item1 = Selector('li[data-test-id="task-1-item-0"]');

  await t
    .click(task2Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/ordering-party`);
});

test('should not render the complete tag for task 2 item 1 when returned as incomplete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'ordering-party', status: 'incomplete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task2Item1CompleteTag = Selector('[data-test-id="task-1-item-0-complete-tag"]');

  await t
    .expect(task2Item1CompleteTag.exists).notOk();
});

test('should only render the complete tag for task 2 item 1 when returned as complete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'ordering-party', status: 'complete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task2Item1CompleteTag = Selector('[data-test-id="task-1-item-0-complete-tag"]');

  await t
    .expect(task2Item1CompleteTag.exists).ok();
});

// Task 2 Item 2 Tests
test('should render task 2 item 2', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task2 = Selector('li[data-test-id="task-1"]');
  const task2Item2 = Selector('li[data-test-id="task-1-item-1"]');

  await t
    .expect(await extractInnerText(task2.find('h2 span'))).eql('2.')
    .expect(await extractInnerText(task2.find('h2 div'))).eql('Organisation information')
    .expect(await extractInnerText(task2Item2.find('span'))).eql('Provide Supplier information');
});

test('should always render task 2 item 2 as a link', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task2Item2 = Selector('li[data-test-id="task-1-item-1"]');

  await t
    .click(task2Item2.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/supplier`);
});

test('should not render the complete tag for task 2 item 2 when returned as incomplete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'supplier', status: 'incomplete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task2Item2CompleteTag = Selector('[data-test-id="task-1-item-1-complete-tag"]');

  await t
    .expect(task2Item2CompleteTag.exists).notOk();
});

test('should only render the complete tag for task 2 item 2 when returned as complete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'supplier', status: 'complete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task2Item2CompleteTag = Selector('[data-test-id="task-1-item-1-complete-tag"]');

  await t
    .expect(task2Item2CompleteTag.exists).ok();
});

// Task 3 Item 1 Tests
test('should render task 3 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task3 = Selector('li[data-test-id="task-2"]');
  const task3Item1 = Selector('li[data-test-id="task-2-item-0"]');

  await t
    .expect(await extractInnerText(task3.find('h2 span'))).eql('3.')
    .expect(await extractInnerText(task3.find('h2 div'))).eql('Commencement date')
    .expect(await extractInnerText(task3Item1.find('span'))).eql('Provide commencement date for this agreement');
});

test('should render task 3 item 1 as text if all dependencies are not met', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'incomplete' },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task3Item1 = Selector('li[data-test-id="task-2-item-0"]');

  await t
    .expect(task3Item1.find('a').exists).notOk();
});

test('should only render task 3 item 1 as a link if all dependencies are met', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task3Item1 = Selector('li[data-test-id="task-2-item-0"]');

  await t
    .click(task3Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/commencement-date`);
});

test('should not render the complete tag for task 3 item 1 when returned as incomplete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'commencement-date', status: 'incomplete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task3Item1CompleteTag = Selector('[data-test-id="task-2-item-0-complete-tag"]');

  await t
    .expect(task3Item1CompleteTag.exists).notOk();
});

test('should only render the complete tag for task 3 item 1 when returned as complete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'commencement-date', status: 'complete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task3Item1CompleteTag = Selector('[data-test-id="task-2-item-0-complete-tag"]');

  await t
    .expect(task3Item1CompleteTag.exists).ok();
});

// Task 4 Item 1 Tests
test('should render task 4 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task4 = Selector('li[data-test-id="task-3"]');
  const task4Item1 = Selector('li[data-test-id="task-3-item-0"]');

  await t
    .expect(await extractInnerText(task4.find('h2 span'))).eql('4.')
    .expect(await extractInnerText(task4.find('h2 div'))).eql('Select Service Recipients')
    .expect(await extractInnerText(task4Item1.find('span'))).eql('Select the organisations you are ordering for');
});

test('should render task 4 item 1 as text if all dependencies are not met', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'incomplete' },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task4Item1 = Selector('li[data-test-id="task-3-item-0"]');

  await t
    .expect(task4Item1.find('a').exists).notOk();
});

test('should only render task 4 item 1 as a link if all dependencies are met', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task4Item1 = Selector('li[data-test-id="task-3-item-0"]');

  await t
    .click(task4Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/service-recipients`);
});

test('should not render the complete tag for task 4 item 1 when returned as incomplete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'service-recipients', status: 'incomplete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task4Item1CompleteTag = Selector('[data-test-id="task-3-item-0-complete-tag"]');

  await t
    .expect(task4Item1CompleteTag.exists).notOk();
});

test('should only render the complete tag for task 4 item 1 when returned as complete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'service-recipients', status: 'complete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task4Item1CompleteTag = Selector('[data-test-id="task-3-item-0-complete-tag"]');

  await t
    .expect(task4Item1CompleteTag.exists).ok();
});

// Task 5 Item 1 Tests
test('should render task 5 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task5 = Selector('li[data-test-id="task-4"]');
  const task5Item1 = Selector('li[data-test-id="task-4-item-0"]');

  await t
    .expect(await extractInnerText(task5.find('h2 span'))).eql('5.')
    .expect(await extractInnerText(task5.find('h2 div'))).eql('Add Catalogue Solutions')
    .expect(await extractInnerText(task5Item1.find('span'))).eql('Add Catalogue Solutions to your order');
});

test('should render task 5 item 1 as text if all dependencies are not met', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 0 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task5Item1 = Selector('li[data-test-id="task-4-item-0"]');

  await t
    .expect(task5Item1.find('a').exists).notOk();
});

test('should only render task 5 item 1 as a link if all dependencies are met', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 1 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task5Item1 = Selector('li[data-test-id="task-4-item-0"]');

  await t
    .click(task5Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/catalogue-solutions`);
});

test('should not render the complete tag for task 5 item 1 when returned as incomplete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'catalogue-solutions', status: 'incomplete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task5Item1CompleteTag = Selector('[data-test-id="task-4-item-0-complete-tag"]');

  await t
    .expect(task5Item1CompleteTag.exists).notOk();
});

test('should only render the complete tag for task 5 item 1 when returned as complete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'catalogue-solutions', status: 'complete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task5Item1CompleteTag = Selector('[data-test-id="task-4-item-0-complete-tag"]');

  await t
    .expect(task5Item1CompleteTag.exists).ok();
});

// Task 6 Item 1 Tests
test('should render task 6 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task6 = Selector('li[data-test-id="task-5"]');
  const task6Item1 = Selector('li[data-test-id="task-5-item-0"]');

  await t
    .expect(await extractInnerText(task6.find('h2 span'))).eql('6.')
    .expect(await extractInnerText(task6.find('h2 div'))).eql('Add Additional Services')
    .expect(await extractInnerText(task6Item1.find('span'))).eql('Add Additional Services to your order');
});

test('should render task 6 item 1 as text if all dependencies are not met', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 0 },
    { id: 'catalogue-solutions', status: 'complete', count: 0 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task6Item1 = Selector('li[data-test-id="task-5-item-0"]');

  await t
    .expect(task6Item1.find('a').exists).notOk();
});

test('should only render task 6 item 1 as a link if all dependencies are met', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 1 },
    { id: 'catalogue-solutions', status: 'complete', count: 1 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task6Item1 = Selector('li[data-test-id="task-5-item-0"]');

  await t
    .click(task6Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/additional-services`);
});

test('should not render the complete tag for task 6 item 1 when returned as incomplete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'additional-services', status: 'incomplete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task6Item1CompleteTag = Selector('[data-test-id="task-5-item-0-complete-tag"]');

  await t
    .expect(task6Item1CompleteTag.exists).notOk();
});

test('should only render the complete tag for task 6 item 1 when returned as complete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'additional-services', status: 'complete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task6Item1CompleteTag = Selector('[data-test-id="task-5-item-0-complete-tag"]');

  await t
    .expect(task6Item1CompleteTag.exists).ok();
});

// Task 7 Item 1 Tests
test('should render task 7 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task7 = Selector('li[data-test-id="task-6"]');
  const task7Item1 = Selector('li[data-test-id="task-6-item-0"]');

  await t
    .expect(await extractInnerText(task7.find('h2 span'))).eql('7.')
    .expect(await extractInnerText(task7.find('h2 div'))).eql('Add Associated Services')
    .expect(await extractInnerText(task7Item1.find('span'))).eql('Add Associated Services to your order');
});

test('should render task 7 item 1 as text if recipients saved and count 1', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 1 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task7Item1 = Selector('li[data-test-id="task-6-item-0"]');

  await t
    .expect(task7Item1.find('a').exists).notOk();
});

test('should only render task 7 item 1 as a link if recipients saved and count 0', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 0 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task7Item1 = Selector('li[data-test-id="task-6-item-0"]');

  await t
    .click(task7Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/associated-services`);
});

test('should only render task 7 item 1 as a link if recipients saved and count 1, Catalogue solution saved and count 0', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 1 },
    { id: 'catalogue-solutions', status: 'complete', count: 0 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task7Item1 = Selector('li[data-test-id="task-6-item-0"]');

  await t
    .click(task7Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/associated-services`);
});

test('should render task 7 item 1 as text recipients > 1 and catalogue solution not viewed', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 1 },
    { id: 'catalogue-solutions', status: 'incomplete', count: 0 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task7Item1 = Selector('li[data-test-id="task-6-item-0"]');

  await t
    .expect(task7Item1.find('a').exists).notOk();
});

test('should render task 7 item 1 as text recipients > 1, catalogue solution incomplete, add additional services incomplete', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 1 },
    { id: 'catalogue-solutions', status: 'complete', count: 1 },
    { id: 'additional-services', status: 'incomplete', count: 0 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task7Item1 = Selector('li[data-test-id="task-6-item-0"]');

  await t
    .expect(task7Item1.find('a').exists).notOk();
});

test('should only render task 7 item 1 as a link if recipients 1 and catalogue solution viewed', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 1 },
    { id: 'catalogue-solutions', status: 'complete', count: 0 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task7Item1 = Selector('li[data-test-id="task-6-item-0"]');

  await t
    .click(task7Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/associated-services`);
});

test('should only render task 7 item 1 as a link if recipients 1, catalogue solution 1 and additional services viewed with 0 services', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 1 },
    { id: 'catalogue-solutions', status: 'complete', count: 1 },
    { id: 'additional-services', status: 'complete', count: 0 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task7Item1 = Selector('li[data-test-id="task-6-item-0"]');

  await t
    .click(task7Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/associated-services`);
});

test('should only render task 7 item 1 as a link if recipients 1, catalogue solution 1 and additional services 1', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 1 },
    { id: 'catalogue-solutions', status: 'complete', count: 1 },
    { id: 'additional-services', status: 'complete', count: 1 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task7Item1 = Selector('li[data-test-id="task-6-item-0"]');

  await t
    .click(task7Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/associated-services`);
});

test('should only render task 7 item 1 as a link if associated-services completed', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 1 },
    { id: 'associated-services', status: 'complete', count: 1 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task7Item1 = Selector('li[data-test-id="task-6-item-0"]');

  await t
    .click(task7Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/associated-services`);
});

test('should not render the complete tag for task 7 item 1 when returned as incomplete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'associated-services', status: 'incomplete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task7Item1CompleteTag = Selector('[data-test-id="task-6-item-0-complete-tag"]');

  await t
    .expect(task7Item1CompleteTag.exists).notOk();
});

test('should only render the complete tag for task 7 item 1 when returned as complete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'associated-services', status: 'complete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task7Item1CompleteTag = Selector('[data-test-id="task-6-item-0-complete-tag"]');

  await t
    .expect(task7Item1CompleteTag.exists).ok();
});

// Task 8 Item 1 Tests
test('should render task 8 item 1', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const task8 = Selector('li[data-test-id="task-7"]');
  const task8Item1 = Selector('li[data-test-id="task-7-item-0"]');

  await t
    .expect(task8.exists).ok()
    .expect(await extractInnerText(task8.find('h2 span'))).eql('8.')
    .expect(await extractInnerText(task8.find('h2 div'))).eql('Indicate funding source')
    .expect(task8Item1.exists).ok()
    .expect(await extractInnerText(task8Item1.find('span'))).eql('Explain how you\'re paying for this order');
});

test('should render task 8 item 1 as text if recipients saved and count 1', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 1 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task8Item1 = Selector('li[data-test-id="task-7-item-0"]');

  await t
    .expect(task8Item1.find('a').exists).notOk();
});

test('should render task 8 item 1 as text if recipients saved, catalogue solution saved, additional service saved and associated service saved', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete' },
    { id: 'catalogue-solutions', status: 'complete' },
    { id: 'additional-services', status: 'complete' },
    { id: 'associated-services', status: 'complete' },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task8Item1 = Selector('li[data-test-id="task-7-item-0"]');

  await t
    .expect(task8Item1.find('a').exists).notOk();
});

test('should only render task 8 item 1 as a link if recipients saved and count 0, associated service saved and count 1', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 0 },
    { id: 'associated-services', status: 'complete', count: 1 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task8Item1 = Selector('li[data-test-id="task-7-item-0"]');

  await t
    .expect(task8Item1.find('a').exists).ok()
    .click(task8Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/funding-source`);
});

test('should only render task 8 item 1 as a link if recipients saved and count 1, Catalogue solution saved and count 0 and associated service saved and count 1', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 1 },
    { id: 'catalogue-solutions', status: 'complete', count: 0 },
    { id: 'associated-services', status: 'complete', count: 1 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task8Item1 = Selector('li[data-test-id="task-7-item-0"]');

  await t
    .expect(task8Item1.find('a').exists).ok()
    .click(task8Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/funding-source`);
});

test('should render task 8 item 1 as text if recipients saved and count 0, Catalogue solution saved and count 0 and associated service saved and count 0', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 0 },
    { id: 'catalogue-solutions', status: 'complete', count: 0 },
    { id: 'associated-services', status: 'complete', count: 0 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task8Item1 = Selector('li[data-test-id="task-7-item-0"]');

  await t
    .expect(task8Item1.find('a').exists).notOk();
});

test('should only render task 8 item 1 as a link if recipients saved and count 1, Catalogue solution saved and count 1 and associated service saved and count 1', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([
    { id: 'ordering-party', status: 'complete' },
    { id: 'supplier', status: 'complete' },
    { id: 'commencement-date', status: 'complete' },
    { id: 'service-recipients', status: 'complete', count: 1 },
    { id: 'catalogue-solutions', status: 'complete', count: 1 },
    { id: 'associated-services', status: 'complete', count: 1 },
  ]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task8Item1 = Selector('li[data-test-id="task-7-item-0"]');

  await t
    .expect(task8Item1.find('a').exists).ok()
    .click(task8Item1.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/funding-source`);
});

test('should not render the complete tag for task 8 item 1 when returned as incomplete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'funding-source', status: 'incomplete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task8Item1CompleteTag = Selector('[data-test-id="task-7-item-0-complete-tag"]');

  await t
    .expect(task8Item1CompleteTag.exists).notOk();
});

test('should only render the complete tag for task 8 item 1 when returned as complete from the API', async (t) => {
  const mockOrderSummary = generateMockOrderSummary([{ id: 'funding-source', status: 'complete' }]);
  await pageSetup({ ...defaultPageSetup, mockData: mockOrderSummary });
  await t.navigateTo(pageUrl);

  const task8Item1CompleteTag = Selector('[data-test-id="task-7-item-0-complete-tag"]');

  await t
    .expect(task8Item1CompleteTag.exists).ok();
});

// Buttons tests
test('should render the "Delete order" button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const deleteOrderButton = Selector('[data-test-id="delete-order-button"]');

  await t
    .expect(await extractInnerText(deleteOrderButton)).eql(commonContent.deleteOrderButton.text)
    .expect(deleteOrderButton.getAttribute('aria-label')).eql(commonContent.deleteOrderButton.text)
    .expect(deleteOrderButton.find('a').hasClass('nhsuk-button--secondary')).eql(true)
    .expect(deleteOrderButton.find('a').hasClass('nhsuk-button--disabled')).eql(false);
});

test('should render the "Preview order summary" button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const previewOrderButton = Selector('[data-test-id="preview-order-button"]');

  await t
    .expect(await extractInnerText(previewOrderButton)).eql(commonContent.previewOrderButton.text)
    .expect(previewOrderButton.getAttribute('aria-label')).eql(commonContent.previewOrderButton.text)
    .expect(previewOrderButton.find('a').hasClass('nhsuk-button--secondary')).eql(true)
    .expect(previewOrderButton.find('a').hasClass('nhsuk-button--disabled')).eql(false)
    .expect(previewOrderButton.find('a').getAttribute('href')).eql(`${baseUrl}/organisation/order-id/preview`);
});

test('should render the "Complete order" button', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const completeOrderButton = Selector('[data-test-id="complete-order-button"]');
  const submitOrderButtonLink = completeOrderButton.find('a');

  await t
    .expect(await extractInnerText(completeOrderButton)).eql(commonContent.completeOrderButton.text)
    .expect(completeOrderButton.getAttribute('aria-label')).eql(commonContent.completeOrderButton.disabledAltText)
    .expect(submitOrderButtonLink.hasClass('nhsuk-button--secondary')).eql(false)
    .expect(submitOrderButtonLink.hasClass('nhsuk-button--disabled')).eql(true);
});

test('should enable the "Complete order" button when sectionStatus is "complete"', async (t) => {
  const mockCompleteOrderSummary = {
    ...mockExistingOrderSummary,
    sectionStatus: 'complete',
  };
  await pageSetup({ ...defaultPageSetup, mockData: mockCompleteOrderSummary });
  await t.navigateTo(pageUrl);

  const completeOrderButton = Selector('[data-test-id="complete-order-button"]');
  const submitOrderButtonLink = completeOrderButton.find('a');

  await t
    .expect(await extractInnerText(completeOrderButton)).eql(commonContent.completeOrderButton.text)
    .expect(completeOrderButton.getAttribute('aria-label')).eql(commonContent.completeOrderButton.disabledAltText)
    .expect(submitOrderButtonLink.hasClass('nhsuk-button--secondary')).eql(false)
    .expect(submitOrderButtonLink.hasClass('nhsuk-button--disabled')).eql(false)
    .expect(completeOrderButton.find('a').getAttribute('href')).eql(`${baseUrl}/organisation/order-id/complete-order`);
});
