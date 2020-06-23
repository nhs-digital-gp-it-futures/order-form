import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from '../manifest.json';
import { orderApiUrl } from '../../../config';
import { formatDate } from '../../../helpers/dateFormatter';

const pageUrl = 'http://localhost:1234/order/organisation/order-1/preview';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mockOrder = {
  description: 'some order description',
};

const mocks = () => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-1')
    .reply(200, mockOrder);
};

const pageSetup = async (withAuth = true) => {
  if (withAuth) {
    mocks();
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('Order Summary Preview - general')
  .page('http://localhost:1234/order/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await pageSetup(false);
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render Preview page', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="preview-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-1 when click on backlink', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1');
});

test('should render the title', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="preview-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${content.title} order-1`);
});

test('should render the description', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="preview-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render the orderDescription', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const orderDescriptionHeading = Selector('h3[data-test-id="order-description-heading"]');
  const orderDescription = Selector('h4[data-test-id="order-description"]');

  await t
    .expect(orderDescriptionHeading.exists).ok()
    .expect(await extractInnerText(orderDescriptionHeading)).eql(content.orderDescriptionHeading)
    .expect(orderDescription.exists).ok()
    .expect(await extractInnerText(orderDescription)).eql('some order description');
});

test('should render the date summary created', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const formattedCurrentDate = formatDate(new Date());
  const dateSummaryCreated = Selector('[data-test-id="date-summary-created"]');

  await t
    .expect(dateSummaryCreated.exists).ok()
    .expect(await extractInnerText(dateSummaryCreated)).eql(`${content.dateSummaryCreatedLabel} ${formattedCurrentDate}`);
});

test('should render the Call-off ordering party and supplier table with the column headings', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const calloffAndSupplierTable = Selector('[data-test-id="calloff-and-supplier"]');
  const calloffColumnHeading = calloffAndSupplierTable.find('[data-test-id="column-heading-0"]');
  const supplierColumnHeading = calloffAndSupplierTable.find('[data-test-id="column-heading-1"]');

  await t
    .expect(calloffAndSupplierTable.exists).ok()
    .expect(calloffColumnHeading.exists).ok()
    .expect(await extractInnerText(calloffColumnHeading)).eql('Call-off Ordering Party')

    .expect(supplierColumnHeading.exists).ok()
    .expect(await extractInnerText(supplierColumnHeading)).eql('Supplier');
});

test('should not render the Call-off ordering party and supplier details in the table when data not provided', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const calloffAndSupplierTable = Selector('[data-test-id="calloff-and-supplier"]');
  const calloffAndSupplierDetails = calloffAndSupplierTable.find('[data-test-id="table-row-0"]');
  const calloffPartyDetails = calloffAndSupplierDetails.find('div[data-test-id="call-off-party"]');
  const supplierDetails = calloffAndSupplierDetails.find('div[data-test-id="supplier"]');

  await t
    .expect(calloffAndSupplierDetails.exists).ok()
    .expect(calloffAndSupplierDetails.exists).ok()
    .expect(calloffPartyDetails.exists).notOk()
    .expect(supplierDetails.exists).notOk();
});

test('should render the commencement date label only when data not provided', async (t) => {
  await pageSetup();
  await t.navigateTo(pageUrl);

  const commencementDate = Selector('[data-test-id="commencement-date"]');

  await t
    .expect(commencementDate.exists).ok()
    .expect(await extractInnerText(commencementDate)).eql(`${content.commencementDateLabel}`);
});
