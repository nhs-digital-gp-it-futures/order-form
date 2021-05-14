import manifest from './manifest.json';
import { getContext, getErrorContext } from './contextCreator';
import { baseUrl } from '../../../../../../config';

const orderId = 'order-id';
const itemName = 'Solution One';
const serviceRecipientsData = [{
  name: 'Some service recipient 1',
  odsCode: 'ods1',
}, {
  name: 'Some service recipient 2',
  odsCode: 'ods2',
}];

const selectedRecipientIdsData = ['ods2'];

describe('service-recipients contextCreator', () => {
  describe('getContext', () => {
    const odsCode = '03F';
    
    it('should return the contents of manifest', () => {
      const context = getContext({ manifest });
      expect(context.backLinkText).toEqual(manifest.backLinkText);
      expect(context.description).toEqual(manifest.description);
      expect(context.organisationHeading).toEqual(manifest.organisationHeading);
      expect(context.odsCodeHeading).toEqual(manifest.odsCodeHeading);
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });

    it('should construct the title', () => {
      const context = getContext({ orderId, itemName, manifest });
      expect(context.title).toEqual('Service Recipients for Solution One for order-id');
    });

    it('should construct the backLinkHref when solutionPrices contain 1', () => {
      const context = getContext({
        orderId, solutionPrices: { prices: [{}] }, manifest, orderType: 'catalogue-solutions', odsCode,
      });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/select/solution`);
    });

    it('should construct the backLinkHref when solutionPrices contain not 1', () => {
      const context = getContext({
        orderId, solutionPrices: [{}, {}], manifest, orderType: 'catalogue-solutions', odsCode,
      });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${odsCode}/order/${orderId}/catalogue-solutions/select/solution/price`);
    });

    it('should construct the description', () => {
      const context = getContext({ orderId, itemName, manifest });
      expect(context.description).toEqual('These are all the possible Service Recipients for this Call-off Ordering Party. Select those you’ll be ordering this Catalogue Solution for.');
    });

    it('should construct the tableData whenever serviceRecipientsData is provided with no selected recipients', () => {
      const context = getContext({ orderId, serviceRecipientsData, manifest });

      const { recipientsTable } = context.question.selectSolutionRecipients;
      expect(recipientsTable.items.length).toEqual(serviceRecipientsData.length);
      expect(recipientsTable.items[0][0].question.id).toEqual('ods1-organisationName');
      expect(recipientsTable.items[0][0].question.name).toEqual('ods1');
      expect(recipientsTable.items[0][0].question.value).toEqual('Some service recipient 1');
      expect(recipientsTable.items[0][0].question.text).toEqual('Some service recipient 1');
      expect(recipientsTable.items[0][0].question.checked).toEqual(false);
      expect(recipientsTable.items[0][1].data).toEqual('ods1');

      expect(recipientsTable.items[1][0].question.id).toEqual('ods2-organisationName');
      expect(recipientsTable.items[1][0].question.name).toEqual('ods2');
      expect(recipientsTable.items[1][0].question.value).toEqual('Some service recipient 2');
      expect(recipientsTable.items[1][0].question.text).toEqual('Some service recipient 2');
      expect(recipientsTable.items[1][0].question.checked).toEqual(false);
      expect(recipientsTable.items[1][1].data).toEqual('ods2');
    });

    it('should construct the correct checked value when selected recipients data is available and selectStatus is undefined', () => {
      const context = getContext({
        orderId, serviceRecipientsData, selectedRecipientIdsData, manifest,
      });

      const { recipientsTable } = context.question.selectSolutionRecipients;
      expect(recipientsTable.items.length).toEqual(serviceRecipientsData.length);
      expect(recipientsTable.items[0][0].question.checked).toEqual(false);
      expect(recipientsTable.items[1][0].question.checked).toEqual(true);
    });

    it('should mark all checked as true when selectStatus = select', () => {
      const context = getContext({
        orderId, serviceRecipientsData, selectStatus: 'select', manifest,
      });

      const { recipientsTable } = context.question.selectSolutionRecipients;
      expect(recipientsTable.items.length).toEqual(serviceRecipientsData.length);
      expect(recipientsTable.items[0][0].question.checked).toEqual(true);
      expect(recipientsTable.items[1][0].question.checked).toEqual(true);
    });

    it('should mark all checked as true when selectStatus = select and data is found in ORDAPI', () => {
      const context = getContext({
        orderId, serviceRecipientsData, selectedRecipientIdsData, selectStatus: 'select', manifest,
      });

      const { recipientsTable } = context.question.selectSolutionRecipients;
      expect(recipientsTable.items.length).toEqual(serviceRecipientsData.length);
      expect(recipientsTable.items[0][0].question.checked).toEqual(true);
      expect(recipientsTable.items[1][0].question.checked).toEqual(true);
    });

    it('should mark all checked as false when selectStatus = deselect', () => {
      const context = getContext({
        orderId, serviceRecipientsData, selectStatus: 'deselect', manifest,
      });

      const { recipientsTable } = context.question.selectSolutionRecipients;
      expect(recipientsTable.items.length).toEqual(serviceRecipientsData.length);
      expect(recipientsTable.items[0][0].question.checked).toEqual(false);
      expect(recipientsTable.items[1][0].question.checked).toEqual(false);
    });

    it('should mark all checked as true when selectStatus = deselect and data is found in ORDAPI', () => {
      const context = getContext({
        orderId, serviceRecipientsData, selectedRecipientIdsData, selectStatus: 'deselect', manifest,
      });

      const { recipientsTable } = context.question.selectSolutionRecipients;
      expect(recipientsTable.items.length).toEqual(serviceRecipientsData.length);
      expect(recipientsTable.items[0][0].question.checked).toEqual(false);
      expect(recipientsTable.items[1][0].question.checked).toEqual(false);
    });
  });

  describe('getErrorContext', () => {
    it('should return the context with Errors', () => {
      const expectedContext = {
        errors: [
          {
            href: '#selectSolutionRecipients',
            text: manifest.errorMessages.SelectSolutionRecipientsRequired,
          },
        ],
        question: {
          selectSolutionRecipients: {
            errorMessages: [manifest.errorMessages.SelectSolutionRecipientsRequired],
          },
        },
      };

      const context = getErrorContext({
        orderId,
        serviceRecipientsData,
        validationErrors: [{ field: 'selectSolutionRecipients', id: 'SelectSolutionRecipientsRequired' }],
        manifest,
      });

      expect(context.errors).toEqual(expectedContext.errors);
      expect(context.question.selectSolutionRecipients.errorMessages)
        .toEqual(expectedContext.question.selectSolutionRecipients.errorMessages);
    });
  });
});
