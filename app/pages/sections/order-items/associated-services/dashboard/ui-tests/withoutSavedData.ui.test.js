import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/associated-services';

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1/sections/description')
    .reply(200, { description: 'Some order' });
};

const pageSetup = async (setup = { withAuth: true, getRoute: true }) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
  }
};

fixture('Associated Servies - Dashbaord page - without saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should render the No associated services text when no order items are returned from ORDAPI', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const noAddedOrderItems = Selector('[data-test-id="no-added-orderItems"]');

  await t
    .expect(await extractInnerText(noAddedOrderItems)).eql(content.noOrderItemsText);
});
