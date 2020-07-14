import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../../../config';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/additional-services';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1/order-items?catalogueItemType=AdditionalServices')
    .reply(200, { });

  nock(orderApiUrl)
    .get('/api/v1/orders/order-1/sections/description')
    .reply(200, { description: 'Some order' });
};

const pageSetup = async () => {
  mocks();
  await setCookies();
};

fixture('Additional Servies - Dashbaord page - without saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    if (process.env.NOCK_CHECK) {
      const isDone = nock.isDone();
      if (!isDone) {
        // eslint-disable-next-line no-console
        console.log(`pending mocks: ${nock.pendingMocks()}`);
        nock.cleanAll();
      }

      await t.expect(isDone).ok('Not all nock interceptors were used!');
    }
  });

test('should render the No additional services text when no order items are returned from ORDAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const noAddedOrderItems = Selector('[data-test-id="no-added-orderItems"]');

  await t
    .expect(noAddedOrderItems.exists).ok()
    .expect(await extractInnerText(noAddedOrderItems)).eql(content.noOrderItemsText);
});
