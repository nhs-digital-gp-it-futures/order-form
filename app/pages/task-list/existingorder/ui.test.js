import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import commonContent from '../commonManifest.json';
import existingorderPageContent from './manifest.json';
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
    .expect(await extractInnerText(title)).eql(`${existingorderPageContent.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="order-id-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(existingorderPageContent.description);
});

test('should render the order description details', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const orderDescriptionTitle = Selector('h3[data-test-id="order-id-order-description-title"]');
  const orderDescription = Selector('h4[data-test-id="order-id-order-description"]');

  await t
    .debug()
    .expect(orderDescriptionTitle.exists).ok()
    .expect(await extractInnerText(orderDescriptionTitle)).eql(existingorderPageContent.orderDescriptionTitle)
    .expect(orderDescription.exists).ok()
    .expect(await extractInnerText(orderDescription)).eql(mockExistingOrder.description);
});

test('should render the first task and tag it as complete', async (t) => {
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

test('should render the second task with call off party info as link not text', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const taskList = Selector('[data-test-id="task-list"]');
  const secondTask = Selector('li[data-test-id="task-1"]');
  const secondTaskFirstItem = Selector('li[data-test-id="task-1-item-0"]');

  await t
    .expect(taskList.exists).ok()
    .expect(secondTask.exists).ok()
    .expect(await extractInnerText(secondTask.find('h2 span'))).eql('2.')
    .expect(await extractInnerText(secondTask.find('h2 div'))).eql('Organisation information')
    .expect(secondTaskFirstItem.exists).ok()
    .expect(await extractInnerText(secondTaskFirstItem)).eql('Provide Call-off Ordering Party information')
    .expect(secondTaskFirstItem.find('a').exists).ok()
    .click(secondTaskFirstItem.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/call-off-ordering-party`);
});

test('should render the "Delete order" button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const deleteOrderButton = Selector('[data-test-id="delete-order-button"]');

  await t
    .expect(deleteOrderButton.exists).ok()
    .expect(await extractInnerText(deleteOrderButton)).eql(commonContent.deleteOrderButton.text)
    .expect(deleteOrderButton.getAttribute('aria-label')).eql(commonContent.deleteOrderButton.text)
    .expect(deleteOrderButton.find('a').hasClass('nhsuk-button--secondary')).eql(true)
    .expect(deleteOrderButton.find('a').hasClass('nhsuk-button--disabled')).eql(false);
});

test('should render the "Preview order summary" button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const previewOrderButton = Selector('[data-test-id="preview-order-button"]');

  await t
    .expect(previewOrderButton.exists).ok()
    .expect(await extractInnerText(previewOrderButton)).eql(commonContent.previewOrderButton.text)
    .expect(previewOrderButton.getAttribute('aria-label')).eql(commonContent.previewOrderButton.text)
    .expect(previewOrderButton.find('a').hasClass('nhsuk-button--secondary')).eql(true)
    .expect(previewOrderButton.find('a').hasClass('nhsuk-button--disabled')).eql(false);
});

test('should render the "Submit order" button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const submitOrderButton = Selector('[data-test-id="submit-order-button"]');

  await t
    .expect(submitOrderButton.exists).ok()
    .expect(await extractInnerText(submitOrderButton)).eql(commonContent.submitOrderButton.text)
    .expect(submitOrderButton.getAttribute('aria-label')).eql(commonContent.submitOrderButton.disabledAltText)
    .expect(submitOrderButton.find('a').hasClass('nhsuk-button--secondary')).eql(false)
    .expect(submitOrderButton.find('a').hasClass('nhsuk-button--disabled')).eql(true);
});
