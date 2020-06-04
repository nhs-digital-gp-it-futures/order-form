import manifest from './manifest.json';
import { getContext } from './contextCreator';
import { baseUrl } from '../../../config';

const orderId = 'order-id';
const serviceRecipientsData = [
  {
    name: 'Some service recipient 1',
    odsCode: 'ods1',
  },
  {
    name: 'Some service recipient 2',
    odsCode: 'ods2',
  },
];

describe('service-recipients contextCreator', () => {
  describe('getContext', () => {
    it('should return the contents of manifest', () => {
      const context = getContext({});
      expect(context.backLinkText).toEqual(manifest.backLinkText);
      expect(context.description).toEqual(manifest.description);
      expect(context.insetAdvice).toEqual(manifest.insetAdvice);
      expect(context.selectDeselectButton.selectText)
        .toEqual(manifest.selectDeselectButton.selectText);
      expect(context.selectDeselectButton.deselectText)
        .toEqual(manifest.selectDeselectButton.deselectText);
      expect(context.organisationHeading).toEqual(manifest.organisationHeading);
      expect(context.odsCodeHeading).toEqual(manifest.odsCodeHeading);
      expect(context.continueButtonText).toEqual(manifest.continueButtonText);
    });

    it('should construct the title', () => {
      const context = getContext({ orderId });
      expect(context.title).toEqual('Service Recipients for order-id');
    });

    it('should construct the backLinkHref', () => {
      const context = getContext({ orderId });
      expect(context.backLinkHref).toEqual(`${baseUrl}/organisation/${orderId}`);
    });

    it('should construct the tableDate whenever serviceRecipientsData is provided ', () => {
      const context = getContext({ orderId, serviceRecipientsData });
      expect(context.tableData.length).toEqual(serviceRecipientsData.length);
      expect(context.tableData[0].organisationName.id).toEqual('ods1');
      expect(context.tableData[0].organisationName.name).toEqual('ods1');
      expect(context.tableData[0].organisationName.value).toEqual('Some service recipient 1');
      expect(context.tableData[0].organisationName.text).toEqual('Some service recipient 1');
      expect(context.tableData[0].organisationName.checked).toEqual(false);
      expect(context.tableData[0].odsCode).toEqual('ods1');

      expect(context.tableData[1].organisationName.id).toEqual('ods2');
      expect(context.tableData[1].organisationName.name).toEqual('ods2');
      expect(context.tableData[1].organisationName.value).toEqual('Some service recipient 2');
      expect(context.tableData[1].organisationName.text).toEqual('Some service recipient 2');
      expect(context.tableData[1].organisationName.checked).toEqual(false);
      expect(context.tableData[1].odsCode).toEqual('ods2');
    });
  });
});
