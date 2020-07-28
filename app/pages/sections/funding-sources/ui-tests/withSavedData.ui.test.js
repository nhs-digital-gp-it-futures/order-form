import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { orderApiUrl } from '../../../../config';
import { nockAndErrorCheck, setState, authTokenInSession } from '../../../../test-utils/uiTestHelper';

const pageUrl = 'http://localhost:1234/order/organisation/order-id/funding-sources';

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/funding-source')
    .reply(200, { onlyGMS: true });
};

const pageSetup = async (setup = { withAuth: true, getRoute: true }) => {
  if (setup.withAuth) {
    await setState(ClientFunction)('fakeToken', authTokenInSession);
  }
  if (setup.getRoute) {
    mocks();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Funding source page - with saved data')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    await nockAndErrorCheck(nock, t);
  });

test('should check the radio button with data is returned from api', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const selectFundingSourceRadioOptions = Selector('[data-test-id="question-selectFundingSource"]');

  await t
    .expect(selectFundingSourceRadioOptions.find('.nhsuk-radios__item:nth-child(1)').find('input:checked').exists).ok()
    .expect(selectFundingSourceRadioOptions.find('.nhsuk-radios__item:nth-child(2)').find('input:checked').exists).notOk();
});

test('should navigate to task list page when a different option is selected and save is clicked', async (t) => {
  nock(orderApiUrl)
    .put('/api/v1/orders/order-id/funding-source', { onlyGMS: false })
    .reply(200, {});

  await pageSetup();
  await t.navigateTo(pageUrl);

  const selectFundingSourceRadioOptions = Selector('[data-test-id="question-selectFundingSource"]');
  const button = Selector('[data-test-id="save-button"] button');

  await t
    .click(selectFundingSourceRadioOptions.find('input').nth(1))
    .click(button)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-id');
});
