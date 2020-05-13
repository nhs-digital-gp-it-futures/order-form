import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from '../../../test-utils/helper';
import content from './manifest.json';
import { baseUrl, orderApiUrl } from '../../../config';

const mockExistingOrder = {
  orderId: 'order-id',
  description: 'Some description',
  sections: [
    {
      id: 'description',
      status: 'complete',
    },
  ],
};

const pageUrl = 'http://localhost:1234/organisation/order-id';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113',
    name: 'Cool Dude',
    ordering: 'manage',
    primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/summary')
    .reply(200, mockExistingOrder);
};

const pageSetup = async (t, withAuth = false) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('existingorder task-list page')
  .page('http://localhost:1234/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
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

test('should render existingorder task-list page', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="order-id-page"]');

  await t
    .expect(page.exists).ok();
});

test(`should navigate to ${baseUrl}/organisation when click Back`, async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .expect(goBackLink.getAttribute('href')).eql(`${baseUrl}/organisation`);
});

test('should render the title', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="order-id-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="order-id-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the order description details', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const orderDescriptionTitle = Selector('h3[data-test-id="order-id-order-description-title"]');
  const orderDescription = Selector('h4[data-test-id="order-id-order-description"]');

  await t
    .expect(orderDescriptionTitle.exists).ok()
    .expect(await extractInnerText(orderDescriptionTitle)).eql(content.orderDescriptionTitle)
    .expect(orderDescription.exists).ok()
    .expect(await extractInnerText(orderDescription)).eql(mockExistingOrder.description);
});

test('should render the first task as tag it as complete', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const taskList = Selector('[data-test-id="task-list"]');
  const firstTask = Selector('li[data-test-id="task-0"]');
  const firstTaskFirstItem = Selector('li[data-test-id="task-0-item-0"]');
  const firstTaskFirstItemCompleteTag = Selector('[data-test-id="task-0-item-0-complete-tag"]');

  await t
    .expect(taskList.exists).ok()
    .expect(firstTask.exists).ok()
    .expect(await extractInnerText(firstTask.find('h2 span'))).eql('1.')
    .expect(await extractInnerText(firstTask.find('h2 div'))).eql('Start your order')
    .expect(firstTaskFirstItem.exists).ok()
    .expect(await extractInnerText(firstTaskFirstItem.find('a'))).eql('Provide a description of your order')
    .expect(firstTaskFirstItem.find('a').getAttribute('href')).eql(`${baseUrl}/organisation/order-id/description`)
    .expect(firstTaskFirstItemCompleteTag.exists).ok()
    .click(firstTaskFirstItem.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/description`);
});
